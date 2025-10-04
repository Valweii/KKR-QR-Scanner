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
              <span className="value">{ticketData.name}</span>
            </div>
            
            <div className="info-row">
              <span className="label">Event:</span>
              <span className="value">{ticketData.event}</span>
            </div>
            
            {ticketData.cgMember && (
              <div className="info-row">
                <span className="label">CG Number:</span>
                <span className="value">{ticketData.cgNumber}</span>
              </div>
            )}
            
            {ticketData.instagram && (
              <div className="info-row">
                <span className="label">Instagram:</span>
                <span className="value">{ticketData.instagram}</span>
              </div>
            )}
            
            {ticketData.phone && (
              <div className="info-row">
                <span className="label">Phone:</span>
                <span className="value">{ticketData.phone}</span>
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
