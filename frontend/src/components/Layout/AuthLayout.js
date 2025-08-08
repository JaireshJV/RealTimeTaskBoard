import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">
            Kanban Board
          </h1>
          <p className="text-gray-600">
            Organize your tasks and collaborate with your team
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-8">
          {children}
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2024 Kanban Board. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 