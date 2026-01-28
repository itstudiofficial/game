
import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: any;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const authLinks = [
    { name: 'Dashboard', id: 'dashboard', icon: 'fa-chart-pie' },
    { name: 'Task Marketplace', id: 'tasks', icon: 'fa-list-check' },
    { name: 'Math Solver', id: 'math-solver', icon: 'fa-calculator' },
    { name: 'Spin', id: 'spin', icon: 'fa-clover' },
    { name: 'Affiliate', id: 'referrals', icon: 'fa-users' },
    { name: 'Create Task', id: 'create', icon: 'fa-bullhorn' },
    { name: 'My Campaign', id: 'my-campaigns', icon: 'fa-paper-plane' },
    { name: 'Wallet', id: 'wallet', icon: 'fa-wallet' },
    { name: 'Profile', id: 'profile', icon: 'fa-user-gear' },
  ];

  const adminLinks = [
    { name: 'Admin Hub', id: 'admin-overview', icon: 'fa-user-shield' },
    { name: 'New Task', id: 'admin-create-task', icon: 'fa-plus' },
    { name: 'Users', id: 'admin-users', icon: 'fa-users' },
    { name: 'Reviews', id: 'admin-reviews', icon: 'fa-camera-retro' },
    { name: 'Manage Tasks', id: 'admin-tasks', icon: 'fa-list-check' },
    { name: 'Finance', id: 'admin-finance', icon: 'fa-wallet' },
    { name: 'SEO', id: 'admin-seo', icon: 'fa-search' },
    { name: 'Global Logs', id: 'admin-history', icon: 'fa-clock' },
  ];

  const publicLinks = [
    { name: 'Home', id: 'home', icon: 'fa-house' },
    { name: 'Features', id: 'features', icon: 'fa-layer-group' },
    { name: 'Contact', id: 'contact', icon: 'fa-headset' },
  ];

  const finalAuthLinks = user.isAdmin 
    ? [...adminLinks, ...authLinks]
    : authLinks;

  const currentLinks = user.isLoggedIn ? finalAuthLinks : publicLinks;

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderMobileLink = (link: { name: string, id: string, icon: string }) => (
    <button
      key={link.id}
      onClick={() => handleNavClick(link.id)}
      className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all ${
        currentPage === link.id 
          ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50' 
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
        currentPage === link.id ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-100 text-slate-400'
      }`}>
        <i className={`fa-solid ${link.icon} text-xs`}></i>
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest">{link.name}</span>
    </button>
  );

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
          scrolled 
            ? 'py-3 bg-white/80 backdrop-blur-2xl border-b border-slate-200/40 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.08)]' 
            : 'py-5 bg-white/40 backdrop-blur-md border-b border-white/20'
        }`}
      >
        <div className="max-w-[1700px] mx-auto px-4 md:px-10">
          <div className="flex justify-between items-center h-16">
            
            {/* Brand Logo Section */}
            <div className="flex items-center gap-5">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden w-12 h-12 flex items-center justify-center text-slate-900 bg-white rounded-2xl shadow-sm border border-slate-100 hover:text-indigo-600 transition-all active:scale-90"
              >
                <i className="fa-solid fa-bars-staggered"></i>
              </button>

              <div 
                className="flex items-center cursor-pointer group" 
                onClick={() => handleNavClick('home')}
              >
                <div className="flex items-center bg-white/60 pr-5 pl-1.5 py-1.5 rounded-2xl border border-slate-200/50 shadow-sm group-hover:shadow-md group-hover:bg-white transition-all duration-300">
                  <div className="h-10 w-10 overflow-hidden rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 bg-slate-900 p-2">
                    <Logo className="h-full w-full" />
                  </div>
                  <div className="ml-3">
                    <span className="text-xl font-black tracking-tighter text-slate-900 block leading-none">
                      Ads<span className="text-indigo-600">Predia</span>
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1.5 block">
                      {user.isAdmin ? 'Global Admin Node' : 'Authorized Partner'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Link Cluster */}
            <div className="hidden lg:flex items-center bg-slate-900/5 p-1.5 rounded-3xl border border-slate-200/30 backdrop-blur-sm overflow-x-auto no-scrollbar max-w-[55%] xl:max-w-none">
              {currentLinks.slice(0, user.isAdmin ? 6 : 8).map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-5 py-3 rounded-[1.25rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
                    currentPage === link.id 
                      ? 'text-indigo-600 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <i className={`fa-solid ${link.icon} text-[10px] ${currentPage === link.id ? 'opacity-100' : 'opacity-40'}`}></i>
                    {link.name}
                  </div>
                </button>
              ))}
              {user.isLoggedIn && currentLinks.length > (user.isAdmin ? 6 : 8) && (
                 <button onClick={() => setIsUserMenuOpen(true)} className="px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-all">
                    <i className="fa-solid fa-ellipsis"></i>
                 </button>
              )}
            </div>

            {/* User Session Hub (Desktop Authorized Node Section) */}
            <div className="flex items-center gap-4">
              {!user.isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleNavClick('login')} 
                    className="hidden md:block px-4 py-4 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => handleNavClick('login')} 
                    className="group relative h-14 px-8 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:bg-indigo-600 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 overflow-hidden flex items-center gap-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="relative z-10">Get Started</span>
                    <i className="fa-solid fa-chevron-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Dynamic Coin Vault Display */}
                  <div 
                    onClick={() => handleNavClick(user.isAdmin ? 'admin-overview' : 'wallet')}
                    className={`hidden sm:flex items-center gap-5 pl-6 pr-1.5 py-1.5 rounded-2xl cursor-pointer transition-all border shadow-2xl group ${user.isAdmin ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-slate-200/50'}`}
                  >
                    <div className="flex flex-col">
                       <span className={`text-[13px] font-black leading-none tabular-nums tracking-tighter ${user.isAdmin ? 'text-white' : 'text-slate-900'}`}>
                         {user.coins.toLocaleString()}
                       </span>
                       <span className={`text-[7px] font-black uppercase tracking-widest mt-1.5 opacity-60 ${user.isAdmin ? 'text-indigo-300' : 'text-slate-400'}`}>
                         Vault Units
                       </span>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black group-hover:scale-105 transition-all shadow-sm ${user.isAdmin ? 'bg-indigo-600' : 'bg-indigo-500 shadow-indigo-200'}`}>
                      <i className={`fa-solid ${user.isAdmin ? 'fa-bolt' : 'fa-plus'} text-xs`}></i>
                    </div>
                  </div>

                  {/* Profile & Dropdown Module */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-sm active:scale-95 ${
                        isUserMenuOpen ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-white text-slate-900'
                      }`}
                    >
                      <span className="font-black text-[13px] uppercase">{user.username.charAt(0)}</span>
                    </button>

                    {isUserMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                        <div className="absolute right-0 mt-4 w-[340px] bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_60px_120px_-20px_rgba(15,23,42,0.2)] p-6 z-20 animate-in fade-in zoom-in-95 duration-300">
                          
                          {/* Desktop Authorized Node Identity Card */}
                          <div className={`p-6 mb-6 rounded-[2rem] border relative overflow-hidden ${user.isAdmin ? 'bg-slate-900 border-slate-800 text-white shadow-2xl' : 'bg-slate-50 border-slate-200/60'}`}>
                             <div className="relative z-10">
                                <p className={`text-[8px] font-black uppercase tracking-[0.3em] mb-2 ${user.isAdmin ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                  {user.isAdmin ? 'Systems Administrator' : 'Authorized Network Node'}
                                </p>
                                <p className={`text-xl font-black truncate tracking-tighter mb-4 ${user.isAdmin ? 'text-white' : 'text-slate-900'}`}>{user.username}</p>
                                
                                <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100/10">
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                                        <span className={`text-[9px] font-black uppercase ${user.isAdmin ? 'text-slate-400' : 'text-slate-500'}`}>Session Secure</span>
                                      </div>
                                      <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg border ${user.isAdmin ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-indigo-600 border-indigo-100'}`}>
                                        {user.isAdmin ? 'RANK: ADMIN' : 'RANK: PARTNER'}
                                      </span>
                                   </div>
                                   <p className={`text-[9px] font-bold ${user.isAdmin ? 'text-slate-500' : 'text-slate-400'}`}>UID: <span className="font-mono">{user.id}</span></p>
                                </div>
                             </div>
                             {user.isAdmin && <i className="fa-solid fa-shield absolute -right-4 -bottom-4 text-7xl opacity-5"></i>}
                          </div>

                          {/* Quick Navigation Grid */}
                          <div className="grid grid-cols-2 gap-2">
                            {finalAuthLinks.slice(0, 8).map(link => (
                              <button 
                                key={link.id} 
                                onClick={() => handleNavClick(link.id)} 
                                className={`flex flex-col items-start p-4 rounded-2xl transition-all group ${
                                  currentPage === link.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'
                                }`}
                              >
                                <i className={`fa-solid ${link.icon} text-xs mb-3 ${currentPage === link.id ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-600'}`}></i>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${currentPage === link.id ? 'text-indigo-600' : 'text-slate-500'}`}>{link.name}</span>
                              </button>
                            ))}
                          </div>

                          <div className="h-px bg-slate-100 my-6"></div>

                          {/* Account Control Hub */}
                          <div className="space-y-2">
                            <button 
                              onClick={() => handleNavClick('profile')}
                              className="w-full text-left px-5 py-4 rounded-2xl hover:bg-slate-50 flex items-center gap-4 text-slate-600 transition-colors"
                            >
                              <i className="fa-solid fa-user-gear text-xs opacity-40"></i>
                              <span className="text-[10px] font-black uppercase tracking-widest">Global Settings</span>
                            </button>
                            <button 
                              onClick={onLogout} 
                              className="w-full text-left px-5 py-4 rounded-2xl bg-rose-50/50 hover:bg-rose-50 flex items-center gap-4 text-rose-500 transition-all border border-rose-100/30 active:scale-[0.98]"
                            >
                              <i className="fa-solid fa-power-off text-xs"></i>
                              <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Re-designed Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[200]">
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-4 left-4 bottom-4 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left-8 duration-500 rounded-[2.5rem] border border-slate-100 overflow-hidden">
             <div className="p-8 flex items-center justify-between border-b border-slate-50 bg-white">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 flex items-center justify-center bg-slate-900 rounded-xl p-2.5">
                    <Logo className="h-full w-full" />
                  </div>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">AdsPredia</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-11 h-11 bg-slate-50 rounded-xl text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all shadow-sm"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
             </div>

             <div className="flex-grow overflow-y-auto p-6 space-y-8 no-scrollbar bg-white">
               {user.isLoggedIn && (
                 <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 mb-4">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">Active Node Profile</p>
                    <p className="text-xl font-black tracking-tight truncate mb-4">{user.username}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                       <div>
                          <p className="text-[14px] font-black leading-none">{user.coins.toLocaleString()}</p>
                          <p className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-70">Units Verified</p>
                       </div>
                       <button onClick={() => handleNavClick('wallet')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/20 transition-all">
                          Vault Hub
                       </button>
                    </div>
                 </div>
               )}

               {!user.isLoggedIn ? (
                 <div className="space-y-6">
                    <div className="px-2">
                       <button 
                         onClick={() => handleNavClick('login')} 
                         className="group relative w-full h-16 bg-slate-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:bg-indigo-600 transition-all duration-300 active:scale-95 overflow-hidden flex items-center justify-center gap-4 mb-6"
                       >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                         <span className="relative z-10 uppercase">Authorize Access</span>
                         <i className="fa-solid fa-arrow-right-to-bracket text-[10px]"></i>
                       </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-6">Navigation Hub</p>
                      {publicLinks.map(link => renderMobileLink(link))}
                    </div>
                 </div>
               ) : (
                 <div className="space-y-8 pb-10">
                    {user.isAdmin && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 ml-6 flex items-center gap-3">
                           <i className="fa-solid fa-shield-halved"></i>
                           Administrator Tools
                        </p>
                        {adminLinks.map(link => renderMobileLink(link))}
                        <div className="h-px bg-slate-100 my-6 mx-6"></div>
                      </div>
                    )}

                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-6">
                         Operational Control
                       </p>
                       {authLinks.map(link => renderMobileLink(link))}
                    </div>
                 </div>
               )}
             </div>

             <div className="p-8 bg-slate-50/80 rounded-b-[2.5rem] border-t border-slate-200/50">
               {user.isLoggedIn ? (
                  <button 
                    onClick={onLogout} 
                    className="w-full py-5 rounded-2xl bg-white border border-rose-100 text-rose-500 font-black text-[11px] uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-4 shadow-sm"
                  >
                    <i className="fa-solid fa-power-off"></i>
                    Terminate Session
                  </button>
               ) : (
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Session Not Synchronized</p>
                  </div>
               )}
             </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Navbar;
