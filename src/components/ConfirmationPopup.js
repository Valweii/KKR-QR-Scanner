import React from 'react';
import './ConfirmationPopup.css';

const ConfirmationPopup = ({ ticketData, onConfirm, onCancel }) => {
  if (!ticketData) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h3>Confirm Registration</h3>
        </div>
        
        <div className="popup-body">
          <div className="ticket-info">
            <div className="info-row">
              <span className="label">Name:</span>
              <span className="value">{ticketData.nama}</span>
            </div>
            
            <div className="info-row">
              <span className="label">Universitas:</span>
              <span className="value">{ticketData.universitas}</span>
            </div>
            
            {ticketData.domisili && (
              <div className="info-row">
                <span className="label">Domisili:</span>
                <span className="value">{ticketData.domisili}</span>
              </div>
            )}
            
            {ticketData.usia && (
              <div className="info-row">
                <span className="label">Usia:</span>
                <span className="value">{ticketData.usia}</span>
              </div>
            )}
            
            {ticketData.no_telp && (
              <div className="info-row">
                <span className="label">Phone:</span>
                <span className="value">{ticketData.no_telp}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="popup-actions">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Confirm Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
