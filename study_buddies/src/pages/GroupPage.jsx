import React, { useState } from 'react';

const GroupPage = ({ group, onBack }) => {
  // State to hold the list of resource objects
  const [resources, setResources] = useState([]);

  // State for the resource upload form
  const [resourceForm, setResourceForm] = useState({
    title: '',
    link: '',
    description: '',
  });

  // State for displaying a status message
  const [status, setStatus] = useState('');

  // Handle the resource form submission
  const handleResourceSubmit = (e) => {
    e.preventDefault();

    // Add the new resource to the resources array
    setResources([...resources, resourceForm]);

    // Clear the form
    setResourceForm({ title: '', link: '', description: '' });

    // Display a status message
    setStatus('Resource uploaded successfully!');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="p-4">
      <button onClick={onBack} className="px-4 py-2 bg-gray-400 text-white rounded mb-4">Back</button>
      <h2 className="text-2xl font-bold mb-2">{group.name}</h2>
      <p className="mb-4">Welcome to {group.name}! Here you can share and view study resources.</p>

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
            className="w-full p-2 border rounded"
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
    </div>
  );
};

export default GroupPage;
