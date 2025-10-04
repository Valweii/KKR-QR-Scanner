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
  const [flashOn, setFlashOn] = useState(false);
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

  const toggleFlash = () => {
    setFlashOn(!flashOn);
    // Note: Flash control would need to be implemented based on the QR scanner library capabilities
  };

  const refreshScanner = () => {
    setIsScanning(true);
    setScannedData(null);
  };

  return (
    <div className="qr-scanner-container">
      {/* Header */}
      <div className="header">
        <button className="back-button" onClick={() => window.history.back()}>
          ←
        </button>
        <h1 className="header-title">Scan Ticket</h1>
        <button className="refresh-button" onClick={refreshScanner}>
          ↻
        </button>
      </div>

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
          />
        )}
        
        {/* Flash toggle button */}
        <button 
          className={`flash-button ${flashOn ? 'active' : ''}`}
          onClick={toggleFlash}
        >
          🔦
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
        <div className="footer-text">AOG Conference 2025 - AOG Conference</div>
        <div className="footer-text">GMS Puri</div>
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
