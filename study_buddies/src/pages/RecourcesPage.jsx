import React, { useState } from 'react';

//ResourcePage Function:
const ResourcesPage = () => { //function 'Resourcespage' declaration
  const [link, setLink] = useState({
    /*Resource Information: includes a title, the link, and the description
    title, link, description intially set to empty string*/
    title: '', 
    link: '',
    description: '', 
  });
  
  //Status of upload function
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    //API call and Error Handling   
    try {
      const response = await fetch('http://localhost:5000/api/resources', { //backend API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(link),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Uploaded successfully!');
        setLink({ title: '', link: '', description: '' });
      } else {
        setStatus(data.message || 'Upload failed');
      }
    } catch (error) {
      setStatus('Error connecting to server');
    }
  };

  return (
    <div>
      <h2>Upload Resource</h2>
      <form onSubmit={handleSubmit}>
        <input //reads user input of title
          type="text"
          placeholder="Title"
          value={link.title}
          onChange={(e) => setLink({ ...link, title: e.target.value })}
          required
        />
        <input //reads user inputted link url to resource
          type="url" 
          placeholder="Link"
          value={link.link}
          onChange={(e) => setLink({ ...link, link: e.target.value })}
          required // Added required attribute
        />
        <textarea // uses textarea to read description of resource
          placeholder="Description"
          value={link.description}
          onChange={(e) => setLink({ ...link, description: e.target.value })}
        />
        <button type="upload">Upload</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default ResourceUploadPage;