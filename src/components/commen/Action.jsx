import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Pencil, Copy, Archive, Trash2 } from 'lucide-react';

export default function ActionDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when user clicks outside or presses Escape key
  useEffect(() => {
    function handleOutsideActions(event) {
      // Handle click outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      // Handle escape key
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideActions);
    document.addEventListener('keydown', handleOutsideActions);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideActions);
      document.removeEventListener('keydown', handleOutsideActions);
    };
  }, []);

  // Handler for menu selections
  const handleAction = (actionName) => {
    console.log(`${actionName} clicked`);
    setIsOpen(false); // Auto-close menu on selection
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-x-2 rounded-md bg-primary/80 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Action
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-gray-200 ring-opacity-5 focus:outline-none divide-y divide-gray-100"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Section 1: Standard Changes */}
          <div className="py-1" role="none">
            <button
              type="button"
              onClick={() => handleAction('Edit')}
              className="group flex w-full items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-left"
              role="menuitem"
            >
              <Pencil size={16} className="text-gray-400 group-hover:text-gray-500" />
              Edit details
            </button>
            
            <button
              type="button"
              onClick={() => handleAction('Duplicate')}
              className="group flex w-full items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-left"
              role="menuitem"
            >
              <Copy size={16} className="text-gray-400 group-hover:text-gray-500" />
              Duplicate
            </button>
          </div>

          {/* Section 2: Management */}
          <div className="py-1" role="none">
            <button
              type="button"
              onClick={() => handleAction('Archive')}
              className="group flex w-full items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-left"
              role="menuitem"
            >
              <Archive size={16} className="text-gray-400 group-hover:text-gray-500" />
              Archive item
            </button>
          </div>

          {/* Section 3: Danger Zone */}
          <div className="py-1" role="none">
            <button
              type="button"
              onClick={() => handleAction('Delete')}
              className="group flex w-full items-center gap-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
              role="menuitem"
            >
              <Trash2 size={16} className="text-red-400 group-hover:text-red-500" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
