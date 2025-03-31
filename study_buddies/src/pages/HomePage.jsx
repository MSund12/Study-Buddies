// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import GroupFinderPage from './GroupFinderPage'; // Ensure paths are correct
import GroupPage from './GroupPage';           // Ensure paths are correct
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import './styles/HomePage.css';
import Header from '../Header';

// Define the courses in an array
const courses = ["EECS 2311", "ENG 2003", "MATH 2930"];

const HomePage = () => {
  const [showGroupFinder, setShowGroupFinder] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { loading, error, successMessage } = useSelector((state) => state.groups);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate(); // Get the navigate function
  const currentUser = useSelector((state) => state.auth.currentUser);

  
  const [groupData, setGroupData] = useState({
      course: '',
      groupName: '',
      maxMembers: ''
  });
  const [courseSearch, setCourseSearch] = useState('');
  const [courseResults, setCourseResults] = useState([]);
  
  
    const handleSignOut = () => {
        dispatch(logout());
        navigate('/starter');
      };
  
    // Effect to pre-fill course from URL query parameter
    useEffect(() => {
      const queryParams = new URLSearchParams(location.search);
      const courseFromQuery = queryParams.get('course');
      if (courseFromQuery) {
        // Pre-fill both the form data and the search display field
        setGroupData(prevData => ({ ...prevData, course: courseFromQuery }));
        setCourseSearch(courseFromQuery);
      }
    }, [location.search]);
  
    // Effect to clear messages on mount/unmount
    useEffect(() => {
      if (typeof clearMessages === 'function') {
        dispatch(clearMessages());
      }
      return () => {
         if (typeof clearMessages === 'function') {
              dispatch(clearMessages());
         }
      };
    }, [dispatch]);
  
    // Effect for searching courses (debounced)
    useEffect(() => {
      const fetchCourses = async () => {
        // Don't search if the search input exactly matches the selected course
        if (!courseSearch.trim() || courseSearch.trim() === groupData.course) {
          setCourseResults([]);
          return;
        }
        try {
          const response = await fetch(`http://localhost:5000/api/courses/search?query=${courseSearch}`);
          const data = await response.json();
          if (response.ok && Array.isArray(data)) {
            setCourseResults(data);
          } else {
            console.warn("Course search response not ok or not an array:", data);
            setCourseResults([]);
          }
        } catch (error) {
          console.error('Error fetching courses:', error);
          setCourseResults([]);
        }
      };
  
      const delaySearch = setTimeout(fetchCourses, 300);
      return () => clearTimeout(delaySearch);
    }, [courseSearch, groupData.course]); // Added groupData.course dependency
  
    // --- Handlers ---
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setGroupData({ ...groupData, [name]: value });
    };
  
    // Handler for the Course Search input only
    const handleCourseSearchChange = (e) => {
        const newSearchValue = e.target.value;
        setCourseSearch(newSearchValue);
        // If user clears input OR types something different than the selected course,
        // clear the actual selected course in the form data.
        if (newSearchValue.trim() === '' || newSearchValue.trim() !== groupData.course) {
            setGroupData({...groupData, course: ''});
        }
    }
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!groupData.course) {
         // Set error state instead of console.error for user feedback
         // setError("Please select a course first."); // Requires adding setError state
         alert("Please select a course first."); // Simple alert for now
         return;
      }
      dispatch(createGroup(groupData));
      // Optionally navigate or clear form on success via extraReducers
    };
  
    const handleSelectCourse = (dept, courseId) => {
      const fullCourseName = `${dept} ${courseId}`;
      // Set the course value for submission
      setGroupData({ ...groupData, course: fullCourseName });
      // Set the search input to display the selected course
      setCourseSearch(fullCourseName);
      // Clear the search results dropdown
      setCourseResults([]);
    };


  // --- UPDATED handleCourseClick ---
  // Function to handle clicking on a course button
  const handleCourseClick = (courseTitle) => {
    // Replace all spaces globally with hyphens
    const courseSlug = courseTitle.replace(/ /g, '-');
    // Construct the path using the slug
    const path = `/courses/${courseSlug}`;
    console.log(`Navigating to: ${path}`); // For debugging
    navigate(path);
  };
  // --- END UPDATE ---

  // Conditional rendering for GroupPage/GroupFinderPage (ensure components are imported)
  if (selectedGroup) {
    return (
      <GroupPage
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
        currentUser={currentUser}
      />
    );
  }
  if (showGroupFinder) {
    return (
      <GroupFinderPage
        onBack={() => setShowGroupFinder(false)}
        onSelectGroup={setSelectedGroup}
        // Pass props as needed
      />
    );
  }


  // Main HomePage render
  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />
      {/* Sign Out Button */}
      {currentUser && (
        <div className="signout-container">
          <button className="signout-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      )}

      {/* Decorative Shapes */}
      <RedShape color="#1EE1A8" />
      <PinkShape />
      <PurpleShape />

      {/* Navigation Buttons */}
      <nav className="buttons-container-home">
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/group-finder'); }}>Study Groups</a>
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/chat'); }}>Chats</a>
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/schedule'); }}>Schedules</a>
         <a href="#" className="buttons" onClick={(e) => { e.preventDefault(); navigate('/book'); }}>Book a Room</a>
      </nav>

      <div className="search-group">
            <input
              type="text"
              id="courseSearch"
              name="courseSearch"
              placeholder="Type Dept or Course ID (e.g., EECS 2311)"
              value={courseSearch}
              // Use the dedicated handler now
              onChange={handleCourseSearchChange}
              autoComplete="off"
            />
            {/* Search Results Dropdown */}
            {courseResults.length > 0 && (
              <ul className="course-results">
                {courseResults.map((course) => (
                  <li
                    key={course._id}
                    onClick={() => handleSelectCourse(course.Dept, course['Course ID'])}
                    className="course-item"
                  >
                    {course.Dept} {course['Course ID']} - {course['Course Name']}
                  </li>
                ))}
              </ul>
            )}
            {/* No Results Message */}
            {courseResults.length === 0 && courseSearch && courseSearch !== groupData.course && (
              <p className="no-results">No matching courses found.</p>
            )}
          </div>

      {/* Course Display Area - uses updated handleCourseClick */}
      <div className="placeholder-container">
        {courses.map((title) => (
          <button
            key={title}
            className="placeholder-box"
            onClick={() => handleCourseClick(title)} // Calls the updated handler
          >
            {title}
          </button>
        ))}
      </div>

      {/* Create Group Button */}
      <button
        className="circular-button"
        onClick={() => navigate('/create-group')}
      >
        Create a Group
      </button>
    </div>
  );
};

export default HomePage;