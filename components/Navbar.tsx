
import React, { useState, useEffect } from 'react';

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
    { name: 'Tasks', id: 'tasks', icon: 'fa-list-check' },
    { name: 'Create', id: 'create', icon: 'fa-bullhorn' },
    { name: 'Wallet', id: 'wallet', icon: 'fa-wallet' },
    { name: 'Spin', id: 'spin', icon: 'fa-clover' },
    { name: 'Affiliate', id: 'referrals', icon: 'fa-users' },
  ];

  const publicLinks = [
    { name: 'Home', id: 'home', icon: 'fa-house' },
    { name: 'Features', id: 'features', icon: 'fa-layer-group' },
    { name: 'Contact', id: 'contact', icon: 'fa-headset' },
  ];

  if (user.isAdmin) {
    authLinks.unshift({ name: 'Admin', id: 'admin', icon: 'fa-user-shield' });
  }

  const currentLinks = user.isLoggedIn ? authLinks : publicLinks;

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
          scrolled 
            ? 'py-4 bg-white/70 backdrop-blur-3xl border-b border-slate-200/40 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.08)]' 
            : 'py-8 bg-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex justify-between items-center">
            
            {/* AdsPredia Logo Base */}
            <div className="flex items-center gap-6">
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
                <div className="flex items-center bg-white pr-6 pl-2 py-2 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/40 group-hover:rotate-12 transition-all duration-500">
                    <i className="fa-solid fa-coins text-white text-base"></i>
                  </div>
                  <div className="ml-3">
                    <span className="text-xl font-black tracking-tighter text-slate-900 block leading-none">
                      Ads<span className="text-indigo-600">Predia</span>
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1 block">Income Hub</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Hub */}
            <div className="hidden lg:flex items-center bg-slate-100/40 p-1.5 rounded-[1.75rem] border border-slate-200/30 backdrop-blur-sm">
              {currentLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                    currentPage === link.id 
                      ? 'text-indigo-600 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${link.icon} text-[11px] ${currentPage === link.id ? 'opacity-100' : 'opacity-40'}`}></i>
                    {link.name}
                  </div>
                </button>
              ))}
            </div>

            {/* User Session Hub */}
            <div className="flex items-center gap-4">
              {!user.isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleNavClick('login')} 
                    className="hidden md:block px-6 py-4 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => handleNavClick('login')} 
                    className="bg-slate-900 text-white px-10 py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-indigo-600 hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Financial Status */}
                  <div 
                    onClick={() => handleNavClick('wallet')}
                    className="flex items-center gap-5 pl-6 pr-2.5 py-2.5 bg-slate-900 rounded-[1.5rem] cursor-pointer hover:bg-indigo-950 transition-all border border-slate-800 shadow-2xl shadow-indigo-100/10 group"
                  >
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-white leading-none tabular-nums tracking-tighter">
                         {user.coins.toLocaleString()}
                       </span>
                       <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mt-1.5 opacity-70">Coin Vault</span>
                    </div>
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black group-hover:rotate-12 transition-all">
                      <i className="fa-solid fa-plus text-xs"></i>
                    </div>
                  </div>

                  {/* Profile Context */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${
                        isUserMenuOpen ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-white text-slate-900 shadow-sm'
                      }`}
                    >
                      <span className="font-black text-xs uppercase">{user.username.charAt(0)}</span>
                    </button>

                    {isUserMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                        <div className="absolute right-0 mt-5 w-80 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_50px_100px_-15px_rgba(0,0,0,0.15)] p-5 z-20 animate-in fade-in zoom-in-95">
                          <div className="p-6 mb-5 bg-slate-50/80 rounded-[2rem] border border-slate-100">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorized Node</p>
                             <p className="text-base font-black text-slate-900 truncate tracking-tight mb-4">{user.username}</p>
                             <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                  <span className="text-[9px] font-black text-slate-500 uppercase">Active Now</span>
                                </div>
                                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">PARTNER</span>
                             </div>
                          </div>
                          
                          <div className="space-y-1">
                            {authLinks.slice(0, 5).map(link => (
                              <button 
                                key={link.id} 
                                onClick={() => handleNavClick(link.id)} 
                                className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all ${
                                  currentPage === link.id ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
                                }`}
                              >
                                <i className={`fa-solid ${link.icon} w-5 text-center text-xs opacity-50`}></i>
                                <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                              </button>
                            ))}
                          </div>

                          <div className="h-px bg-slate-100 my-5 mx-3"></div>
                          
                          <button 
                            onClick={onLogout} 
                            className="w-full text-left px-5 py-4 rounded-2xl hover:bg-red-50 flex items-center gap-4 text-red-500 transition-colors"
                          >
                            <i className="fa-solid fa-power-off w-5 text-center text-xs"></i>
                            <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
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

      {/* Mobile Context Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[200]">
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          <div className="fixed top-4 left-4 bottom-4 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left-8 duration-500 rounded-[3rem] border border-slate-100">
             <div className="p-10 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-coins text-white text-lg"></i>
                  </div>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">AdsPredia</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-12 h-12 bg-slate-50 rounded-2xl text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
             </div>

             <div className="flex-grow overflow-y-auto p-8 space-y-10">
               {user.isLoggedIn && (
                 <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-3xl">
                    <div className="relative z-10">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">Your Assets</p>
                      <div className="flex items-baseline gap-3 mb-8">
                         <p className="text-5xl font-black tracking-tighter tabular-nums">{user.coins.toLocaleString()}</p>
                         <span className="text-[11px] opacity-40 uppercase font-black">Coins</span>
                      </div>
                      <button 
                        onClick={() => handleNavClick('wallet')}
                        className="w-full py-5 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 active:scale-95"
                      >
                        Deposit Units
                      </button>
                    </div>
                    <i className="fa-solid fa-vault absolute -right-8 -bottom-8 text-8xl text-white/5 rotate-12"></i>
                 </div>
               )}

               <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 ml-6">Main System</p>
                  {currentLinks.map(link => (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`w-full text-left px-8 py-5 rounded-[1.75rem] flex items-center gap-6 transition-all ${
                        currentPage === link.id 
                          ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        currentPage === link.id ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <i className={`fa-solid ${link.icon} text-sm`}></i>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">{link.name}</span>
                    </button>
                  ))}
               </div>
             </div>

             {user.isLoggedIn && (
               <div className="p-10 bg-slate-50/50 rounded-b-[3rem]">
                  <button 
                    onClick={onLogout} 
                    className="w-full py-6 rounded-2xl bg-white border border-red-100 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center justify-center gap-4 shadow-sm"
                  >
                    <i className="fa-solid fa-power-off"></i>
                    Terminate Session
                  </button>
               </div>
             )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
