import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="error-code">403</div>
        <h1>Access Denied</h1>
        <p>You do not have permission to access this resource.</p>
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};
