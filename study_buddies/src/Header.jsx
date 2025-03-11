import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);

  const handleHeaderClick = () => {
    if (currentUser) {
      navigate('/home');
    } else {
      navigate('/starter');
    }
  };

  return (
    <h1 className="header-title" onClick={handleHeaderClick} style={{ cursor: 'pointer' }}>
      Group Study Finder
    </h1>
  );
};

export default Header;
