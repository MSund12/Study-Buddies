import { useNavigate } from 'react-router-dom';

const Header = ({ currentUser }) => {
  const navigate = useNavigate(); // Hook for navigation

  const handleHeaderClick = () => {
    if (currentUser) {
      navigate('/home'); // Navigate to HomePage
    } else {
      navigate('/starter'); // Navigate to StarterPage
    }
  };

  return (
    <h1 className="header-title" onClick={handleHeaderClick}>
      Group Study Finder
    </h1>
  );
};

export default Header;
