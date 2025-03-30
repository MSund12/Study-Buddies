// src/pages/CoursePage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom'; // Import useParams to read URL params
import { useSelector } from 'react-redux'; // Import if Header needs currentUser
import Header from '../Header'; // Re-use Header if desired
// import './styles/CoursePage.css'; // Optional: Create CSS for this page

const CoursePage = () => {
  // useParams() returns an object like { courseSlug: "MATH-2930" }
  const { courseSlug } = useParams();
  const currentUser = useSelector((state) => state.auth.currentUser); // Get user for Header

  // Convert slug back to a displayable title (replace hyphens with spaces)
  // You might use the slug directly to fetch data in a real app
  const courseTitle = courseSlug ? courseSlug.replace(/-/g, ' ') : 'Course Details';

  // In a real application, you would use 'courseSlug' or 'courseTitle'
  // to fetch detailed information about this specific course from your backend API here.
  // For example:
  // useEffect(() => {
  //   fetchCourseData(courseSlug);
  // }, [courseSlug]);

  return (
    <div className="course-page-container"> {/* Add a container class for styling */}
      <Header currentUser={currentUser} />
      <div className="course-content" style={{ padding: '20px' }}> {/* Add padding or style */}
        <h1>{courseTitle}</h1>
        <hr />
        <p>This is the template page for the course: <strong>{courseTitle}</strong>.</p>
        <p><em>(Details like description, prerequisites, study groups, resources, etc., specific to "{courseTitle}" would be fetched and displayed here.)</em></p>

        {/* Example Links */}
        <div style={{ marginTop: '30px' }}>
          <Link to="/home" style={{ marginRight: '15px' }}>Back to Home</Link>
          {/* You could link to a filtered Group Finder */}
          {/* <Link to={`/group-finder?course=${courseSlug}`}>Find Groups for {courseTitle}</Link> */}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;