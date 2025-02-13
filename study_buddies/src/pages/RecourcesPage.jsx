import React, { useState } from 'react';

const ResourceUploader = () => {
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  const handleLinkChange = (event) => {
    const { value } = event.target;
    setLink(value);
  };

  const handleUpload = () => {

    console.log("Uploaded link:", link);

    
    if (link) {
      alert("Uploaded Succesfully!");
      setLink("");
    } else {
      alert("Upload Unsuccesful, please check link and try again.");
    }

    
  };

  return (
    <div>
      <label htmlFor="websiteLink">Website Link:</label>
      <input
        type="text"
        id="websiteLink"
        value={link}
        onChange={handleLinkChange}
        placeholder="Enter website link"
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default WebsiteLinkUploader;