
import React, { useState } from 'react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: any;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Features', id: 'features' },
    { name: 'How it works', id: 'how-it-works' },
    { name: 'Contact Us', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsOpen(false);
    // If it's a section on the home page, we can handle scrolling here if needed
    if (['about', 'features', 'how-it-works', 'contact'].includes(id)) {
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

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
            <div className="hidden lg:ml-8 lg:flex lg:space-x-4">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === link.id ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user.isLoggedIn && (
              <button 
                onClick={() => setCurrentPage('tasks')}
                className="text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-full transition-all"
              >
                Browse Tasks
              </button>
            )}
            
            <div className="flex items-center bg-slate-100 rounded-full px-3 py-1 border border-slate-200">
              <i className="fa-solid fa-circle-dollar-to-slot text-yellow-500 mr-2"></i>
              <span className="text-sm font-semibold text-slate-700">{user.coins} Coins</span>
            </div>

            {!user.isLoggedIn ? (
              <button 
                onClick={() => setCurrentPage('login')}
                className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                 <button 
                   onClick={() => setCurrentPage('dashboard')}
                   className="text-sm font-bold text-slate-700 hover:text-indigo-600"
                 >
                   {user.username}
                 </button>
                 <button 
                   onClick={onLogout} 
                   className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                 >
                   <i className="fa-solid fa-right-from-bracket"></i>
                 </button>
              </div>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              >
                {link.name}
              </button>
            ))}
            <div className="pt-4 pb-3 border-t border-slate-200">
               {user.isLoggedIn ? (
                 <div className="space-y-2">
                   <button onClick={() => {setCurrentPage('tasks'); setIsOpen(false);}} className="block w-full text-left px-3 py-2 text-indigo-600 font-bold">Browse Tasks</button>
                   <button onClick={() => {setCurrentPage('dashboard'); setIsOpen(false);}} className="block w-full text-left px-3 py-2 text-slate-600">Dashboard</button>
                   <button onClick={onLogout} className="block w-full text-left px-3 py-2 text-red-500">Logout</button>
                 </div>
               ) : (
                 <button 
                  onClick={() => { setCurrentPage('login'); setIsOpen(false); }}
                  className="w-full bg-indigo-600 text-white px-5 py-3 rounded-lg text-sm font-semibold"
                >
                  Get Started
                </button>
               )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
