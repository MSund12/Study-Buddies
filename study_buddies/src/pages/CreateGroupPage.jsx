import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGroup, clearMessages } from '../features/groupSlice';
import { useNavigate } from 'react-router-dom';
import './styles/CreateGroupPage.css'

const CreateGroupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState({
    course: '',
    groupName: '',
    maxMembers: ''
  });

  const { loading, error, successMessage } = useSelector((state) => state.groups);

  // Clear success/error messages when navigating away
  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createGroup(groupData));
    setGroupData({ course: '', groupName: '', maxMembers: '' }); // Clear form fields
  };

  return (
    <div className="create-group-container">
      <h2>Create a New Study Group</h2>

      <form onSubmit={handleSubmit} className="create-group-form">
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

        <button type="submit" className="create-group-button" disabled={loading}>
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>

      {successMessage && <p className="status-message success">{successMessage}</p>}
      {error && <p className="status-message error">{error}</p>}
    </div>
  );
};

export default CreateGroupPage;
