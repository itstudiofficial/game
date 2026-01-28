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
  ];

  const adminLinks = [
    { name: 'Admin Hub', id: 'admin-overview', icon: 'fa-user-shield' },
    { name: 'Users', id: 'admin-users', icon: 'fa-users' },
    { name: 'Reviews', id: 'admin-reviews', icon: 'fa-camera-retro' },
    { name: 'Finance', id: 'admin-finance', icon: 'fa-wallet' },
  ];

  const publicLinks = [
    { name: 'Home', id: 'home', icon: 'fa-house' },
    { name: 'Features', id: 'features', icon: 'fa-layer-group' },
    { name: 'Contact', id: 'contact', icon: 'fa-headset' },
  ];

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
                  <div className="h-10 w-10 overflow-hidden rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 bg-slate-900 p-2 shadow-[0_0_20px_rgba(37,99,235,0.6)] relative ring-2 ring-indigo-500/20 ring-offset-2 ring-offset-transparent animate-[pulse_3s_infinite]">
                    <Logo className="h-full w-full" />
                  </div>
                  <div className="ml-3">
                    <span className="text-xl font-black tracking-tighter text-slate-900 block leading-none">
                      Ads<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Predia</span>
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1.5 block">
                      {user.isAdmin ? 'Admin Global Hub' : 'Verified Partner'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center bg-slate-900/5 p-1.5 rounded-[1.75rem] border border-slate-200/30 backdrop-blur-sm">
              {(user.isLoggedIn ? (user.isAdmin ? [...adminLinks, ...authLinks] : authLinks) : publicLinks).slice(0, 8).map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
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
            </div>

            <div className="flex items-center gap-4">
              {!user.isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <button onClick={() => handleNavClick('login')} className="hidden md:block px-6 py-4 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600">Login</button>
                  <button onClick={() => handleNavClick('login')} className="h-14 px-8 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-4">Get Started</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div onClick={() => handleNavClick('wallet')} className="hidden sm:flex flex-col items-end pr-4 cursor-pointer group">
                    <span className="text-[13px] font-black text-slate-900 group-hover:text-indigo-600 tabular-nums">{user.coins.toLocaleString()}</span>
                    <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Vault Units</span>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`flex items-center gap-4 pl-5 pr-1.5 py-1.5 rounded-[1.5rem] border transition-all shadow-sm active:scale-95 ${
                        isUserMenuOpen ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Authorized</span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400">UID: {user.id.substring(0, 8)}</span>
                      </div>
                      <div className="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg ring-4 ring-white">
                        {user.username.charAt(0)}
                      </div>
                    </button>

                    {isUserMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                        <div className="absolute right-0 mt-4 w-[340px] bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_60px_120px_-20px_rgba(15,23,42,0.2)] p-6 z-20 animate-in fade-in zoom-in-95 duration-300">
                          
                          <div className="p-6 mb-6 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
                             <div className="relative z-10">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Authenticated Identity</p>
                                <p className="text-xl font-black truncate tracking-tighter mb-4">{user.username}</p>
                                <div className="h-px bg-white/10 mb-4"></div>
                                <div className="flex justify-between items-center">
                                   <span className="text-[9px] font-black uppercase text-slate-500">Node Balance</span>
                                   <span className="text-sm font-black text-indigo-400">{user.coins.toLocaleString()} C</span>
                                </div>
                             </div>
                             <i className="fa-solid fa-fingerprint absolute -right-6 -bottom-6 text-7xl opacity-5"></i>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-6">
                            <button onClick={() => handleNavClick('profile')} className="flex flex-col items-start p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                               <i className="fa-solid fa-user-gear text-xs mb-3 text-slate-300"></i>
                               <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Settings</span>
                            </button>
                            <button onClick={() => handleNavClick('wallet')} className="flex flex-col items-start p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                               <i className="fa-solid fa-wallet text-xs mb-3 text-slate-300"></i>
                               <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Withdraw</span>
                            </button>
                          </div>

                          <div className="h-px bg-slate-100 mb-6"></div>

                          <button 
                            onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                            className="w-full py-5 rounded-[1.5rem] bg-rose-50 text-rose-600 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3 border border-rose-100"
                          >
                            <i className="fa-solid fa-power-off"></i>
                            Terminate Session
                          </button>
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

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[200]">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-4 left-4 bottom-4 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left-8 duration-500 rounded-[2.5rem] border border-slate-100 overflow-hidden">
             <div className="p-8 flex items-center justify-between border-b border-slate-50 bg-white">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center bg-slate-900 rounded-xl p-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                    <Logo className="h-full w-full" />
                  </div>
                  <span className="text-xl font-black text-slate-900 tracking-tighter">AdsPredia</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 bg-slate-50 rounded-xl text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
             </div>

             <div className="flex-grow overflow-y-auto p-6 space-y-8 no-scrollbar bg-white">
               {user.isLoggedIn && (
                 <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-xl mb-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                       <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Node Identity Active</p>
                    </div>
                    <p className="text-xl font-black tracking-tight truncate mb-4">{user.username}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                       <div>
                          <p className="text-[14px] font-black tabular-nums">{user.coins.toLocaleString()}</p>
                          <p className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-70">Units Earned</p>
                       </div>
                       <button onClick={() => handleNavClick('wallet')} className="px-4 py-2 bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/20">
                          Vault Hub
                       </button>
                    </div>
                 </div>
               )}

               <div className="space-y-1">
                 {!user.isLoggedIn ? (
                    publicLinks.map(link => renderMobileLink(link))
                 ) : (
                    <>
                      {user.isAdmin && (
                        <div className="mb-6">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-6">Admin Panel</p>
                          {adminLinks.map(link => renderMobileLink(link))}
                          <div className="h-px bg-slate-100 my-6 mx-6"></div>
                        </div>
                      )}
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-6">Earning Hub</p>
                      {authLinks.map(link => renderMobileLink(link))}
                    </>
                 )}
               </div>
             </div>

             <div className="p-8 bg-slate-50/80 border-t border-slate-200/50">
               {user.isLoggedIn ? (
                  <button 
                    onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                    className="w-full py-5 rounded-2xl bg-white border border-rose-100 text-rose-500 font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3"
                  >
                    <i className="fa-solid fa-power-off"></i>
                    Terminate Session
                  </button>
               ) : (
                  <button onClick={() => handleNavClick('login')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-3">
                    <i className="fa-solid fa-lock"></i>
                    Authorized Access
                  </button>
               )}
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;