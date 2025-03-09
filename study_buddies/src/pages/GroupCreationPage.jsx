import React, { useState } from 'react';

const GroupCreationPage = ({ onBack }) => {
  const [groupName, setGroupName] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [course, setCourse] = useState('');
  const [groups, setGroups] = useState([]); // Local groups state
  let nextGroupId = groups.length + 1;

  const handleCreate = () => {
    if (groupName.trim() !== '' && course.trim() !== '' && numberOfPeople.trim() !== '' && !isNaN(numberOfPeople)) {
      const newGroup = {
        id: nextGroupId,
        name: groupName,
        numberOfPeople: parseInt(numberOfPeople),
        course: course,
      };
      setGroups([...groups, newGroup]); // Update local state
      nextGroupId++;
      setGroupName('');
      setNumberOfPeople('');
      setCourse('');
      onBack(); // Go back to the home page after creation.
      //Here is where you would call a function that saves the new group to a database, or global state.
      console.log(groups);
    } else {
      alert('Please enter valid group name, number of people, and course.');
    }
  };

  return (
    <div className="p-4">
      <button onClick={onBack} className="px-4 py-2 bg-gray-400 text-white rounded mb-4">
        Back
      </button>
      <h2 className="text-2xl font-bold mb-4">Create a New Group</h2>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="number"
        placeholder="Number of People"
        value={numberOfPeople}
        onChange={(e) => setNumberOfPeople(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="text"
        placeholder="Course"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded">
        Create Group
      </button>
    </div>
  );
};

export default GroupCreationPage;