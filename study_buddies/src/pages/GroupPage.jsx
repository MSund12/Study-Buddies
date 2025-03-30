import React, { useState } from 'react';
import GroupChatSidebar from './GroupChatSidebar';
import Header from '../Header';
import { logout } from '../features/authSlice';

const GroupPage = ({ group, onBack, currentUser }) => {
  const [resources, setResources] = useState([]);
  const navigate = useNavigate();
  const [resourceForm, setResourceForm] = useState({
    title: '',
    link: '',
    description: '',
  });
  const [status, setStatus] = useState('');

  const handleResourceSubmit = (e) => {
    e.preventDefault();

    // Add the new resource to the list
    setResources([...resources, resourceForm]);
    // Clear the form
    setResourceForm({ title: '', link: '', description: '' });
    // Display status message
    setStatus('Resource uploaded successfully!');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleSignOut = () => {
      dispatch(logout());
      navigate('/signin');
    };

    

  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />

      {currentUser && (
        <div className="signout-container">
          <button
            className="signout-button"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}

      <nav className="buttons-container-home">
        <a href="#" className="buttons">Courses</a>

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/group-finder');
          }}
        >
          Study Groups
        </a>

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/chat');
          }}
        >
          Chats
        </a>

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/schedule');
          }}
        >
          Schedules
        </a>

        <a 
        href="#" 
        className="buttons"
        onClick={(e) => {e.preventDefault();
            navigate('/book')
        }}
        >Book a Room</a>
      </nav>


      <button onClick={onBack} className="back-button">
        Back
      </button>
      <h2 className="group-name">{group.name}</h2>
      <p className="group-message">
        Welcome to {group.name}! Here you can share and view study resources.
      </p>

      <div className="mb-8 border p-4 rounded bg-gray-50">
        <h3 className="text-xl font-semibold mb-2">Upload Resource</h3>
        <form onSubmit={handleResourceSubmit} className="space-y-2">
          <input
            type="text"
            placeholder="Title"
            value={resourceForm.title}
            onChange={(e) =>
              setResourceForm({ ...resourceForm, title: e.target.value })
            }
            required
          />
          <input
            type="url"
            placeholder="Link"
            value={resourceForm.link}
            onChange={(e) =>
              setResourceForm({ ...resourceForm, link: e.target.value })
            }
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Description"
            value={resourceForm.description}
            onChange={(e) =>
              setResourceForm({ ...resourceForm, description: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            Upload
          </button>
        </form>
        {status && <p className="mt-2 text-green-600">{status}</p>}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Resources</h3>
        {resources.length === 0 ? (
          <p>No resources added yet.</p>
        ) : (
          resources.map((resource, index) => (
            <div key={index} className="mb-4 p-4 border rounded bg-white">
              <h4 className="text-lg font-bold">{resource.title}</h4>
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {resource.link}
              </a>
              {resource.description && <p>{resource.description}</p>}
            </div>
          ))
        )}
      </div>
      {/* Group chat on the page*/}
      <GroupChatSidebar username={currentUser.username} />
    </div>
  );
};

export default GroupPage;
