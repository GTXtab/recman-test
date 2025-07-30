
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="gradient-bg text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📋</div>
            <div>
              <h1 className="text-2xl font-bold">Todo App</h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
