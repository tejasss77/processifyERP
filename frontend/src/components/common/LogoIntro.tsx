import React, { useState, useEffect } from 'react';
import logoTransparent from '../../assets/logo-transparent.png';

export const LogoIntro: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [visible, setVisible] = useState<boolean>(() => {
    const shown = sessionStorage.getItem('processify_intro_shown');
    return !shown;
  });

  useEffect(() => {
    if (visible) {
      sessionStorage.setItem('processify_intro_shown', 'true');
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div className="splash-container">
      <div className="splash-logo-box">
        <img src={logoTransparent} alt="ProcessifyERP Logo" className="splash-logo-img" style={{ width: 'auto', height: '64px', objectFit: 'contain' }} />
        <span className="splash-brand-text">ProcessifyERP</span>
      </div>
    </div>
  );
};
