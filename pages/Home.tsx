import React from 'react';
import Logo from '../components/Logo';

const Home: React.FC<{ onStart: (p: string) => void, isLoggedIn: boolean }> = ({ onStart, isLoggedIn }) => {
  return (
    <div className="space-y-0 overflow-hidden">
      
      {/* Real-time Network Ticker */}
      <div className="bg-slate-900 py-3 overflow-hidden whitespace-nowrap border-b border-indigo-500/10 relative z-[60]">
        <div className="flex animate-[ticker_30s_linear_infinite] gap-12 items-center">
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">User_{Math.random().toString(36).substr(2, 5)} just earned rewards</span>
              </div>
              <div className="flex items-center gap-3 text-blue-400">
                <i className="fa-solid fa-circle-check"></i>
                <span className="text-[9px] font-black uppercase tracking-widest">Withdrawal Verified: ${ (Math.random() * 100 + 10).toFixed(2) } via Payeer</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-indigo-50 rounded-full"></span>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">New Campaign Deployed: "Ad Sequence {Math.floor(Math.random()*900 + 100)}"</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Immersive Hero Architecture */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 pb-40 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-100/30 via-transparent to-transparent opacity-60"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-900/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:w-3/5">
              <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 mb-12 animate-in fade-in slide-in-from-top-6 duration-700">
                <div className="flex items-center gap-2">
                  <Logo className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                    Ads<span className="text-indigo-600">Predia</span>
                  </span>
                </div>
                <div className="w-px h-3 bg-slate-200"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Network Active: <span className="text-indigo-600">Verified</span>
                </span>
              </div>

              <div className="relative mb-14 max-w-4xl">
                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[0.9] text-slate-900 mb-8 drop-shadow-[0_20px_40px_rgba(0,0,0,0.02)]">
                  The Smarter Way<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-600 to-indigo-800">
                    to Earn & Advertise Online
                  </span>
                </h1>
              </div>
              
              <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed mb-16">
                AdsPredia is the global standard for digital rewards. Earn coins through simple tasks or scale your brand with real organic engagement.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-8 w-full sm:w-auto">
                <button 
                  onClick={() => onStart(isLoggedIn ? 'dashboard' : 'login')}
                  className="group relative w-full sm:w-auto px-16 py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all duration-500 hover:bg-indigo-600 hover:scale-105 active:scale-95 shadow-[0_40px_80px_-20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-5 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="relative z-10">Start Earning</span>
                  </div>
                  <i className="fa-solid fa-arrow-right relative z-10 group-hover:translate-x-2 transition-transform"></i>
                </button>
                
                <button 
                  onClick={() => onStart(isLoggedIn ? 'create' : 'login')}
                  className="w-full sm:w-auto px-16 py-8 bg-white text-slate-900 border-2 border-slate-100 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-5 shadow-xl shadow-slate-200/40"
                >
                  <Logo className="h-6 w-6" />
                  Launch Campaign
                </button>
              </div>
            </div>

            <div className="lg:w-2/5 relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
               <div className="relative z-10 bg-white p-4 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 transform rotate-2 hover:rotate-0 transition-transform duration-700">
                  <img 
                    src="https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=800&auto=format&fit=crop" 
                    alt="Premium Fintech Success Visualization" 
                    className="rounded-[3rem] w-full h-[550px] object-cover shadow-2xl"
                    loading="eager"
                  />
                  <div className="absolute -bottom-10 -left-10 bg-slate-900 p-8 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] text-white animate-bounce-slow border border-white/5 backdrop-blur-sm">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                           <i className="fa-solid fa-check-double text-xl"></i>
                        </div>
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 block">Payout Protocol</span>
                           <span className="text-[12px] font-black uppercase tracking-widest text-white">Withdrawal Success</span>
                        </div>
                     </div>
                     <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black tabular-nums">$240.75</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase">Settled</span>
                     </div>
                     <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-8">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Node: PX-99201</p>
                        <i className="fa-brands fa-cc-visa text-white/40 text-lg"></i>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numerical Insights */}
      <section className="bg-white py-24 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              {[
                { label: 'Earning Nodes', val: '20+', icon: 'fa-microchip', color: 'text-indigo-600' },
                { label: 'Daily Payouts', val: '100+$', icon: 'fa-money-bill-trend-up', color: 'text-emerald-600' },
                { label: 'Global Partners', val: '5k+', icon: 'fa-user-group', color: 'text-blue-600' },
                { label: 'AI Verification', val: '99.9%', icon: 'fa-shield-halved', color: 'text-rose-600' }
              ].map((stat, i) => (
                <div key={i} className="group">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 border border-slate-100 shadow-sm">
                      <i className={`fa-solid ${stat.icon} text-xl`}></i>
                   </div>
                   <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2 tabular-nums">{stat.val}</div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ECOSYSTEM SECTION */}
      <section className="bg-white py-32 relative overflow-hidden border-t border-slate-100">
         <div className="max-w-[1600px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
               <div className="relative">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-6">
                        <div className="group overflow-hidden rounded-[3rem] shadow-2xl relative">
                           <img 
                             src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" 
                             className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700" 
                             alt="Professional Partner" 
                           />
                        </div>
                        <div className="group overflow-hidden rounded-[3rem] shadow-2xl relative">
                           <img 
                             src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop" 
                             className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700" 
                             alt="Digital Workspace" 
                           />
                        </div>
                     </div>
                     <div className="space-y-6 pt-12">
                        <div className="group overflow-hidden rounded-[3rem] shadow-2xl relative">
                           <img 
                             src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop" 
                             className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700" 
                             alt="Math Solver Environment" 
                           />
                        </div>
                        <div className="group overflow-hidden rounded-[3rem] shadow-2xl relative">
                           <img 
                             src="https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=600&auto=format&fit=crop" 
                             className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700" 
                             alt="Team Strategy" 
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="lg:pl-12">
                  <h2 className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Workforce of the Future</h2>
                  <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-12">The Micro-Earning <br/><span className="text-indigo-600">Revolution</span></h1>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
                    Monetize your time through simple daily activities. From lucky spins to rapid math challenges, our ecosystem connects users with rewards and brands with reach.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                     {[
                       { title: 'Anywhere Access', desc: 'Earn from any node, any country, 24/7.', icon: 'fa-earth-africa' },
                       { title: 'Verified Payouts', desc: 'Secure blockchain-inspired ledger systems.', icon: 'fa-shield-check' },
                       { title: 'Math Solver', desc: 'Quick cognitive tasks for instant coin yield.', icon: 'fa-calculator' },
                       { title: 'Daily Liquidity', desc: 'Withdraw as soon as you meet the vault threshold.', icon: 'fa-bolt' }
                     ].map((item, i) => (
                       <div key={i} className="flex flex-col gap-4 group">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                             <i className={`fa-solid ${item.icon} text-lg`}></i>
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-slate-900 mb-1">{item.title}</h4>
                             <p className="text-slate-500 text-xs font-bold leading-relaxed">{item.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                  
                  <button 
                    onClick={() => onStart(isLoggedIn ? 'dashboard' : 'login')}
                    className="mt-16 group flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600 hover:text-slate-900 transition-colors"
                  >
                     Explore Earning Hub
                     <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center group-hover:translate-x-3 transition-transform">
                        <i className="fa-solid fa-arrow-right-long"></i>
                     </div>
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* DEPLOYMENT SECTION */}
      <section className="bg-slate-50 py-32 relative">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 text-center">
           <h2 className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Operational Protocol</h2>
           <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-24">Choose Your <span className="text-indigo-600">Objective</span></h1>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Earner Side */}
              <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                 <div className="p-12 md:p-16 relative z-10 text-left">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-10 border border-emerald-100">
                       <i className="fa-solid fa-coins"></i>
                       Partner Earner Path
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 mb-12 tracking-tight leading-none">Earn Coins via <br/>Earning Hub</h3>
                    <div className="space-y-10">
                       {[
                         { step: '01', title: 'Identity Sync', desc: 'Register your secure account and access reward modules instantly.' },
                         { step: '02', title: 'Daily Tasks', desc: 'Engage with daily spins, math puzzles, and affiliate growth.' },
                         { step: '03', title: 'Claim Yield', desc: 'Withdraw your accumulated coins to verified global wallets.' }
                       ].map((item, idx) => (
                         <div key={idx} className="flex gap-8 group/item">
                            <div className="text-2xl font-black text-slate-100 group-hover/item:text-indigo-600 transition-colors">{item.step}</div>
                            <div>
                               <h4 className="text-xl font-black text-slate-900 mb-2">{item.title}</h4>
                               <p className="text-slate-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Advertiser Side */}
              <div className="bg-slate-900 rounded-[4rem] text-white shadow-3xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                 <div className="p-12 md:p-16 relative z-10 text-left">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-10">
                       <i className="fa-solid fa-bullhorn"></i>
                       Brand Advertiser Path
                    </div>
                    <h3 className="text-4xl font-black text-white mb-12 tracking-tight leading-none">Scale Your Reach <br/>with Organic Signal</h3>
                    <div className="space-y-10">
                       {[
                         { step: '01', title: 'Asset Funding', desc: 'Deposit coins into your escrow-protected vault to power your campaign reach.' },
                         { step: '02', title: 'Define Specs', desc: 'Create high-precision task instructions for our verified user network.' },
                         { step: '03', title: 'Analyze Growth', desc: 'Track real-time engagement and only pay for verified interactions.' }
                       ].map((item, idx) => (
                         <div key={idx} className="flex gap-8 group/item">
                            <div className="text-2xl font-black text-white/10 group-hover/item:text-indigo-400 transition-colors">{item.step}</div>
                            <div>
                               <h4 className="text-xl font-black text-white mb-2">{item.title}</h4>
                               <p className="text-slate-400 font-medium text-sm leading-relaxed">{item.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-slate-50 py-40">
         <div className="max-w-[1600px] mx-auto px-6 md:px-12">
            <div className="bg-slate-950 rounded-[5rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-3xl min-h-[600px] flex items-center justify-center">
               <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover opacity-20" alt="Final CTA Background" />
               </div>
               <div className="relative z-10 max-w-4xl mx-auto">
                  <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-none animate-in fade-in zoom-in duration-1000">Ready for <br/><span className="text-indigo-500">Operation?</span></h1>
                  <p className="text-indigo-100 text-xl font-medium mb-16 leading-relaxed opacity-80">Join the global elite of digital rewards. Choose your path and start scaling your yield today.</p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-8">
                     <button 
                       onClick={() => onStart(isLoggedIn ? 'dashboard' : 'login')}
                       className="px-16 py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white hover:text-slate-900 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4"
                     >
                        Start Earning <i className="fa-solid fa-arrow-right"></i>
                     </button>
                     <button 
                       onClick={() => onStart(isLoggedIn ? 'create' : 'login')}
                       className="px-16 py-8 bg-white/10 border border-white/10 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-4 backdrop-blur-md"
                     >
                        Launch Ads <i className="fa-solid fa-bullhorn"></i>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </section>
      
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-bounce-slow {
          animation: bounce 4s infinite ease-in-out;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
};

export default Home;