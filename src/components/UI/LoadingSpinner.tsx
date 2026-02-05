import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className='spinner-overlay'>
      <img src="/icons/Bungeobbang.png" className='bungeo-spinner' alt="loading" />
      <p style={{ marginTop: "20px", fontWeight: "bold", color: "#f8c967" }}>
        붕어빵 굽는 중... 🐟
      </p>
    </div>
  );
};

export default LoadingSpinner;