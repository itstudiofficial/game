
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
    { name: 'Tasks', id: 'tasks', icon: 'fa-list-check' },
    { name: 'Create', id: 'create', icon: 'fa-bullhorn' },
    { name: 'My Campaigns', id: 'my-campaigns', icon: 'fa-paper-plane' },
    { name: 'Wallet', id: 'wallet', icon: 'fa-wallet' },
    { name: 'Spin', id: 'spin', icon: 'fa-clover' },
    { name: 'Affiliate', id: 'referrals', icon: 'fa-users' },
    { name: 'Profile', id: 'profile', icon: 'fa-user-gear' },
  ];

  const adminLinks = [
    { name: 'Admin Hub', id: 'admin-overview', icon: 'fa-user-shield' },
    { name: 'Users', id: 'admin-users', icon: 'fa-users' },
    { name: 'Reviews', id: 'admin-reviews', icon: 'fa-camera-retro' },
    { name: 'Tasks Audit', id: 'admin-tasks', icon: 'fa-list-check' },
    { name: 'Finance', id: 'admin-finance', icon: 'fa-wallet-pennied' },
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

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
          scrolled 
            ? 'py-4 bg-white/80 backdrop-blur-2xl border-b border-slate-200/40 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.08)]' 
            : 'py-6 bg-white/40 backdrop-blur-md border-b border-white/20'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex justify-between items-center">
            
            {/* Logo Section */}
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
                  <div className="h-10 w-10 overflow-hidden rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6">
                    <Logo className="h-full w-full" />
                  </div>
                  <div className="ml-3">
                    <span className="text-xl font-black tracking-tighter text-slate-900 block leading-none">
                      Ads<span className="text-indigo-600">Predia</span>
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1 block">
                      {user.isAdmin ? 'Admin Network' : 'Verified Marketplace'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center bg-slate-900/5 p-1.5 rounded-[1.75rem] border border-slate-200/30 backdrop-blur-sm overflow-x-auto no-scrollbar max-w-[65%] xl:max-w-none">
              {currentLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
                    currentPage === link.id 
                      ? 'text-indigo-600 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <i className={`fa-solid ${link.icon} text-[10px] ${currentPage === link.id ? 'opacity-100' : 'opacity-40'}`}></i>
                    {link.name}
                  </div>
                </button>
              ))}
            </div>

            {/* User Session Hub */}
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
                    className="group relative h-14 px-8 bg-slate-900 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:bg-indigo-600 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 overflow-hidden flex items-center gap-4"
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
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => handleNavClick(user.isAdmin ? 'admin-overview' : 'wallet')}
                    className={`flex items-center gap-5 pl-6 pr-2.5 py-2.5 rounded-[1.5rem] cursor-pointer transition-all border shadow-2xl group ${user.isAdmin ? 'bg-indigo-900 border-indigo-800' : 'bg-slate-900 border-slate-800 shadow-indigo-100/10'}`}
                  >
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-white leading-none tabular-nums tracking-tighter">
                         {user.coins.toLocaleString()}
                       </span>
                       <span className={`text-[7px] font-black uppercase tracking-widest mt-1.5 opacity-70 ${user.isAdmin ? 'text-indigo-200' : 'text-indigo-400'}`}>
                         {user.isAdmin ? 'Admin Vault' : 'Coin Vault'}
                       </span>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black group-hover:rotate-12 transition-all ${user.isAdmin ? 'bg-indigo-600' : 'bg-indigo-600'}`}>
                      <i className={`fa-solid ${user.isAdmin ? 'fa-gear' : 'fa-plus'} text-xs`}></i>
                    </div>
                  </div>

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
                          <div className={`p-6 mb-5 rounded-[2rem] border ${user.isAdmin ? 'bg-indigo-900 border-indigo-800 text-white' : 'bg-slate-50/80 border-slate-100'}`}>
                             <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${user.isAdmin ? 'text-indigo-300' : 'text-slate-400'}`}>
                               {user.isAdmin ? 'Super Administrator' : 'Authorized Node'}
                             </p>
                             <p className={`text-base font-black truncate tracking-tight mb-4 ${user.isAdmin ? 'text-white' : 'text-slate-900'}`}>{user.username}</p>
                             <div className={`flex items-center justify-between pt-4 border-t ${user.isAdmin ? 'border-indigo-800' : 'border-slate-200'}`}>
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                  <span className={`text-[9px] font-black uppercase ${user.isAdmin ? 'text-indigo-200' : 'text-slate-500'}`}>Secure Connection</span>
                                </div>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${user.isAdmin ? 'bg-white/10 text-white border-white/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                  {user.isAdmin ? 'ADMIN' : 'PARTNER'}
                                </span>
                             </div>
                          </div>
                          <div className="space-y-1">
                            {finalAuthLinks.map(link => (
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
                            <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
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

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[200]">
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-4 left-4 bottom-4 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left-8 duration-500 rounded-[3rem] border border-slate-100 overflow-hidden">
             <div className="p-10 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex items-center justify-center">
                    <Logo className="h-full w-full" />
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
               {!user.isLoggedIn && (
                 <div className="px-2">
                    <button 
                      onClick={() => handleNavClick('login')} 
                      className="group relative w-full h-16 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:bg-indigo-600 transition-all duration-300 active:scale-95 overflow-hidden flex items-center justify-center gap-4 mb-6"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </span>
                      <span className="relative z-10">Get Started Now</span>
                      <i className="fa-solid fa-chevron-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                    </button>
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
                    Logout
                  </button>
               </div>
             )}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
