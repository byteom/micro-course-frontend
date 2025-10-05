import React from 'react';

const Loader = ({ label = 'Loading...', size = 40 }) => {
  return (
    <div className="w-full flex items-center justify-center py-12">
      <div className="flex items-center space-x-3 text-gray-600">
        <div
          className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
          style={{ width: size, height: size }}
        />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
};

export default Loader;


