
import React, { useState } from 'react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: any;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const publicLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Features', id: 'features' },
    { name: 'Contact', id: 'contact' },
  ];

  const authLinks = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Tasks', id: 'tasks' },
    { name: 'Create Task', id: 'create' },
    { name: 'Spin Wheel', id: 'spin' },
    { name: 'Wallet', id: 'wallet' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsOpen(false);
    if (['about', 'features', 'contact'].includes(id)) {
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const currentLinks = user.isLoggedIn ? authLinks : publicLinks;

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
              <span className="text-xl font-bold text-slate-800">Ads <span className="text-indigo-600">Predia</span></span>
            </div>
            <div className="hidden lg:ml-8 lg:flex lg:space-x-4">
              {currentLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                    currentPage === link.id ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            {!user.isLoggedIn ? (
              <>
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="text-slate-600 hover:text-indigo-600 px-4 py-2 text-sm font-semibold transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                 <div className="flex flex-col items-end mr-2">
                   <span className="text-xs text-slate-400 font-bold uppercase">Balance</span>
                   <span className="text-sm font-bold text-indigo-600">{user.coins} Coins</span>
                 </div>
                 <div className="h-8 w-px bg-slate-200"></div>
                 <button 
                   onClick={() => setCurrentPage('dashboard')}
                   className="flex items-center space-x-2 text-slate-700 hover:text-indigo-600 font-bold"
                 >
                   <i className="fa-solid fa-circle-user text-xl text-indigo-500"></i>
                   <span className="text-sm">{user.username}</span>
                 </button>
                 <button 
                   onClick={onLogout} 
                   className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                   title="Logout"
                 >
                   <i className="fa-solid fa-power-off"></i>
                 </button>
              </div>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100"
            >
              <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-2">
          {currentLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="block w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
            >
              {link.name}
            </button>
          ))}
          {!user.isLoggedIn ? (
            <div className="pt-4 space-y-2">
              <button onClick={() => setCurrentPage('login')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Sign Up</button>
            </div>
          ) : (
            <button onClick={onLogout} className="w-full py-3 text-red-500 font-bold bg-red-50 rounded-xl mt-4">Logout</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
