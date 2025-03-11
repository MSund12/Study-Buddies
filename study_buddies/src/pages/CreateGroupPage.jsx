import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateGroupPage = () => {
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState({
    course: '',
    groupName: '',
    maxMembers: ''
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Group created successfully!');
        setTimeout(() => navigate('/home'), 2000); // Redirect to home after success
      } else {
        setMessage(data.message || 'Failed to create group');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  return (
    <div className="create-group-container">
      <h2>Create a New Study Group</h2>

      <form onSubmit={handleSubmit} className="create-group-form">
        {/* Course Selection */}
        <div className="input-group">
          <label htmlFor="course">Select Course</label>
          <select
            id="course"
            name="course"
            value={groupData.course}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Select a Course --</option>
            <option value="EECS 2311">EECS 2311</option>
            <option value="Math 2015">Math 2015</option>
            <option value="ENG 2003">ENG 2003</option>
            <option value="LOLZ Academy">LOLZ Academy</option>
            <option value="LLMS DUDE">LLMS DUDE</option>
          </select>
        </div>

        {/* Group Name */}
        <div className="input-group">
          <label htmlFor="groupName">Group Name</label>
          <input
            type="text"
            id="groupName"
            name="groupName"
            placeholder="Enter group name"
            value={groupData.groupName}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Maximum Members */}
        <div className="input-group">
          <label htmlFor="maxMembers">Max Members</label>
          <input
            type="number"
            id="maxMembers"
            name="maxMembers"
            placeholder="Enter max members"
            value={groupData.maxMembers}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="create-group-button">
          Create Group
        </button>
      </form>

      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default CreateGroupPage;
