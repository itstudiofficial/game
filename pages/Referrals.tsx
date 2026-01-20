
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';

interface ReferralsProps {
  user: User;
}

const Referrals: React.FC<ReferralsProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [refCount, setRefCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Construct a standard URL that the App component will recognize regardless of browser/domain
  // format: domain.com/ref/ID
  const referralLink = `${window.location.origin}/ref/${user.id.toUpperCase()}`;
  const shareMessage = `Join Ads Predia and start earning daily coins for micro-tasks! Use my partner link to join the network: ${referralLink}`;

  useEffect(() => {
    const fetchRefData = async () => {
      setLoading(true);
      try {
        const count = await storage.getReferralCount(user.id);
        setRefCount(count);
      } catch (e) {
        console.error("Failed to load referral count");
      } finally {
        setLoading(false);
      }
    };
    if (user.isLoggedIn) {
      fetchRefData();
    }
  }, [user.id, user.isLoggedIn]);

  const handleCopy = () => {
    // Primary clipboard copy
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(referralLink);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    
    setCopied(true);
    // Animation reset timing
    setTimeout(() => setCopied(false), 2500);
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
              <div className="flex justify-between items-center mb-10 px-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-id-card text-indigo-500"></i>
                  Unique Partner ID URL
                </h3>
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                   <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active Earning Node</span>
                </div>
              </div>
              
              {/* High-Impact Centerpiece Referral Link */}
              <div className="relative group mb-16">
                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                  <div className={`flex-1 min-w-0 p-8 md:p-10 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex items-center justify-center text-center shadow-inner ${
                    copied ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100/20' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-300 group-hover:bg-white'
                  }`}>
                    <span className={`font-mono text-sm md:text-lg font-black break-all transition-colors duration-500 ${
                      copied ? 'text-emerald-600' : 'text-slate-700 group-hover:text-indigo-600'
                    }`}>
                      {referralLink}
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleCopy}
                    className={`relative overflow-hidden px-10 md:px-14 py-8 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-4 active:scale-95 shadow-2xl ${
                      copied 
                        ? 'bg-emerald-500 text-white shadow-emerald-200' 
                        : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200 hover:-translate-y-1'
                    }`}
                  >
                    {/* Progress Fill Animation for Copied State */}
                    {copied && (
                      <div className="absolute bottom-0 left-0 h-1.5 bg-white/30 w-full animate-progress-shrink"></div>
                    )}
                    
                    <i className={`fa-solid ${copied ? 'fa-check-double scale-125 animate-bounce' : 'fa-copy'} transition-transform duration-300`}></i>
                    <span className="relative z-10 whitespace-nowrap">
                      {copied ? 'LINK SYNCED!' : 'COPY PARTNER LINK'}
                    </span>
                  </button>
                </div>
                
                {/* Visual Glow behind link */}
                <div className={`absolute -inset-4 rounded-[3rem] blur-2xl opacity-0 transition-opacity duration-500 pointer-events-none ${copied ? 'bg-emerald-400/10 opacity-100' : 'bg-indigo-400/5 group-hover:opacity-100'}`}></div>
              </div>

              {/* Social Outreach Kit */}
              <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-bullhorn text-indigo-500"></i>
                    Viral Outreach Kit
                  </h4>
                  <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">One-Tap Broadcast</span>
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
              
              <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-50 rounded-full blur-3xl pointer-events-none opacity-40"></div>
            </div>

            {/* Performance Ledger */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-4">Partner Count</div>
                  <div className="text-5xl font-black tracking-tighter mb-2 group-hover:scale-110 transition-transform origin-left">
                    {loading ? '...' : refCount}
                  </div>
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
      </div>
      
      <style>{`
        @keyframes progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress-shrink {
          animation: progress-shrink 2.5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Referrals;
