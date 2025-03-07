import { useNavigate } from 'react-router-dom';

const Header = ({ currentUser }) => {
  const navigate = useNavigate(); // Hook for navigation

  const handleHeaderClick = () => {
    if (currentUser) {
      navigate('/home'); // Navigate to HomePage if logged in
    } else {
      navigate('/starter'); // Navigate to StarterPage if not logged in
    }
  };

  return (
    <h1 className="header-title" onClick={handleHeaderClick} style={{ cursor: 'pointer' }}>
      Group Study Finder
    </h1>
  );
};

export default Header;
