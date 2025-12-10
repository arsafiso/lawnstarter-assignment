import '../styles/Header.css';
import BackButton from './BackButton';
import { useRef, useEffect } from 'react';

function Header({ showBack, onBack }) {
  const headerRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      const height = headerRef.current.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }, [showBack]);

  return (
    <header className="header" ref={headerRef}>
      <div className="header-content">
        {showBack ? <BackButton onClick={onBack} /> : <div style={{ width: 32 }}></div>}
        <div className="logo">SWStarter</div>
        <div style={{ width: 32 }}></div>
      </div>
    </header>
  );
}

export default Header;
