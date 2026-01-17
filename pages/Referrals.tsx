
import React, { useState } from 'react';
import { User } from '../types';

interface ReferralsProps {
  user: User;
}

const Referrals: React.FC<ReferralsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'network' | 'banners'>('network');
  const [copied, setCopied] = useState(false);
  const referralLink = `https://adspredia.site/ref/${user.id.toLowerCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bannerTemplates = [
    { 
      id: 1, 
      name: 'Modern Hero', 
      size: '1200x630', 
      class: 'bg-indigo-600', 
      text: 'Earn Daily with Micro-Tasks',
      desc: 'Join the global elite network of earners.'
    },
    { 
      id: 2, 
      name: 'Dark Mode Sidebar', 
      size: '300x600', 
      class: 'bg-slate-900', 
      text: 'Ads Predia: The Future of Freelancing',
      desc: 'Instant Payouts. Real Engagement.'
    },
    { 
      id: 3, 
      name: 'Yellow Flash', 
      size: '728x90', 
      class: 'bg-yellow-400', 
      text: 'Win up to 100 Coins Daily!',
      desc: 'Free Spin inside.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100 shadow-sm">
          Partnership Program
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Global <span className="text-indigo-600">Network</span></h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">Grow your affiliate army. Earn 10% commission on every task completed by your referrals, for life.</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setActiveTab('network')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'network' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className="fa-solid fa-network-wired"></i>
            Network Stats
          </button>
          <button 
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'banners' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className="fa-solid fa-palette"></i>
            Banner Creator
          </button>
        </div>
      </div>

      {activeTab === 'network' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-8 bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Your Unique Referral Link</h3>
              <div className="flex flex-col md:flex-row gap-4 items-center mb-10">
                <div className="flex-1 w-full p-6 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-slate-700 text-sm font-black break-all">
                  {referralLink}
                </div>
                <button 
                  onClick={handleCopy}
                  className={`w-full md:w-auto px-10 py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                    copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'
                  }`}
                >
                  <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                  {copied ? 'Copied Link' : 'Copy Link'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                  <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Total Partners</div>
                  <div className="text-4xl font-black text-indigo-900">0</div>
                </div>
                <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
                  <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Lifetime Coins</div>
                  <div className="text-4xl font-black text-emerald-900">0</div>
                </div>
                <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100">
                  <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">Active Bonus</div>
                  <div className="text-4xl font-black text-amber-900">10%</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <div className="bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                  <div className="relative z-10">
                    <h3 className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-8">Earning Potential</h3>
                    <p className="text-2xl font-black tracking-tight leading-snug">Earn more by doing less.</p>
                    <p className="text-sm text-indigo-100/70 mt-4 leading-relaxed">Our multi-tier system ensures that you earn commission from every task your friends complete. There is no limit to your partnership growth.</p>
                  </div>
                  <i className="fa-solid fa-users absolute -right-4 -bottom-4 text-9xl text-white/10"></i>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'banners' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {bannerTemplates.map(template => (
              <div key={template.id} className="group relative bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all">
                <div className={`h-64 ${template.class} p-8 flex flex-col justify-center items-center text-center text-white`}>
                   <h4 className={`text-2xl font-black tracking-tighter mb-4 ${template.class === 'bg-yellow-400' ? 'text-slate-900' : 'text-white'}`}>
                    {template.text}
                   </h4>
                   <p className={`text-[10px] font-bold uppercase tracking-widest opacity-80 ${template.class === 'bg-yellow-400' ? 'text-slate-700' : 'text-indigo-100'}`}>
                    {template.desc}
                   </p>
                   <div className="mt-8 px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-[8px] font-black tracking-widest">
                      REF CODE: {user.id}
                   </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h5 className="font-black text-slate-900">{template.name}</h5>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{template.size} px</span>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                      <i className="fa-solid fa-expand"></i>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                    <i className="fa-solid fa-download"></i>
                    Generate Banner
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h3 className="text-3xl font-black mb-6">Promote adspredia.site</h3>
              <p className="text-slate-400 leading-relaxed mb-8">All generated banners contain your encrypted referral ID. When a user clicks your banner and signs up, they are automatically placed in your network forever.</p>
              <div className="flex gap-4">
                <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest">HTML Code Available</div>
                <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest">PNG / WEBP Support</div>
              </div>
            </div>
            <i className="fa-solid fa-code absolute top-1/2 right-12 -translate-y-1/2 text-[15rem] text-white/5"></i>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referrals;
