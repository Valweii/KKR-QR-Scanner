import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import { updateTicketRegistration, getTicketDetails } from '../supabase';
import ConfirmationPopup from './ConfirmationPopup';
import ScanHistory from './ScanHistory';
import { playBeepFromFile } from '../utils/soundEffects';
import './QRScanner.css';

const QRScanner = () => {
  const [scanHistory, setScanHistory] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [showCameraDropdown, setShowCameraDropdown] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', name: string }
  const [showPopup, setShowPopup] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Load scan history from localStorage on component mount
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }

    // Get list of available cameras
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available cameras:', videoDevices);
        setCameras(videoDevices);
        
        // Set default to rear camera if available
        const rearCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        
        if (rearCamera) {
          setSelectedCamera(rearCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting cameras:', error);
      }
    };

    getCameras();
  }, []);

  const handleScan = async (data) => {
    // Check if we're already processing using ref for immediate check
    if (!data || isProcessingRef.current) {
      if (isProcessingRef.current) {
        console.log('⏸️ Scan blocked - already processing');
      }
      return;
    }
    
    // Extract the text from the QR code data object
    const qrText = data.text || data;
    
    try {
      // Parse the QR code data
      const ticketData = JSON.parse(qrText);
      
      // Mark as processing IMMEDIATELY to prevent duplicate scans (both ref and state)
      isProcessingRef.current = true;
      setIsProcessing(true);
      
      console.log('=== QR CODE SCAN START ===');
      console.log('Ticket ID:', ticketData.ticketId);
      console.log('Name:', ticketData.name);
      console.log('Event:', ticketData.event);
      
      // Check if ticket exists in database
      console.log('🔍 Searching for ticket in database...');
      const { data: ticketDetails, error } = await getTicketDetails(ticketData.ticketId);
      
      console.log('Database response:', { ticketDetails, error });
      
        if (error) {
          console.error('❌ Error fetching ticket:', error);
          isProcessingRef.current = false;
          setIsProcessing(false);
          return;
        }

        if (!ticketDetails) {
          console.log('❌ Ticket not found in database');
          isProcessingRef.current = false;
          setIsProcessing(false);
          return;
        }

        console.log('✅ Ticket found in database:', ticketDetails);
        console.log('Already registered?', ticketDetails.reregistered);

      if (ticketDetails.reregistered) {
        console.log('⚠️ Ticket already registered');
        
        // Show error notification
        setNotification({ type: 'error', name: ticketData.name });
        setTimeout(() => setNotification(null), 3000);
        
        // Reset processing state - camera stays active
        isProcessingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // Play beep sound on successful scan
      playBeepFromFile();
      
      // Show confirmation popup
      console.log('✅ Showing confirmation popup');
      setScannedData(ticketData);
      setShowPopup(true);
      // Note: isProcessing stays true while popup is showing to prevent re-scanning
      
    } catch (error) {
      console.error('❌ Invalid QR code format');
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!scannedData) return;

    try {
      console.log('🔄 Registering ticket:', scannedData.ticketId);
      
      // Update ticket registration status
      const { data, error } = await updateTicketRegistration(scannedData.ticketId);
      
      if (error) {
        console.error('❌ Update failed:', error);
        throw error;
      }

      console.log('✅ Ticket registered successfully');

      // Show success notification
      setNotification({ type: 'success', name: scannedData.name });
      setTimeout(() => setNotification(null), 3000);

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

      // Close popup and reset - camera stays active
      setShowPopup(false);
      setScannedData(null);
      isProcessingRef.current = false;
      setIsProcessing(false);
      
      console.log('✅ Ready for next scan');
      
    } catch (error) {
      console.error('❌ Error registering ticket:', error);
      
      // Show error notification
      setNotification({ type: 'error', name: scannedData.name });
      setTimeout(() => setNotification(null), 3000);
      
      // Close popup and reset
      setShowPopup(false);
      setScannedData(null);
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    console.log('🚫 Cancel - resetting scanner');
    setShowPopup(false);
    setScannedData(null);
    isProcessingRef.current = false;
    setIsProcessing(false);
    console.log('✅ Ready for next scan');
  };



  const handleCameraChange = (deviceId) => {
    // Stop scanning first
    setIsScanning(false);
    setShowCameraDropdown(false);
    
    // Then switch camera and restart after a delay
    setTimeout(() => {
      setSelectedCamera(deviceId);
      
      // Wait a bit longer before restarting to ensure camera is released
      setTimeout(() => {
        setIsScanning(true);
      }, 200);
    }, 100);
  };

  const refreshScanner = () => {
    console.log('🔄 Refreshing scanner');
    setIsScanning(true);
    isProcessingRef.current = false;
    setIsProcessing(false);
  };

  return (
    <div className="qr-scanner-container">
      {/* Camera View */}
      <div className="camera-container">
        {isScanning && (
          <QrScanner
            key={selectedCamera}
            ref={scannerRef}
            delay={300}
            constraints={{
              video: selectedCamera ? { deviceId: { exact: selectedCamera } } : { facingMode: 'environment' }
            }}
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
        
        {/* Scanning frame overlay */}
        <div className="scan-frame-overlay">
          <div className="scan-frame">
            <div className="corner corner-top-left"></div>
            <div className="corner corner-top-right"></div>
            <div className="corner corner-bottom-left"></div>
            <div className="corner corner-bottom-right"></div>
            <div className="scanning-line"></div>
          </div>
          <div className="scan-instruction">Place the code inside the frame</div>
        </div>
        
        {/* Camera selection dropdown */}
        <div className="camera-selector">
          <button 
            className="camera-dropdown-button"
            onClick={() => setShowCameraDropdown(!showCameraDropdown)}
            title="Select camera"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 8H20C20.5304 8 21.0391 8.21071 21.4142 8.58579C21.7893 8.96086 22 9.46957 22 10V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V10C2 9.46957 2.21071 8.96086 2.58579 8.58579C2.96086 8.21071 3.46957 8 4 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 4H8C7.46957 4 6.96086 4.21071 6.58579 4.58579C6.21071 4.96086 6 5.46957 6 6V8H18V6C18 5.46957 17.7893 4.96086 17.4142 4.58579C17.0391 4.21071 16.5304 4 16 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {showCameraDropdown && cameras.length > 0 && (
            <div className="camera-dropdown-menu">
              {cameras.map((camera, index) => (
                <button
                  key={camera.deviceId}
                  className={`camera-option ${selectedCamera === camera.deviceId ? 'active' : ''}`}
                  onClick={() => handleCameraChange(camera.deviceId)}
                >
                  {camera.label || `Camera ${index + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instruction text */}
      <div className="instruction-text">
        Scan QR Code dengan Kamera Anda
      </div>

      {/* Scan History */}
      <ScanHistory history={scanHistory} notification={notification} />

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
