import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import { updateTicketRegistration, getTicketDetails } from '../supabase';
import ConfirmationPopup from './ConfirmationPopup';
import ScanHistory from './ScanHistory';
import './QRScanner.css';

const QRScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' for rear, 'user' for front
  const scannerRef = useRef(null);

  useEffect(() => {
    // Load scan history from localStorage on component mount
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleScan = async (data) => {
    if (data && isScanning) {
      setIsScanning(false);
      
      // DEBUG: Log raw QR code data
      console.log('=== QR CODE DEBUG INFO ===');
      console.log('Raw QR code data:', data);
      console.log('Data type:', typeof data);
      console.log('Data length:', data ? (typeof data === 'string' ? data.length : 'Object') : 'N/A');
      console.log('Data preview (first 100 chars):', data && typeof data === 'string' ? data.substring(0, 100) : (data?.text ? data.text.substring(0, 100) : 'N/A'));
      
      try {
        // Extract the text from the QR code data object
        const qrText = data.text || data;
        console.log('Extracted QR text:', qrText);
        
        // Parse the QR code data
        const ticketData = JSON.parse(qrText);
        console.log('✅ Successfully parsed JSON:', ticketData);
        console.log('Ticket ID:', ticketData.ticketId);
        console.log('Name:', ticketData.name);
        console.log('Event:', ticketData.event);
        
        // Check if ticket exists in database
        console.log('🔍 Searching for ticket in database...');
        const { data: ticketDetails, error } = await getTicketDetails(ticketData.ticketId);
        
        console.log('Database response:', { ticketDetails, error });
        
        if (error) {
          console.error('❌ Error fetching ticket:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          alert('Error fetching ticket details. Please try again.');
          setIsScanning(true);
          return;
        }

        if (!ticketDetails) {
          console.log('❌ Ticket not found in database');
          alert('Ticket not found in database.');
          setIsScanning(true);
          return;
        }

        console.log('✅ Ticket found in database:', ticketDetails);
        console.log('Already registered?', ticketDetails.reregistered);

        if (ticketDetails.reregistered) {
          console.log('⚠️ Ticket already registered');
          alert('Ticket already scanned!');
          setIsScanning(true);
          return;
        }

        // Show confirmation popup
        console.log('✅ Showing confirmation popup');
        setScannedData(ticketData);
        setShowPopup(true);
        
      } catch (error) {
        console.error('❌ Error parsing QR code:', error);
        console.error('Parse error details:', {
          message: error.message,
          stack: error.stack
        });
        console.log('Raw data that failed to parse:', data);
        
        // Try to show what the data looks like
        if (data) {
          console.log('Attempting to identify data format...');
          if (data.startsWith('{')) {
            console.log('Data appears to be JSON but failed to parse');
          } else if (data.includes('http')) {
            console.log('Data appears to be a URL');
          } else {
            console.log('Data format unknown');
          }
        }
        
        alert('Invalid QR code format. Please scan a valid ticket.');
        setIsScanning(true);
      }
      
      console.log('=== END QR CODE DEBUG ===');
    }
  };

  const handleConfirm = async () => {
    if (!scannedData) return;

    try {
      console.log('🔄 Starting ticket registration update...');
      
      // Update ticket registration status
      const { data, error } = await updateTicketRegistration(scannedData.ticketId);
      
      if (error) {
        console.error('❌ Update failed:', error);
        throw error;
      }

      console.log('✅ Database update successful:', data);

      // Add to scan history
      const newHistoryItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        name: scannedData.name,
        event: scannedData.event,
        status: 'success'
      };

      const updatedHistory = [newHistoryItem, ...scanHistory];
      setScanHistory(updatedHistory);
      localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));

      // Close popup and resume scanning
      setShowPopup(false);
      setScannedData(null);
      setIsScanning(true);
      
      alert('Ticket successfully registered!');
      
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Error registering ticket. Please try again.');
      setShowPopup(false);
      setScannedData(null);
      setIsScanning(true);
    }
  };

  const handleCancel = () => {
    setShowPopup(false);
    setScannedData(null);
    setIsScanning(true);
  };


  const toggleCamera = () => {
    setFacingMode(prevMode => prevMode === 'environment' ? 'user' : 'environment');
    // Restart scanning with new camera
    setIsScanning(false);
    setTimeout(() => {
      setIsScanning(true);
    }, 100);
  };

  const refreshScanner = () => {
    setIsScanning(true);
    setScannedData(null);
  };

  return (
    <div className="qr-scanner-container">
      {/* Camera View */}
      <div className="camera-container">
        {isScanning && (
          <QrScanner
            ref={scannerRef}
            delay={300}
            style={{
              height: '100%',
              width: '100%',
            }}
            onScan={handleScan}
            onError={(err) => {
              console.error('QR Scanner error:', err);
            }}
            constraints={{
              facingMode: facingMode
            }}
          />
        )}
        
        {/* Camera swap button */}
        <button 
          className="camera-swap-button"
          onClick={toggleCamera}
          title={`Switch to ${facingMode === 'environment' ? 'front' : 'rear'} camera`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 8H20C20.5304 8 21.0391 8.21071 21.4142 8.58579C21.7893 8.96086 22 9.46957 22 10V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V10C2 9.46957 2.21071 8.96086 2.58579 8.58579C2.96086 8.21071 3.46957 8 4 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 4H8C7.46957 4 6.96086 4.21071 6.58579 4.58579C6.21071 4.96086 6 5.46957 6 6V8H18V6C18 5.46957 17.7893 4.96086 17.4142 4.58579C17.0391 4.21071 16.5304 4 16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 13L17 15L19 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 13L7 15L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Instruction text */}
      <div className="instruction-text">
        Scan QR Code dengan Kamera Anda
      </div>

      {/* Scan History */}
      <ScanHistory history={scanHistory} />

      {/* Footer */}
      <div className="footer">
        <div className="footer-text">Created To Connect</div>
        <div className="footer-text">Coach Sky</div>
      </div>

      {/* Confirmation Popup */}
      {showPopup && scannedData && (
        <ConfirmationPopup
          ticketData={scannedData}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default QRScanner;
