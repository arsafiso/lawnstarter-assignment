import { useNavigate } from 'react-router-dom';

function BackButton({ onClick }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) return onClick();
    navigate(-1);
  };

  return (
    <button className="back-button" onClick={handleBack}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

export default BackButton;
