
import React, { useState } from 'react';
import { User } from '../types';

interface ReferralsProps {
  user: User;
}

const Referrals: React.FC<ReferralsProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);
  
  const referralLink = `https://adspredia.site/ref/${user.id.toLowerCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100 shadow-sm">
          Partnership Program
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Global <span className="text-indigo-600">Network</span></h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
          Grow your affiliate army. Earn 10% commission on every task completed by your referrals, for life.
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Main Referral Link Card */}
          <div className="lg:col-span-8 bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Your Unique Referral Link</h3>
            <div className="flex flex-col md:flex-row gap-4 items-center mb-10">
              <div className="flex-1 w-full p-6 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-slate-700 text-sm font-black break-all">
                {referralLink}
              </div>
              <button 
                onClick={handleCopy}
                className={`w-full md:w-auto px-10 py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                  copied ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-100'
                } shadow-xl`}
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

          {/* Educational Sidebar Card */}
          <div className="lg:col-span-4">
             <div className="bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 h-full flex flex-col justify-between">
                <div className="relative z-10">
                  <h3 className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-8">Earning Potential</h3>
                  <p className="text-2xl font-black tracking-tight leading-snug">Earn more by doing less.</p>
                  <p className="text-sm text-indigo-100/70 mt-4 leading-relaxed">
                    Our multi-tier system ensures that you earn commission from every task your friends complete. There is no limit to your partnership growth.
                  </p>
                </div>
                <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <i className="fa-solid fa-gift text-indigo-200"></i>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Payouts occur instantly</span>
                  </div>
                </div>
                <i className="fa-solid fa-users absolute -right-4 -bottom-4 text-9xl text-white/10"></i>
             </div>
          </div>
        </div>

        {/* Informational Footer */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-3xl font-black mb-6">Network Policy</h3>
            <p className="text-slate-400 leading-relaxed mb-8">
              Users linked via your referral ID are permanent partners. Self-referral is strictly prohibited and will result in a permanent vault freeze. Promote your link on social media, blogs, or via direct messaging to grow your passive income.
            </p>
            <div className="flex gap-4">
              <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-shield-check text-emerald-500"></i>
                Fraud Protection
              </div>
              <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-infinity text-indigo-400"></i>
                Unlimited Slots
              </div>
            </div>
          </div>
          <i className="fa-solid fa-network-wired absolute top-1/2 right-12 -translate-y-1/2 text-[15rem] text-white/5"></i>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
