import React from 'react';
import '../../styles/Loader.css'; //fix file path here

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loader: React.FC<LoaderProps> = ({ message = 'Running simulation...', size = 'md' }) => {
  return (
    <div className={`loader-wrapper loader-wrapper--${size}`}>
      <div className="loader-ring">
        <div className="loader-ring-inner" />
        <div className="loader-dot" />
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
};

export default Loader;