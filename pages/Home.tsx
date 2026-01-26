
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
                <span className="text-[9px] font-black text-white uppercase tracking-widest">User_{Math.random().toString(36).substr(2, 5)} just completed a Task</span>
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
                AdsPredia is the global standard for micro-tasking. Complete high-value tasks verified by AI or scale your brand with real organic engagement.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-8 w-full sm:w-auto">
                <button 
                  onClick={() => onStart(isLoggedIn ? 'tasks' : 'login')}
                  className="group relative w-full sm:w-auto px-16 py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all duration-500 hover:bg-indigo-600 hover:scale-105 active:scale-95 shadow-[0_40px_80px_-20px_rgba(37,99,235,0.25)] flex items-center justify-center gap-5 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="relative z-10">Browse Tasks</span>
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
                { label: 'Active Tasks Daily', val: '10+', icon: 'fa-list-check', color: 'text-indigo-600' },
                { label: 'Daily Payouts', val: '100+$', icon: 'fa-money-bill-trend-up', color: 'text-emerald-600' },
                { label: 'Global Freelancers', val: '5k+', icon: 'fa-user-group', color: 'text-blue-600' },
                { label: 'AI Verification', val: '99.9%', icon: 'fa-microchip', color: 'text-rose-600' }
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

      {/* NEW SECTION: MICRO-TASKING ECOSYSTEM (FREELANCING VISUALS) */}
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
                             alt="Professional Freelancer" 
                           />
                           <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="group overflow-hidden rounded-[3rem] shadow-2xl relative">
                           <img 
                             src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop" 
                             className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700" 
                             alt="Digital Workspace" 
                           />
                           <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl">
                              <span className="text-[8px] font-black uppercase text-indigo-600 tracking-widest">Active Job</span>
                              <p className="text-xs font-black text-slate-900">UI/UX Audit sequence</p>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-6 pt-12">
                        <div className="group overflow-hidden rounded-[3rem] shadow-2xl relative">
                           <img 
                             src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop" 
                             className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700" 
                             alt="Micro Jobs Environment" 
                           />
                        </div>
                        <div className="group overflow-hidden rounded-[3rem] shadow-2xl relative">
                           <img 
                             src="https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=600&auto=format&fit=crop" 
                             className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700" 
                             alt="Team Strategy" 
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
                              <p className="text-white text-sm font-bold italic leading-tight">"AdsPredia transformed my spare time into a global career."</p>
                           </div>
                        </div>
                     </div>
                  </div>
                  {/* Floating Metric Badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 p-10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 hidden md:block z-20">
                     <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Live Workforce</span>
                        </div>
                        <p className="text-5xl font-black text-white leading-none tracking-tighter">5,420</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3">Verified Task Operators</p>
                     </div>
                  </div>
               </div>

               <div className="lg:pl-12">
                  <h2 className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Workforce of the Future</h2>
                  <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-12">The Micro-Job <br/><span className="text-indigo-600">Revolution</span></h1>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
                    Monetize every digital interaction. From high-precision app testing to strategic social engagement, our marketplace connects global talent with premium brand objectives.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                     {[
                       { title: 'Anywhere Access', desc: 'Execute tasks from any node, any country, 24/7.', icon: 'fa-earth-africa' },
                       { title: 'Verified Payouts', desc: 'Our AI ensures your work is rewarded instantly.', icon: 'fa-shield-check' },
                       { title: 'Skill Scaling', desc: 'Unlock higher tier tasks as your reliability grows.', icon: 'fa-chart-line' },
                       { title: 'Daily Liquidity', desc: 'No monthly cycles. Withdraw as soon as you earn.', icon: 'fa-bolt' }
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
                    onClick={() => onStart(isLoggedIn ? 'tasks' : 'login')}
                    className="mt-16 group flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600 hover:text-slate-900 transition-colors"
                  >
                     Explore Earning Categories
                     <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center group-hover:translate-x-3 transition-transform">
                        <i className="fa-solid fa-arrow-right-long"></i>
                     </div>
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* DOUBLE OPERATION (HOW IT WORKS) */}
      <section className="bg-slate-50 py-32 relative">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
           <div className="text-center mb-24">
              <h2 className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Operational Protocol</h2>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">Choose Your <span className="text-indigo-600">Objective</span></h1>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Earner Side */}
              <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                 <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover opacity-[0.05] group-hover:scale-110 transition-transform duration-1000" alt="Earner Path Background" />
                 </div>
                 <div className="p-12 md:p-16 relative z-10">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-10 border border-emerald-100">
                       <i className="fa-solid fa-coins"></i>
                       Freelance Earner Path
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 mb-12 tracking-tight leading-none">Earn with Freelance <br/>Market Place</h3>
                    
                    <div className="space-y-10">
                       {[
                         { step: '01', title: 'Identity Sync', desc: 'Register your secure node and access the global task marketplace instantly.' },
                         { step: '02', title: 'Execute Operation', desc: 'Select high-yield micro-tasks across Video, Web, and Social platforms.' },
                         { step: '03', title: 'Claim Yield', desc: 'Submit AI-verified proof and withdraw your coins to Payeer or Binance.' }
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
                 <i className="fa-solid fa-laptop-code absolute -right-12 -bottom-12 text-[15rem] text-slate-50 rotate-12 pointer-events-none group-hover:text-indigo-50 transition-colors duration-500"></i>
              </div>

              {/* Advertiser Side */}
              <div className="bg-slate-900 rounded-[4rem] text-white shadow-3xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                 <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover opacity-10 group-hover:scale-110 transition-transform duration-1000" alt="Advertiser Path Background" />
                 </div>
                 <div className="p-12 md:p-16 relative z-10">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-10">
                       <i className="fa-solid fa-bullhorn"></i>
                       Brand Advertiser Path
                    </div>
                    <h3 className="text-4xl font-black text-white mb-12 tracking-tight leading-none">Scale Your Reach <br/>with Organic Signal</h3>
                    
                    <div className="space-y-10">
                       {[
                         { step: '01', title: 'Asset Funding', desc: 'Deposit coins into your escrow-protected vault to power your campaign reach.' },
                         { step: '02', title: 'Define Specs', desc: 'Create high-precision task instructions for our global network of verified users.' },
                         { step: '03', title: 'Analyze Growth', desc: 'Track real-time engagement and only pay for verified, authentic interactions.' }
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
                 <i className="fa-solid fa-rocket absolute -right-12 -bottom-12 text-[15rem] text-white/5 -rotate-12 pointer-events-none group-hover:text-indigo-400/10 transition-colors duration-500"></i>
              </div>
           </div>
        </div>
      </section>

      {/* MARKETPLACE VERTICALS */}
      <section className="bg-white py-32 border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
             <div className="max-w-2xl">
                <h2 className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Earning Spectrum</h2>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">Marketplace <br/>Categories</h1>
             </div>
             <p className="text-slate-500 font-medium text-lg max-w-sm">Diverse task modalities designed for rapid completion and high unit yield.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { id: 'YouTube', icon: 'fa-youtube', color: 'bg-rose-50 text-rose-500', label: 'Video Ops', desc: 'Views, subs, and engagement sequences for creators.' },
               { id: 'Websites', icon: 'fa-globe', color: 'bg-indigo-50 text-indigo-500', label: 'Web Traffic', desc: 'Strategic navigation and authentic site engagement.' },
               { id: 'Apps', icon: 'fa-mobile-screen', color: 'bg-emerald-50 text-emerald-500', label: 'App Installs', desc: 'Secure installs and rating audits for mobile growth.' },
               { id: 'Social', icon: 'fa-share-nodes', color: 'bg-blue-50 text-blue-500', label: 'Social Reach', desc: 'Accelerate presence across FB, X, and Instagram.' }
             ].map((cat, i) => (
               <div key={i} className="bg-slate-50 p-10 rounded-[3rem] border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-500 group cursor-pointer shadow-none hover:shadow-xl">
                  <div className={`w-16 h-16 ${cat.color} rounded-[1.5rem] flex items-center justify-center text-2xl mb-8 shadow-sm group-hover:scale-110 transition-transform`}>
                    <i className={`fa-solid ${cat.icon}`}></i>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-4">{cat.label}</h4>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{cat.desc}</p>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                    Explore Verticals <i className="fa-solid fa-arrow-right-long"></i>
                  </span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* HIGH-TRUST INFRASTRUCTURE */}
      <section className="bg-slate-900 py-40 relative">
         <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
         <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
               <div>
                  <h2 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Security Stack</h2>
                  <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-12">Built on <br/><span className="text-indigo-500">Unbreakable</span> Trust</h1>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                     <div className="space-y-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-indigo-400">
                           <i className="fa-solid fa-brain"></i>
                        </div>
                        <h4 className="text-lg font-black text-white">AI Proof Audit</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Neural nodes analyze visual proof to ensure 100% human authenticity.</p>
                     </div>
                     <div className="space-y-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-emerald-400">
                           <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <h4 className="text-lg font-black text-white">Escrow Protection</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Funds are locked in high-security vaults until verification is complete.</p>
                     </div>
                     <div className="space-y-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-blue-400">
                           <i className="fa-solid fa-bolt"></i>
                        </div>
                        <h4 className="text-lg font-black text-white">Instant Settlement</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Verified tasks settle coins into your earner node in milliseconds.</p>
                     </div>
                     <div className="space-y-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-amber-400">
                           <i className="fa-solid fa-globe"></i>
                        </div>
                        <h4 className="text-lg font-black text-white">Global Nodes</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">Access earnings via Binance, Payeer, or local payment hubs.</p>
                     </div>
                  </div>
               </div>

               <div className="relative">
                  <div className="bg-slate-800 rounded-[5rem] overflow-hidden shadow-3xl border border-white/10 relative group h-[600px]">
                     <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="Security Infrastructure" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent flex flex-col justify-end p-12">
                        <div className="w-24 h-24 bg-white/10 rounded-[2rem] border border-white/10 flex items-center justify-center mb-10 shadow-2xl backdrop-blur-xl">
                           <i className="fa-solid fa-lock text-5xl text-white"></i>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-6">Securing over <br/>$1.5M in Assets</h3>
                        <p className="text-indigo-200 font-medium mb-12">Our multi-tier infrastructure ensures that AdsPredia remains the safest micro-tasking environment on the web.</p>
                        <div className="flex flex-wrap gap-4">
                           <span className="px-4 py-2 bg-black/40 rounded-xl text-[10px] font-black uppercase border border-white/10 backdrop-blur-sm">TLS 1.3 Encryption</span>
                           <span className="px-4 py-2 bg-black/40 rounded-xl text-[10px] font-black uppercase border border-white/10 backdrop-blur-sm">AES-256 Storage</span>
                        </div>
                     </div>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full"></div>
               </div>
            </div>
         </div>
      </section>

      {/* FINAL DEPLOYMENT (CTA) */}
      <section className="bg-slate-50 py-40">
         <div className="max-w-[1600px] mx-auto px-6 md:px-12">
            <div className="bg-slate-950 rounded-[5rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-3xl min-h-[600px] flex items-center justify-center">
               <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover opacity-20" alt="Final CTA Background" />
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-slate-950"></div>
               </div>
               <div className="relative z-10 max-w-4xl mx-auto">
                  <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-none animate-in fade-in zoom-in duration-1000">Ready for <br/><span className="text-indigo-500">Operation?</span></h1>
                  <p className="text-indigo-100 text-xl font-medium mb-16 leading-relaxed opacity-80">Join the global elite of micro-tasking. Choose your path and start scaling your digital yield today.</p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-8">
                     <button 
                       onClick={() => onStart(isLoggedIn ? 'tasks' : 'login')}
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

               {/* Background Decorative */}
               <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[160px]"></div>
               </div>
               <i className="fa-solid fa-network-wired absolute -left-16 -bottom-16 text-[20rem] text-white/5 rotate-12 pointer-events-none"></i>
               <i className="fa-solid fa-microchip absolute -right-16 -top-16 text-[20rem] text-white/5 -rotate-12 pointer-events-none"></i>
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
