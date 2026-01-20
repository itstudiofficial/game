
import React from 'react';

const Home: React.FC<{ onStart: (p: string) => void, isLoggedIn: boolean }> = ({ onStart, isLoggedIn }) => {
  return (
    <div className="space-y-0 overflow-hidden">
      {/* Immersive Hero Architecture */}
      <section id="home" className="relative min-h-screen flex items-center pt-32 pb-40 overflow-hidden bg-slate-50">
        
        {/* Dynamic Background Canvas */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent opacity-60"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          {/* Animated Glow Nodes */}
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 w-full">
          <div className="flex flex-col items-center text-center">
            
            {/* AdsPredia Brand Shield */}
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-slate-100 mb-12 animate-in fade-in slide-in-from-top-6 duration-700">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-shield-halved text-indigo-600 text-xs"></i>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                  Ads<span className="text-indigo-600">Predia</span>
                </span>
              </div>
              <div className="w-px h-3 bg-slate-200"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Network Active: <span className="text-indigo-600">Verified</span>
              </span>
            </div>

            {/* High-Impact Hero Typography */}
            <div className="relative mb-14 max-w-6xl px-4">
              <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-black tracking-tighter leading-[0.85] text-slate-900 mb-8 drop-shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                The <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-800 drop-shadow-sm">
                  Future of Freelance Income
                </span>
              </h1>
              
              {/* Floating Asset Displays */}
              <div className="hidden xl:block absolute -bottom-10 -right-24 w-44 h-44 bg-slate-900 rounded-[3rem] shadow-3xl -rotate-6 flex flex-col items-center justify-center p-8 transition-transform hover:rotate-0 duration-500">
                 <div className="text-3xl font-black text-white tracking-tighter">$10k+</div>
                 <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-2">Daily Payouts</div>
              </div>
            </div>
            
            <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed mb-16 px-6">
              AdsPredia is the global standard for micro-tasking. Complete high-value tasks verified by AI or scale your brand with human-centric organic engagement.
            </p>
            
            {/* Primary Action Suite */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 w-full sm:w-auto px-6">
              <button 
                onClick={() => onStart(isLoggedIn ? 'tasks' : 'login')}
                className="group relative w-full sm:w-auto px-16 py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all duration-500 hover:bg-indigo-600 hover:scale-105 active:scale-95 shadow-[0_40px_80px_-20px_rgba(79,70,229,0.35)] flex items-center justify-center gap-5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span className="relative z-10">Get Started Now</span>
                </div>
                <i className="fa-solid fa-arrow-right relative z-10 group-hover:translate-x-2 transition-transform"></i>
              </button>
              
              <button 
                onClick={() => onStart(isLoggedIn ? 'create' : 'login')}
                className="w-full sm:w-auto px-16 py-8 bg-white text-slate-900 border-2 border-slate-100 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-5 shadow-xl shadow-slate-200/40"
              >
                <i className="fa-solid fa-bullhorn text-indigo-600"></i>
                Launch Campaign
              </button>
            </div>

            {/* Platform Credibility Strip */}
            <div className="mt-28 flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               <div className="flex items-center gap-4">
                 <i className="fa-solid fa-shield-halved text-3xl"></i>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Escrow Secured</span>
               </div>
               <div className="flex items-center gap-4">
                 <i className="fa-solid fa-bolt-lightning text-3xl"></i>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Instant Payout</span>
               </div>
               <div className="flex items-center gap-4">
                 <i className="fa-solid fa-user-check text-3xl"></i>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">10k+ Network Users</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numerical Insights */}
      <section className="bg-white border-y border-slate-100 py-24 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-0">
            {[
              { label: 'Network Payouts', val: '$10k+', icon: 'fa-money-bill-trend-up', color: 'text-emerald-500' },
              { label: 'Daily Campaigns', val: '100+', icon: 'fa-layer-group', color: 'text-indigo-600' },
              { label: 'Market Partners', val: '10k+', icon: 'fa-users', color: 'text-blue-500' },
              { label: 'Conversion Rate', val: '99.8%', icon: 'fa-circle-check', color: 'text-amber-500' }
            ].map((stat, i) => (
              <div key={i} className="text-center group flex flex-col items-center md:border-r border-slate-50 last:border-0 px-8">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
                  <i className={`fa-solid ${stat.icon} ${stat.color} text-xl group-hover:text-white`}></i>
                </div>
                <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2 tabular-nums">{stat.val}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose AdsPredia Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-24 max-w-4xl mx-auto">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] block mb-6">Core Advantage</span>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 leading-none">
              Why Choose <span className="text-indigo-600">AdsPredia</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium">We built the world's most transparent micro-tasking engine, combining advanced security with unparalleled earning potential.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: 'AI-Verified Proof',
                desc: 'Our neural network automatically validates completion screenshots, ensuring advertisers get real results and workers get paid instantly.',
                icon: 'fa-microchip',
                color: 'bg-indigo-600'
              },
              {
                title: 'Instant Liquidity',
                desc: 'No more waiting weeks for payouts. Withdraw your coins via Binance, Payeer, or local gateways within minutes of verification.',
                icon: 'fa-bolt-lightning',
                color: 'bg-emerald-500'
              },
              {
                title: 'Escrow Security',
                desc: 'All campaign funds are locked in our secure escrow system at launch. Your rewards are guaranteed and protected.',
                icon: 'fa-vault',
                color: 'bg-blue-600'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-all duration-500 group">
                <div className={`w-20 h-20 ${feature.color} rounded-[2rem] flex items-center justify-center text-white text-3xl mb-10 shadow-2xl transition-transform group-hover:rotate-12`}>
                  <i className={`fa-solid ${feature.icon}`}></i>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-6">{feature.title}</h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Start Your Journey Today Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="bg-slate-900 rounded-[5rem] p-12 md:p-32 text-white relative overflow-hidden shadow-3xl">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]"></div>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="max-w-3xl text-center lg:text-left">
                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em] block mb-8">Onboarding Sequence</span>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-12">
                  Start Your <br/>
                  <span className="text-indigo-500">Journey Today</span>
                </h2>
                <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-wxl mx-auto lg:mx-0">
                  Join the global movement of digital freelancers and performance advertisers. Your first coin is just 60 seconds away.
                </p>
              </div>

              <div className="flex flex-col gap-6 w-full lg:w-auto">
                <button 
                  onClick={() => onStart(isLoggedIn ? 'dashboard' : 'login')}
                  className="w-full lg:w-[400px] py-8 bg-indigo-600 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6"
                >
                  <i className="fa-solid fa-user-plus"></i>
                  Get Started
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-center backdrop-blur-md">
                    <p className="text-3xl font-black text-white">10k+</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Active Nodes</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-center backdrop-blur-md">
                    <p className="text-3xl font-black text-white">100%</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Secure Escrow</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Flair */}
            <i className="fa-solid fa-rocket absolute -left-20 -bottom-20 text-[30rem] text-white/5 -rotate-12 pointer-events-none"></i>
          </div>
        </div>
      </section>
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
