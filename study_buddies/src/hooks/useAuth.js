const fetchProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/signin');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Assuming the MongoDB user object has fields like _id, name, email, etc.
      const mongoUser = {
        id: data._id,
        name: data.name,
        email: data.email,
        // any other fields you return from your backend
      };

      setUser(mongoUser);
      localStorage.setItem('user', JSON.stringify(mongoUser)); // optional: store locally
    } else {
      console.log("Error:", data.message);
    }
  } catch (error) {
    console.log("Server Error:", error);
  }
};
