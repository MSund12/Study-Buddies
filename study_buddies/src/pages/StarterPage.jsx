import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import RedShape from './components/RedShape';
import PurpleShape from './components/PurpleShape';
import PinkShape from './components/PinkShape';
import './styles/StarterPage.css';
import Header from '../Header';

const StarterPage = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);

  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />
      {/* Abstract Shapes */}
      <RedShape />
      <PurpleShape />
      <PinkShape />

        {/* Main Heading */}
        <h1 className="main-title">
          Connect <span>With Students</span> In Your <span>Class</span>
        </h1>
      
        {/* Description */}
        <p className="description">
          Created to help first and second-year Lassonde engineering students connect with their classmates in person and virtually.
        </p>

        {/* Sign In and Sign Up Buttons */}
        <div className="buttons-container">
          <a className="sign-in" onClick={() => navigate('/signin')}>Sign In</a>
          <div className="sign-up-container"  onClick={() => navigate('/signup')}>
            <a className="sign-up">Sign Up</a>
          </div>
        </div>
    </div>
  );
};

export default StarterPage;
