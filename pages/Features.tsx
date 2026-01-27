
import React from 'react';

const Features: React.FC = () => {
  const featureList = [
    {
      title: "AI Proof Verification",
      desc: "Our neural network checks every screenshot for authenticity, ensuring advertisers get real results and workers get instant pay through automated audit nodes.",
      icon: "fa-brain",
      color: "indigo"
    },
    {
      title: "Smart Escrow System",
      desc: "Campaign funds are locked the moment a task is created. Your hard-earned coins are always guaranteed and held in secure, multi-sig vault environments.",
      icon: "fa-shield-halved",
      color: "emerald"
    },
    {
      title: "Organic Web Signals",
      desc: "Drive authentic website traffic with high retention. Our network ensures real human navigation, scroll depth, and interaction patterns that boost SEO rankings.",
      icon: "fa-arrow-pointer",
      color: "blue"
    },
    {
      title: "Global Payout Nodes",
      desc: "Withdraw via Binance, Payeer, or local gateways like Easypaisa. We bridge the gap between global advertising and hyper-local freelancer income.",
      icon: "fa-globe",
      color: "indigo"
    },
    {
      title: "High Precision Targeting",
      desc: "Advertisers can target specific regions, browser types, and demographics to ensure maximum conversion rates and highly relevant engagement data.",
      icon: "fa-crosshairs",
      color: "orange"
    },
    {
      title: "Real-time Analytics",
      desc: "Track your campaign growth or earning history with pixel-perfect charts and detailed ledger entries synchronized with our global blockchain-inspired ledger.",
      icon: "fa-chart-line",
      color: "rose"
    },
    {
      title: "Enterprise Scaling",
      desc: "Deploy thousands of tasks simultaneously. Our infrastructure handles high-velocity traffic spikes without compromising verification speed or accuracy.",
      icon: "fa-layer-group",
      color: "blue"
    },
    {
      title: "Tiered Bonuses",
      desc: "Build your own referral network and earn lifetime commissions from every task your partners complete. Grow your node hierarchy for massive yield.",
      icon: "fa-network-wired",
      color: "purple"
    },
    {
      title: "Cross-Device Stability",
      desc: "Fully optimized for desktop and mobile. Submit high-resolution portrait screenshots from any smartphone with zero loss in verification fidelity.",
      icon: "fa-mobile-screen-button",
      color: "emerald"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 animate-in fade-in duration-700">
      <div className="text-center mb-24">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-indigo-100 shadow-sm">
          <i className="fa-solid fa-microchip"></i>
          AdsPredia Infrastructure v2.4
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8">
          Advanced <span className="text-indigo-600">Ecosystem</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
          AdsPredia combines high-performance marketing with decentralized micro-tasking to create a high-trust digital economy for the modern web.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {featureList.map((f, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 group flex flex-col items-start">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-8 transition-transform group-hover:scale-110 shadow-sm ${
              f.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
              f.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              f.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              f.color === 'purple' ? 'bg-purple-50 text-purple-600' :
              f.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <i className={`fa-solid ${f.icon}`}></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed flex-grow">{f.desc}</p>
            <div className="mt-8 pt-8 border-t border-slate-50 w-full">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Deployment Verified</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 bg-slate-900 rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden shadow-3xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.9]">Ready to scale your <span className="text-indigo-400">digital presence?</span></h2>
            <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed font-medium">
              Join 20,000+ users already optimizing their earnings and campaign performance on the AdsPredia network. Our platform ensures every interaction counts.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <button className="px-12 py-6 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4">
                Start Earning Now
                <i className="fa-solid fa-arrow-right"></i>
              </button>
              <button className="px-12 py-6 bg-white/5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-4">
                View Documentation
                <i className="fa-solid fa-book-open"></i>
              </button>
            </div>
          </div>
          <div className="hidden lg:flex justify-end relative">
            <div className="w-[450px] h-[450px] bg-indigo-500/10 rounded-full border border-indigo-500/20 flex items-center justify-center animate-pulse">
               <i className="fa-solid fa-rocket text-[12rem] text-indigo-400/10 rotate-12"></i>
            </div>
            {/* Floating Badges */}
            <div className="absolute top-10 right-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl animate-bounce">
               <div className="text-[10px] font-black text-indigo-400 uppercase mb-1">Security Node</div>
               <div className="text-sm font-bold">100% Verified</div>
            </div>
            <div className="absolute bottom-10 left-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl animate-bounce delay-700">
               <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">Yield Signal</div>
               <div className="text-sm font-bold">+10k Coins Daily</div>
            </div>
          </div>
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Features;
