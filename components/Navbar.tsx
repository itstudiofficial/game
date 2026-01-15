
import React, { useState } from 'react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: any;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Tasks', id: 'tasks' },
    { name: 'Create Task', id: 'create' },
    { name: 'Wallet', id: 'wallet' },
    { name: 'Dashboard', id: 'dashboard' },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer" 
              onClick={() => setCurrentPage('home')}
            >
              <i className="fa-solid fa-coins text-indigo-600 text-2xl mr-2"></i>
              <span className="text-xl font-bold text-slate-800">CoinTasker <span className="text-indigo-600">Pro</span></span>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => setCurrentPage(link.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === link.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center bg-slate-100 rounded-full px-3 py-1 border border-slate-200">
              <i className="fa-solid fa-circle-dollar-to-slot text-yellow-500 mr-2"></i>
              <span className="text-sm font-semibold text-slate-700">{user.coins} Coins</span>
            </div>
            {!user.isLoggedIn ? (
              <button 
                onClick={() => setCurrentPage('login')}
                className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                Login / Join
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                 <span className="text-sm font-medium text-slate-600">Hi, {user.username}</span>
                 <button onClick={() => window.location.reload()} className="text-slate-400 hover:text-red-500"><i className="fa-solid fa-right-from-bracket"></i></button>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => { setCurrentPage(link.id); setIsOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              >
                {link.name}
              </button>
            ))}
            <div className="pt-4 pb-3 border-t border-slate-200">
               <div className="flex items-center px-3 mb-3">
                  <i className="fa-solid fa-circle-dollar-to-slot text-yellow-500 mr-2"></i>
                  <span className="text-sm font-semibold text-slate-700">{user.coins} Coins Available</span>
               </div>
               <button 
                onClick={() => { setCurrentPage('login'); setIsOpen(false); }}
                className="w-full bg-indigo-600 text-white px-5 py-3 rounded-lg text-sm font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
