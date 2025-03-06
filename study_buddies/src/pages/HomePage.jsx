import React, { useState } from 'react';
import GroupFinderPage from './GroupFinderPage';
import GroupPage from './GroupPage';

const HomePage = ({ currentUser }) => {
  const [showGroupFinder, setShowGroupFinder] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

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
  
  return (
    <div className="starter-container">

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
      </div>

      
    </div>
)};

export default HomePage;
