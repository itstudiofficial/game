
import React, { useState } from 'react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: any;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const publicLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Features', id: 'features' },
    { name: 'Contact', id: 'contact' },
  ];

  const authLinks = [
    { name: 'Dashboard', id: 'dashboard', icon: 'fa-chart-pie' },
    { name: 'Tasks', id: 'tasks', icon: 'fa-list-check' },
    { name: 'Advertise', id: 'create', icon: 'fa-bullhorn' },
    { name: 'Spin', id: 'spin', icon: 'fa-clover' },
    { name: 'Network', id: 'referrals', icon: 'fa-users-rays' },
    { name: 'Wallet', id: 'wallet', icon: 'fa-wallet' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsOpen(false);
    setIsUserMenuOpen(false);
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
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer group" 
              onClick={() => handleNavClick('home')}
            >
              {/* Professional Custom SVG Logo */}
              <div className="w-11 h-11 mr-4 flex items-center justify-center bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 transform group-hover:rotate-[15deg] transition-all duration-500 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-700 to-indigo-500 opacity-50"></div>
                <svg viewBox="0 0 100 100" className="w-6 h-6 text-white fill-current relative z-10">
                  <path d="M50 5 L95 85 L50 70 L5 85 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M50 25 L75 75 L50 65 L25 75 Z" />
                </svg>
              </div>
              <span className="text-2xl font-black text-slate-800 tracking-tighter transition-colors group-hover:text-indigo-600">
                Ads <span className="text-indigo-600 group-hover:text-slate-800 transition-colors">Predia</span>
              </span>
            </div>
            
            <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
              {currentLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    currentPage === link.id 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6">
            {!user.isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleNavClick('login')}
                  className="text-slate-600 hover:text-indigo-600 px-4 py-2 text-sm font-bold transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleNavClick('login')}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                 <div className="px-5 py-2.5 bg-slate-100 rounded-2xl border border-slate-200 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <div className="flex flex-col">
                     <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Vault</span>
                     <span className="text-sm font-black text-slate-800 leading-none">{user.coins.toLocaleString()}</span>
                   </div>
                 </div>

                 <div className="h-8 w-px bg-slate-200"></div>

                 <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`flex items-center gap-3 p-1.5 pr-4 rounded-2xl transition-all ${isUserMenuOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                        {user.username.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black tracking-tight leading-none">{user.username}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Pro Account</div>
                      </div>
                      <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1">
                          <button 
                            onClick={() => handleNavClick('dashboard')}
                            className="w-full text-left px-5 py-4 rounded-xl hover:bg-indigo-50 flex items-center gap-4 transition-colors group"
                          >
                            <i className="fa-solid fa-user-gear text-slate-400 group-hover:text-indigo-600"></i>
                            <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600">Profile & Settings</span>
                          </button>
                          <button 
                            onClick={() => handleNavClick('referrals')}
                            className="w-full text-left px-5 py-4 rounded-xl hover:bg-indigo-50 flex items-center gap-4 transition-colors group"
                          >
                            <i className="fa-solid fa-users-rays text-slate-400 group-hover:text-indigo-600"></i>
                            <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600">Network & Banners</span>
                          </button>
                          <button 
                            onClick={() => handleNavClick('wallet')}
                            className="w-full text-left px-5 py-4 rounded-xl hover:bg-indigo-50 flex items-center gap-4 transition-colors group"
                          >
                            <i className="fa-solid fa-wallet text-slate-400 group-hover:text-indigo-600"></i>
                            <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600">Financial Hub</span>
                          </button>
                          <div className="h-px bg-slate-50 my-2"></div>
                          <button 
                            onClick={onLogout}
                            className="w-full text-left px-5 py-4 rounded-xl hover:bg-red-50 flex items-center gap-4 transition-colors group"
                          >
                            <i className="fa-solid fa-power-off text-slate-400 group-hover:text-red-500"></i>
                            <span className="text-sm font-black text-slate-700 group-hover:text-red-500">Secure Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </div>

          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 rounded-2xl text-slate-500 hover:bg-slate-100"
            >
              <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 p-6 space-y-4 animate-in slide-in-from-top duration-300">
          {user.isLoggedIn && (
            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-3xl mb-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600 shadow-sm">
                {user.username.charAt(0)}
              </div>
              <div>
                <div className="font-black text-slate-900">{user.username}</div>
                <div className="text-xs font-black text-indigo-600">{user.coins.toLocaleString()} Coins Available</div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            {currentLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-50"
              >
                {link.name}
              </button>
            ))}
          </div>

          {user.isLoggedIn ? (
            <div className="space-y-3 pt-4">
              <button onClick={() => handleNavClick('dashboard')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Manage Profile</button>
              <button onClick={onLogout} className="w-full py-5 text-red-500 font-black text-xs uppercase tracking-widest border border-red-100 rounded-2xl">Logout</button>
            </div>
          ) : (
            <button onClick={() => handleNavClick('login')} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Get Started</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
