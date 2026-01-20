
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';

interface ReferralsProps {
  user: User;
}

const Referrals: React.FC<ReferralsProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  const [refCount, setRefCount] = useState(0);
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const referralLink = `${window.location.origin}/?ref=${user.id.toUpperCase()}`;
  const shareMessage = `Join Ads Predia and start earning daily coins for micro-tasks! Use my partner link: ${referralLink}`;

  useEffect(() => {
    const fetchRefData = async () => {
      setLoading(true);
      try {
        // Fetch all users and filter by referredBy locally for real-time accuracy
        const allUsers = await storage.getAllUsers();
        const partners = allUsers.filter(u => u.referredBy?.toUpperCase() === user.id.toUpperCase());
        setReferredUsers(partners);
        setRefCount(partners.length);
      } catch (e) {
        console.error("Failed to load referral network data");
      } finally {
        setLoading(false);
      }
    };
    if (user.isLoggedIn) {
      fetchRefData();
    }
  }, [user.id, user.isLoggedIn]);

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(referralLink);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareLinks = [
    { name: 'WhatsApp', icon: 'fa-whatsapp', color: 'bg-[#25D366]', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}` },
    { name: 'X', icon: 'fa-x-twitter', color: 'bg-[#000000]', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}` },
    { name: 'Facebook', icon: 'fa-facebook', color: 'bg-[#1877F2]', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
    { name: 'Telegram', icon: 'fa-telegram', color: 'bg-[#0088cc]', url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareMessage)}` }
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        
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
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white rounded-[4rem] p-10 md:p-16 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-10 px-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-id-card text-indigo-500"></i>
                  Unique Partner ID URL
                </h3>
              </div>
              
              <div className="relative group mb-16">
                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                  <div className={`flex-1 min-w-0 p-8 md:p-10 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex items-center justify-center text-center shadow-inner ${
                    copied ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-300 group-hover:bg-white'
                  }`}>
                    <span className={`font-mono text-sm md:text-lg font-black break-all transition-colors duration-500 ${
                      copied ? 'text-emerald-600' : 'text-slate-700 group-hover:text-indigo-600'
                    }`}>
                      {referralLink}
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleCopy}
                    className={`px-10 py-8 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-4 active:scale-95 shadow-2xl ${
                      copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'
                    }`}
                  >
                    <i className={`fa-solid ${copied ? 'fa-check-double scale-125 animate-bounce' : 'fa-copy'}`}></i>
                    <span className="relative z-10">{copied ? 'LINK SYNCED!' : 'COPY PARTNER LINK'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {shareLinks.map((share) => (
                  <a key={share.name} href={share.url} target="_blank" rel="noopener noreferrer" className={`${share.color} text-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 group relative overflow-hidden`}>
                    <i className={`fa-brands ${share.icon} text-3xl group-hover:rotate-12 transition-transform`}></i>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{share.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Performance Ledger */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-4">Partner Count</div>
                  <div className="text-5xl font-black tracking-tighter mb-2">{loading ? '...' : refCount}</div>
                  <p className="text-[10px] font-bold text-indigo-200/60 uppercase">Active Nodes</p>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Yield Revenue</div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter mb-2">0</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Lifetime Coins</p>
                </div>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Yield Multiplier</div>
                  <div className="text-5xl font-black tracking-tighter mb-2">10%</div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Per Task Done</p>
                </div>
              </div>
            </div>

            {/* New: Detailed Referrals List */}
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Network Directory</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Users recruited to your income node</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-inner">
                    <i className="fa-solid fa-users"></i>
                  </div>
               </div>
               <div className="divide-y divide-slate-50">
                  {loading ? (
                    <div className="p-20 text-center animate-pulse">
                      <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-200 mb-4"></i>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Querying network database...</p>
                    </div>
                  ) : referredUsers.length === 0 ? (
                    <div className="p-20 text-center">
                      <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No partners detected in your node yet.</p>
                    </div>
                  ) : (
                    referredUsers.map(u => (
                      <div key={u.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-all group">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                              {u.username.charAt(0)}
                           </div>
                           <div>
                              <p className="text-lg font-black text-slate-900 tracking-tight">{u.username}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {u.id}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-lg uppercase tracking-widest border border-emerald-100">Active Node</span>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
