import React from "react";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <header className="text-3xl font-bold mb-6">Group Study Finder</header>
      <p className="text-lg text-gray-700 mb-4 text-center max-w-md">
        Find and join study groups for your courses. Connect with peers, share knowledge, and succeed together.
      </p>
      <div className="flex space-x-4">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
          Find a Group
        </button>
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition">
          Create a Group
        </button>
      </div>
    </div>
  );
};

export default HomePage;
