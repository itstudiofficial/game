
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';

interface ReferralsProps {
  user: User;
  onClaim: (referredUserId: string) => void;
}

const Referrals: React.FC<ReferralsProps> = ({ user, onClaim }) => {
  const [copied, setCopied] = useState(false);
  const [refCount, setRefCount] = useState(0);
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  
  const REFERRAL_REWARD = 100;
  
  // Branded functional link using current origin and 'id' parameter
  const baseUrl = window.location.origin;
  const partnerId = user.id.toUpperCase();
  const functionalLink = `${baseUrl}/?id=${partnerId}`;
  const displayLink = functionalLink.replace(/^https?:\/\//, '');
  
  const shareMessage = `Unlock daily earnings with Ads Predia! Join via my partner link and get 100 coins instantly: ${functionalLink}`;

  const fetchRefData = async () => {
    setLoading(true);
    try {
      const allUsers = await storage.getAllUsers();
      // Filter users whose referredBy matches current user's ID
      const partners = allUsers.filter(u => 
        u.referredBy && u.referredBy.toUpperCase() === user.id.toUpperCase()
      );
      setReferredUsers(partners);
      setRefCount(partners.length);
    } catch (e) {
      console.error("Failed to load referral network data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.isLoggedIn) {
      fetchRefData();
    }
  }, [user.id, user.isLoggedIn, user.claimedReferrals]);

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(functionalLink);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = functionalLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaimReward = (partnerId: string) => {
    setClaimingId(partnerId);
    // Simulate a high-trust verification process
    setTimeout(() => {
      onClaim(partnerId);
      setClaimingId(null);
    }, 1200);
  };

  const shareLinks = [
    { name: 'WhatsApp', icon: 'fa-whatsapp', color: 'bg-[#25D366]', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}` },
    { name: 'X', icon: 'fa-x-twitter', color: 'bg-[#000000]', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}` },
    { name: 'Facebook', icon: 'fa-facebook', color: 'bg-[#1877F2]', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(functionalLink)}` },
    { name: 'Telegram', icon: 'fa-telegram', color: 'bg-[#0088cc]', url: `https://t.me/share/url?url=${encodeURIComponent(functionalLink)}&text=${encodeURIComponent(shareMessage)}` }
  ];

  const claimedCount = user.claimedReferrals?.length || 0;
  const claimableCount = Math.max(0, refCount - claimedCount);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        
        <div className="mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
            <i className="fa-solid fa-users-rays"></i>
            Affiliate Growth Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
            Recruit & <span className="text-indigo-600">Claim 100</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Expand your earning network. Every authorized sign-up via your ID yields 100 instant coins. Use the claim hub below to finalize your rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-10">
            {/* Branded Link Card */}
            <div className="bg-white rounded-[4rem] p-10 md:p-16 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-10 px-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-fingerprint text-indigo-500"></i>
                  Global Partner ID: <span className="text-indigo-600 font-mono">{partnerId}</span>
                </h3>
              </div>
              
              <div className="relative group mb-12">
                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                  <div className={`flex-1 min-w-0 p-8 md:p-10 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 flex items-center justify-center text-center shadow-inner ${
                    copied ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 group-hover:border-indigo-400 group-hover:bg-white'
                  }`}>
                    <span className={`font-mono text-sm md:text-xl font-black break-all transition-colors duration-500 ${
                      copied ? 'text-emerald-600' : 'text-slate-700 group-hover:text-indigo-600'
                    }`}>
                      {displayLink}
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleCopy}
                    className={`px-10 py-8 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-4 active:scale-95 shadow-2xl ${
                      copied ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-slate-900 text-white hover:bg-indigo-600'
                    }`}
                  >
                    <i className={`fa-solid ${copied ? 'fa-check-double scale-150 animate-bounce' : 'fa-copy'}`}></i>
                    <span className="relative z-10">{copied ? 'SYNCED' : 'COPY LINK'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {shareLinks.map((share) => (
                  <a key={share.name} href={share.url} target="_blank" rel="noopener noreferrer" className={`${share.color} text-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 group relative overflow-hidden shadow-lg shadow-slate-200`}>
                    <i className={`fa-brands ${share.icon} text-3xl group-hover:rotate-12 transition-transform`}></i>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{share.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Performance Vault */}
            <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white shadow-3xl relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-center md:text-left">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Total Referral Assets</p>
                     <div className="flex items-baseline gap-4 mb-4 justify-center md:justify-start">
                        <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-none tabular-nums">{claimedCount * REFERRAL_REWARD}</h2>
                        <span className="text-xl font-bold text-slate-500 uppercase tracking-widest">Coins</span>
                     </div>
                     <p className="text-xs font-bold text-slate-400 italic">Global bonuses successfully claimed and added to your balance.</p>
                  </div>
                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center min-w-[200px]">
                    <p className="text-5xl font-black text-indigo-400 tabular-nums">{claimableCount}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Claimable Nodes</p>
                  </div>
               </div>
               <i className="fa-solid fa-gift absolute -right-20 -bottom-20 text-[25rem] text-white/5 -rotate-12 pointer-events-none"></i>
            </div>

            {/* Partner Claim Hub */}
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Affiliate Directory</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized partners recruited via your ID</p>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-inner">
                    <i className="fa-solid fa-people-group text-xl"></i>
                  </div>
               </div>
               <div className="divide-y divide-slate-50">
                  {loading ? (
                    <div className="p-20 text-center animate-pulse">
                      <i className="fa-solid fa-spinner fa-spin text-5xl text-indigo-200 mb-6"></i>
                      <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Scanning network registry...</p>
                    </div>
                  ) : referredUsers.length === 0 ? (
                    <div className="p-32 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-100">
                         <i className="fa-solid fa-user-astronaut text-4xl"></i>
                      </div>
                      <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest">No affiliate partners registered yet.</p>
                    </div>
                  ) : (
                    referredUsers.map(partner => {
                      const isClaimed = user.claimedReferrals?.includes(partner.id);
                      
                      return (
                        <div key={partner.id} className="p-10 flex flex-col md:flex-row items-center justify-between hover:bg-slate-50/50 transition-all group gap-8">
                          <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:scale-105 transition-transform group-hover:bg-indigo-600">
                                {partner.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900 tracking-tight">{partner.username}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node: {partner.id}</p>
                                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified</p>
                                </div>
                            </div>
                          </div>
                          
                          <div>
                            {isClaimed ? (
                              <div className="px-8 py-4 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-2xl uppercase tracking-widest border border-emerald-100 flex items-center gap-3 shadow-sm">
                                <i className="fa-solid fa-check-circle text-sm"></i>
                                Reward Dispatched
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleClaimReward(partner.id)}
                                disabled={claimingId === partner.id}
                                className="px-10 py-5 bg-indigo-600 text-white text-[11px] font-black rounded-2xl uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3 group/btn"
                              >
                                {claimingId === partner.id ? (
                                  <i className="fa-solid fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fa-solid fa-hand-holding-dollar group-hover/btn:translate-y-[-2px] transition-transform"></i>
                                )}
                                {claimingId === partner.id ? 'Synchronizing...' : `Claim Now (${REFERRAL_REWARD})`}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-28">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
               <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-10">Affiliate Rules</h3>
               <div className="space-y-10">
                 {[
                   { t: 'Instant Bounty', d: `Claim ${REFERRAL_REWARD} Coins for every successful referral as soon as they join.`, i: 'fa-bolt' },
                   { t: 'Manual Claims', d: 'Rewards must be manually initialized via the Directory Hub.', i: 'fa-hand-pointer' },
                   { t: 'Lifetime Access', d: 'No limits on how many partners you can recruit to the network.', i: 'fa-infinity' }
                 ].map((rule, i) => (
                   <div key={i} className="flex gap-6">
                     <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-slate-100 shrink-0">
                       <i className={`fa-solid ${rule.i}`}></i>
                     </div>
                     <div>
                       <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-2">{rule.t}</h5>
                       <p className="text-xs font-bold text-slate-400 leading-relaxed">{rule.d}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white flex items-center gap-5">
              <i className="fa-solid fa-circle-info text-2xl opacity-50"></i>
              <p className="text-[10px] font-black leading-relaxed uppercase tracking-widest">
                Referral bonuses are synchronized to your Main Earning Vault.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
