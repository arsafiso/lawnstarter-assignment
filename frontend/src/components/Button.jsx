import '../styles/Button.css';

function Button({ variant = 'default', children, onClick, disabled = false, ...props }) {
  const variants = {
    'detail': 'details-button',
    'button-primary': 'button-primary',
    'sticky-back': 'back-to-search'
  }

  const buttonClass = variants[variant] || 'btn-back';

  return (
    <button
      {...props}
      className={`button ${buttonClass} ${props.className || ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
