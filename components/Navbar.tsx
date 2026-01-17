
import React, { useState } from 'react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: any;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const publicLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Features', id: 'features' },
    { name: 'Contact', id: 'contact' },
  ];

  const authLinks = [
    { name: 'Dashboard', id: 'dashboard', icon: 'fa-chart-pie' },
    { name: 'Tasks', id: 'tasks', icon: 'fa-list-check' },
    { name: 'Advertise', id: 'create', icon: 'fa-bullhorn' },
    { name: 'Spin', id: 'spin', icon: 'fa-clover' },
    { name: 'Wallet', id: 'wallet', icon: 'fa-wallet' },
  ];

  if (user.isAdmin) {
    authLinks.unshift({ name: 'Admin Hub', id: 'admin', icon: 'fa-user-shield' });
  }

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const currentLinks = user.isLoggedIn ? authLinks : publicLinks;

  return (
    <nav className="glass-nav sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 mr-2 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-xl`}></i>
            </button>

            <div 
              className="flex-shrink-0 flex items-center cursor-pointer group" 
              onClick={() => handleNavClick('home')}
            >
              <div className="w-10 h-10 md:w-11 md:h-11 mr-3 md:mr-4 flex items-center justify-center bg-indigo-600 rounded-xl md:rounded-2xl shadow-xl shadow-indigo-200 relative overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-5 h-5 md:w-6 md:h-6 text-white fill-current relative z-10">
                  <path d="M50 5 L95 85 L50 70 L5 85 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M50 25 L75 75 L50 65 L25 75 Z" />
                </svg>
              </div>
              <span className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">
                Ads <span className="text-indigo-600">Predia</span>
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
          
          <div className="flex items-center space-x-2 md:space-x-6">
            {!user.isLoggedIn ? (
              <div className="flex items-center space-x-1 md:space-x-3">
                <button onClick={() => handleNavClick('login')} className="hidden sm:block text-slate-600 hover:text-indigo-600 px-4 py-2 text-sm font-bold">Login</button>
                <button onClick={() => handleNavClick('login')} className="bg-indigo-600 text-white px-5 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100">Sign Up</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 md:gap-6">
                 <div className="hidden xs:flex px-4 md:px-5 py-2 md:py-2.5 bg-slate-100 rounded-xl md:rounded-2xl border border-slate-200 items-center gap-2 md:gap-3">
                   <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <div className="flex flex-col text-left">
                     <span className="text-[7px] md:text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Balance</span>
                     <span className="text-xs md:text-sm font-black text-slate-800 leading-none">{user.coins.toLocaleString()}</span>
                   </div>
                 </div>

                 <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`flex items-center gap-2 md:gap-3 p-1 rounded-xl md:rounded-2xl transition-all ${isUserMenuOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-100 rounded-lg md:rounded-xl flex items-center justify-center text-indigo-600 font-black">
                        {user.username.charAt(0)}
                      </div>
                      <i className={`fa-solid fa-chevron-down text-[8px] md:text-[10px] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-3 w-56 md:w-64 bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-2xl p-3 md:p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-1">
                          {user.isAdmin && (
                            <button onClick={() => handleNavClick('admin')} className="w-full text-left px-4 py-3 md:px-5 md:py-4 rounded-xl hover:bg-indigo-50 flex items-center gap-4 group">
                              <i className="fa-solid fa-user-shield text-slate-400 group-hover:text-indigo-600"></i>
                              <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600">Admin Hub</span>
                            </button>
                          )}
                          <button onClick={() => handleNavClick('dashboard')} className="w-full text-left px-4 py-3 md:px-5 md:py-4 rounded-xl hover:bg-indigo-50 flex items-center gap-4 group">
                            <i className="fa-solid fa-chart-pie text-slate-400 group-hover:text-indigo-600"></i>
                            <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600">Dashboard</span>
                          </button>
                          <button onClick={() => handleNavClick('wallet')} className="w-full text-left px-4 py-3 md:px-5 md:py-4 rounded-xl hover:bg-indigo-50 flex items-center gap-4 group lg:hidden">
                            <i className="fa-solid fa-wallet text-slate-400 group-hover:text-indigo-600"></i>
                            <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600">Wallet</span>
                          </button>
                          <button onClick={onLogout} className="w-full text-left px-4 py-3 md:px-5 md:py-4 rounded-xl hover:bg-red-50 flex items-center gap-4 group">
                            <i className="fa-solid fa-power-off text-slate-400 group-hover:text-red-500"></i>
                            <span className="text-sm font-black text-slate-700 group-hover:text-red-500">Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-20 left-4 right-4 bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-6 animate-in slide-in-from-top-4 duration-300">
             <div className="space-y-2">
                {currentLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all ${
                      currentPage === link.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {'icon' in link && <i className={`fa-solid ${link.icon} w-5`}></i>}
                    <span className="text-sm font-black uppercase tracking-widest">{link.name}</span>
                  </button>
                ))}
             </div>
             {user.isLoggedIn && (
               <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Balance</span>
                    <span className="text-lg font-black text-slate-900">{user.coins.toLocaleString()}</span>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
