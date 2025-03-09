import React, { PureComponent, useState } from 'react';
import GroupFinderPage from './GroupFinderPage';
import GroupPage from './GroupPage';
import GroupCreationPage from './GroupCreationPage';
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';

const HomePage = ({ currentUser }) => {
  const [showGroupFinder, setShowGroupFinder] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupCreation, setShowGroupCreation] = useState(false);

  if (selectedGroup) {
    return (<GroupPage 
      group={selectedGroup} 
      onBack={() => setSelectedGroup(null)} 
      currentUser={currentUser}
    />);
  }

  if (showGroupFinder) {
    return (<GroupFinderPage 
      onBack={() => setShowGroupFinder(false)} 
      onSelectGroup={setSelectedGroup} 
    />);
  }
  if (showGroupCreation) {
    return (<GroupCreationPage
    onBack={() => setShowGroupCreation(false)}  />
    );
  }
  
  return (
    <div className="starter-container">

      <RedShape color="#1EE1A8"/>
      <PinkShape/>
      <PurpleShape/>

      <nav className="buttons-container-home">
        <a href="#" className="buttons">Courses</a>
        <a href="#" className="buttons">Study Groups</a>
        <a href="#" className="buttons">Chats</a>
        <a href="#" className="buttons">Empty Rooms</a>
        <a href="#" className="buttons">Book a Room</a>
      </nav>

      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search courses..." 
          className="search-bar"  
        />
      </div>
      
      <div className="placeholder-container">
        <div className="placeholder-box">Placeholder 1</div>
        <div className="placeholder-box">Placeholder 2</div>
        <div className="placeholder-box">Placeholder 3</div>
        <div className="placeholder-box">Placeholder 4</div>
        <div className="placeholder-box">Placeholder 5</div>
        <div className="placeholder-box">Placeholder 6</div>
      </div>

      <button className="circular-button" onClick={() => setShowGroupCreation(true)}>
        Create a Group
      </button>

      
    </div>
)};

export default HomePage;
