import React, { useState } from 'react';
import { User } from '../types';

interface ReferralsProps {
  user: User;
}

const Referrals: React.FC<ReferralsProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  
  const referralLink = `https://adspredia.site/ref/${user.id.toLowerCase()}`;
  const shareMessage = `Join Ads Predia and start earning daily coins for micro-tasks! Use my link: ${referralLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: 'fa-whatsapp',
      color: 'bg-[#25D366]',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`
    },
    {
      name: 'X (Twitter)',
      icon: 'fa-x-twitter',
      color: 'bg-[#000000]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`
    },
    {
      name: 'Facebook',
      icon: 'fa-facebook',
      color: 'bg-[#1877F2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`
    },
    {
      name: 'Telegram',
      icon: 'fa-telegram',
      color: 'bg-[#0088cc]',
      url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareMessage)}`
    }
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        
        {/* Hub Header */}
        <div className="mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
            <i className="fa-solid fa-users-rays"></i>
            Affiliate Command Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
            Network <span className="text-indigo-600">Growth</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Expand your earning footprint. Recruit active participants and secure a permanent 10% commission stream from their global task completion activity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Referral Control */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white rounded-[4rem] p-10 md:p-16 border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.04)] relative overflow-hidden">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 px-2 flex items-center gap-2">
                <i className="fa-solid fa-id-card text-indigo-500"></i>
                Unique Partner ID URL
              </h3>
              
              <div className="flex flex-col md:flex-row gap-4 items-center mb-16 group">
                <div className="flex-1 w-full p-8 bg-slate-50 rounded-3xl border border-slate-100 font-mono text-slate-700 text-sm font-black break-all shadow-inner group-hover:bg-slate-100 transition-colors">
                  {referralLink}
                </div>
                <button 
                  onClick={handleCopy}
                  className={`w-full md:w-auto px-12 py-8 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 ${
                    copied ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-100 scale-95' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-2xl shadow-slate-200'
                  }`}
                >
                  <i className={`fa-solid ${copied ? 'fa-check-double' : 'fa-copy'}`}></i>
                  {copied ? 'SYNCHRONIZED' : 'COPY LINK'}
                </button>
              </div>

              {/* Social Outreach Kit */}
              <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-bullhorn text-indigo-500"></i>
                    Viral Outreach Kit
                  </h4>
                  <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Instant Share</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {shareLinks.map((share) => (
                    <a
                      key={share.name}
                      href={share.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${share.color} text-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-95 group relative overflow-hidden`}
                    >
                      <i className={`fa-brands ${share.icon} text-3xl group-hover:rotate-12 transition-transform`}></i>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{share.name}</span>
                      <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Visual Asset */}
              <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-40"></div>
            </div>

            {/* Performance Ledger */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-4">Partner Count</div>
                  <div className="text-5xl font-black tracking-tighter mb-2 group-hover:scale-110 transition-transform origin-left">0</div>
                  <p className="text-[10px] font-bold text-indigo-200/60 uppercase">Active Nodes</p>
                </div>
                <i className="fa-solid fa-user-group absolute -right-6 -bottom-6 text-8xl text-white/5 group-hover:rotate-12 transition-transform"></i>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Yield Revenue</div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter mb-2">0</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Lifetime Coins</p>
                </div>
                <i className="fa-solid fa-coins absolute -right-6 -bottom-6 text-8xl text-slate-50 group-hover:text-yellow-500/10 transition-all"></i>
              </div>

              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Yield Multiplier</div>
                  <div className="text-5xl font-black tracking-tighter mb-2">10%</div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Per Task Done</p>
                </div>
                <i className="fa-solid fa-chart-line absolute -right-6 -bottom-6 text-8xl text-white/5"></i>
              </div>
            </div>
          </div>

          {/* Educational Sidebar */}
          <div className="lg:col-span-4 space-y-8 sticky top-28">
            <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl">
              <div className="relative z-10">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-10">Yield Architecture</h3>
                
                <div className="space-y-10">
                  {[
                    { t: 'Permanent Linkage', d: 'Once a user joins via your link, they are locked into your earnings node forever.', icon: 'fa-link' },
                    { t: 'Passive Accumulation', d: 'Every coin they earn from tasks generates an instant 10% bonus for you.', icon: 'fa-bolt-lightning' },
                    { t: 'Automated Payouts', d: 'No claiming required. Affiliate yields are credited directly to your vault.', icon: 'fa-vault' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 shrink-0">
                        <i className={`fa-solid ${item.icon}`}></i>
                      </div>
                      <div>
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-white mb-2">{item.t}</h5>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-indigo-600 rounded-[2.5rem] shadow-xl">
                   <p className="text-[9px] font-black text-indigo-100 uppercase tracking-widest mb-4">Pro Strategy</p>
                   <p className="text-sm font-black leading-snug">Refer 50 active users to earn $50+/month purely from network yield.</p>
                </div>
              </div>
              <i className="fa-solid fa-network-wired absolute -right-16 -bottom-16 text-[20rem] text-white/5 -rotate-12"></i>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Integrity Check</h4>
               <p className="text-xs font-medium text-slate-600 leading-relaxed">
                 Accounts verified as "Self-Referrals" will be immediately flagged by our AI and result in permanent vault termination.
               </p>
            </div>
          </div>
        </div>

        {/* Policy Footer */}
        <div className="mt-20 bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden group">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-8 leading-none">The Passive <br/> <span className="text-indigo-400">Wealth Loop</span></h2>
              <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10">
                Ads Predia is built on community growth. Our partnership model rewards the visionaries who help expand our global micro-tasking network.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <i className="fa-solid fa-infinity text-indigo-400"></i>
                  No Referral Caps
                </div>
                <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <i className="fa-solid fa-money-bill-transfer text-emerald-400"></i>
                  Lifetime Yields
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 backdrop-blur-3xl">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8">System Compliance</h4>
              <ul className="space-y-6">
                {[
                   'One account per physical user node.',
                   'Promotions must be ethical and non-deceptive.',
                   'Network fraud results in global blacklisting.',
                   'Referral bonuses are non-reversible once credited.'
                ].map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-xs font-black text-slate-400">
                    <i className="fa-solid fa-circle-check text-emerald-500/50"></i>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <i className="fa-solid fa-users absolute -right-20 -bottom-20 text-[25rem] text-white/5 group-hover:scale-110 transition-transform duration-1000"></i>
        </div>
      </div>
    </div>
  );
};

export default Referrals;