
import React from 'react';

const Features: React.FC = () => {
  const featureList = [
    {
      title: "AI Proof Verification",
      desc: "Our neural network checks every screenshot for authenticity, ensuring advertisers get real results and workers get instant pay.",
      icon: "fa-brain",
      color: "indigo"
    },
    {
      title: "Smart Escrow System",
      desc: "Campaign funds are locked the moment a task is created. Your hard-earned coins are always guaranteed.",
      icon: "fa-shield-halved",
      color: "emerald"
    },
    {
      title: "Global Payout Nodes",
      desc: "Withdraw via Binance, Payeer, or local gateways like Easypaisa. We bridge the gap between global ads and local income.",
      icon: "fa-globe",
      color: "blue"
    },
    {
      title: "Tiered Affiliate Bonuses",
      desc: "Build your own referral network and earn 10% lifetime commissions from every task your partners complete.",
      icon: "fa-network-wired",
      color: "purple"
    },
    {
      title: "High Precision Targeting",
      desc: "Advertisers can target specific regions, platforms, and demographics to ensure maximum conversion rates.",
      icon: "fa-crosshairs",
      color: "orange"
    },
    {
      title: "Real-time Analytics",
      desc: "Track your campaign growth or earning history with pixel-perfect charts and detailed ledger entries.",
      icon: "fa-chart-line",
      color: "rose"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-in fade-in duration-700">
      <div className="text-center mb-24">
        <h2 className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Core Architecture</h2>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6">
          Advanced <span className="text-indigo-600">Ecosystem</span>
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
          Ads Predia combines performance marketing with decentralized micro-tasking to create a high-trust digital economy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {featureList.map((f, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 group">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-8 transition-transform group-hover:scale-110 shadow-inner ${
              f.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
              f.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              f.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              f.color === 'purple' ? 'bg-purple-50 text-purple-600' :
              f.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <i className={`fa-solid ${f.icon}`}></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">{f.title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-24 bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-6">Ready to scale your digital presence?</h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
              Join 20,000+ users already optimizing their earnings and campaign performance on the Ads Predia network.
            </p>
            <div className="flex gap-4">
              <button className="px-10 py-5 bg-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all">Start Earning</button>
              <button className="px-10 py-5 bg-white/10 rounded-2xl font-black text-sm uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">Documentation</button>
            </div>
          </div>
          <div className="hidden lg:flex justify-end">
            <div className="w-80 h-80 bg-indigo-500/10 rounded-full border border-indigo-500/20 flex items-center justify-center animate-pulse">
               <i className="fa-solid fa-rocket text-[10rem] text-indigo-400/20"></i>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
};

export default Features;
