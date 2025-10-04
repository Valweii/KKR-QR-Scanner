import React from 'react';
import './ScanHistory.css';

const ScanHistory = ({ history }) => {
  const getStatusColor = (status) => {
    return status === 'success' ? '#4CAF50' : '#9C27B0';
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? '✓' : '⚠';
  };

  return (
    <div className="scan-history">
      <h2 className="history-title">History Scan</h2>
      <div className="history-list">
        {history.length === 0 ? (
          <div className="no-history">No scans yet</div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="history-item">
              <div 
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(item.status) }}
              >
                {getStatusIcon(item.status)}
              </div>
              <div className="item-content">
                <div className="item-time">{item.timestamp}</div>
                <div className="item-event">{item.event}</div>
                <div className="item-name">{item.name}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScanHistory;
