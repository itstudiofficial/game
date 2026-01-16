
import React, { useState } from 'react';
import { User, Task, Transaction } from '../types';

interface DashboardProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, tasks, transactions }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'settings'>('overview');
  const userTasks = tasks.filter(t => user.createdTasks.includes(t.id));

  // 5000 Coins = 2 USD => 2500 Coins = 1 USD
  const COIN_RATE = 2500;
  const usdValue = (user.coins / COIN_RATE).toFixed(2);
  const progressToNextDollar = ((user.coins % COIN_RATE) / COIN_RATE) * 100;

  // Settings & Profile State
  const [profileData, setProfileData] = useState({
    username: user.username,
    email: user.email || 'user@adspredia.com',
    bio: "Micro-task enthusiast looking for high-quality campaigns and digital growth.",
    location: "Global Citizen",
    language: "English"
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    payouts: true,
    marketing: false
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Control Center</h1>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">Verified Partner</span>
          </div>
          <p className="text-slate-500 font-medium">Tracking: <span className="text-indigo-600 font-bold">{COIN_RATE} Coins = $1.00 USD</span></p>
        </div>
        
        {/* Navigation Switcher */}
        <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
          {[
            { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
            { id: 'tasks', label: 'My Campaigns', icon: 'fa-rocket' },
            { id: 'settings', label: 'Settings', icon: 'fa-user-gear' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Earnings Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-8 bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-4">Current Net Worth</div>
                  <div className="flex items-baseline gap-4">
                    <div className="text-6xl font-black tracking-tighter">${usdValue}</div>
                    <div className="text-xl font-bold text-indigo-200">USD</div>
                  </div>
                  <div className="mt-2 text-indigo-100 font-medium opacity-80">
                    Equivalent to {user.coins.toLocaleString()} total coins
                  </div>
                </div>

                <div className="mt-12">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Progress to next $1.00</span>
                    <span className="text-xs font-black">{Math.floor(progressToNextDollar)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-1000"
                      style={{ width: `${progressToNextDollar}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-1 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center group hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-check-double text-xl"></i>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks Finished</div>
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">{user.completedTasks.length}</div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-rocket text-xl"></i>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Campaigns</div>
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">{user.createdTasks.length}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* History Table */}
            <div className="lg:col-span-7 bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Recent Ledger</h3>
                <button className="text-indigo-600 text-xs font-black uppercase hover:underline">Download CSV</button>
              </div>
              <div className="divide-y divide-slate-50">
                {transactions.length === 0 ? (
                  <div className="p-24 text-center">
                    <i className="fa-solid fa-receipt text-slate-100 text-5xl mb-4"></i>
                    <p className="text-slate-400 font-bold">No transactions found</p>
                  </div>
                ) : (
                  transactions.slice(0, 6).map(tx => (
                    <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                          tx.type === 'earn' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          tx.type === 'spend' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          <i className={`fa-solid ${tx.type === 'earn' ? 'fa-arrow-trend-up' : tx.type === 'spend' ? 'fa-bullhorn' : 'fa-arrows-rotate'}`}></i>
                        </div>
                        <div>
                          <div className="font-black text-slate-900 capitalize tracking-tight">{tx.type}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{tx.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-xl ${tx.type === 'earn' ? 'text-emerald-500' : 'text-slate-900'}`}>
                          {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          ≈ ${(tx.amount / COIN_RATE).toFixed(3)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Performance Card */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">Network Reputation</h3>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-slate-400">Completion Rate</span>
                        <span className="text-sm font-black text-white">99.8%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full">
                        <div className="w-[99%] h-full bg-indigo-500 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-slate-400">Trust Score</span>
                        <span className="text-sm font-black text-white">Elite</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full">
                        <div className="w-[92%] h-full bg-indigo-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-16 p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Global Standing</div>
                      <div className="text-2xl font-black">Rank #412</div>
                    </div>
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl">
                      <i className="fa-solid fa-crown text-yellow-400"></i>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
              </div>

              <div className="bg-indigo-50 p-10 rounded-[3rem] border border-indigo-100 flex items-center gap-6 group hover:bg-indigo-100 transition-colors">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 text-2xl shadow-sm group-hover:rotate-12 transition-transform">
                  <i className="fa-solid fa-gift"></i>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">Invite & Earn</h4>
                  <p className="text-xs text-indigo-600 font-bold opacity-80 mt-1">Get 500 Coins for every referral who completes 5 tasks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Live Advertising Campaigns</h3>
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active: {userTasks.length}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {userTasks.length === 0 ? (
                <div className="p-40 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-100 shadow-inner">
                    <i className="fa-solid fa-rocket text-5xl"></i>
                  </div>
                  <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No Active Campaigns</p>
                  <p className="text-slate-300 text-sm mt-3 font-medium max-w-xs mx-auto">Launch your first task to get real engagement from our community.</p>
                </div>
              ) : (
                userTasks.map(task => (
                  <div key={task.id} className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-slate-50 transition-all group">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="font-black text-slate-900 text-2xl tracking-tight group-hover:text-indigo-600 transition-colors">{task.title}</div>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black rounded-lg uppercase tracking-widest border border-slate-200">{task.type}</span>
                      </div>
                      <p className="text-sm text-slate-400 font-medium line-clamp-1">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-10">
                       <div className="text-right">
                          <div className="text-2xl font-black text-slate-900 tracking-tighter">{task.completedCount} <span className="text-slate-300">/</span> {task.totalWorkers}</div>
                          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Conversions</div>
                       </div>
                       <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
                       <div className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                         task.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                       }`}>
                         {task.status}
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS / USER PROFILE TAB */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Settings Nav Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 text-center relative overflow-hidden group">
              <div className="relative z-10">
                <div className="relative inline-block mb-8">
                  <div className="w-44 h-44 bg-indigo-50 rounded-[3.5rem] flex items-center justify-center text-7xl font-black text-indigo-600 border-8 border-white shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    {user.username.charAt(0)}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-14 h-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-2xl border-4 border-white cursor-pointer hover:bg-indigo-600 transition-colors">
                    <i className="fa-solid fa-camera-retro text-lg"></i>
                    <input type="file" className="hidden" />
                  </label>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">{profileData.username}</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-8">Earning Level: Pro</p>
                <div className="flex justify-center gap-4">
                  <div className="px-6 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 shadow-inner">
                    UID: {user.id}
                  </div>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600"></div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 px-4">Preference Hub</h4>
               <nav className="space-y-3">
                 {[
                   { id: 'info', label: 'Personal Information', icon: 'fa-user' },
                   { id: 'security', label: 'Security & Privacy', icon: 'fa-shield-halved' },
                   { id: 'notif', label: 'Notifications', icon: 'fa-bell' },
                   { id: 'billing', label: 'Billing Details', icon: 'fa-credit-card' }
                 ].map(item => (
                   <button key={item.id} className={`w-full text-left p-5 rounded-2xl text-sm font-bold flex items-center justify-between transition-all ${item.id === 'info' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                     <div className="flex items-center gap-4">
                       <i className={`fa-solid ${item.icon} text-xs`}></i>
                       {item.label}
                     </div>
                     <i className="fa-solid fa-chevron-right text-[10px] opacity-30"></i>
                   </button>
                 ))}
               </nav>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Edit Profile Form */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-5 mb-12 pb-6 border-b border-slate-50">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-xl shadow-sm">
                  <i className="fa-solid fa-id-card"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity & Bio</h3>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Username</label>
                    <div className="relative group">
                      <i className="fa-solid fa-at absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"></i>
                      <input 
                        type="text" 
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <div className="relative group">
                      <i className="fa-solid fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"></i>
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Bio</label>
                    <textarea 
                      rows={5}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 leading-relaxed transition-all shadow-inner"
                      placeholder="Tell the community about your expertise..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button type="submit" className="px-14 py-6 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-100 transform active:scale-95">
                    Synchronize Profile
                  </button>
                </div>
              </form>
            </div>

            {/* Notifications Preferences */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-5 mb-12 pb-6 border-b border-slate-50">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-xl shadow-sm">
                  <i className="fa-solid fa-bell-concierge"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Alerts</h3>
              </div>

              <div className="space-y-5">
                {[
                  { id: 'email', title: 'Email Summaries', desc: 'Get daily digests of your earned coins and pending tasks.', icon: 'fa-envelope-open-text' },
                  { id: 'push', title: 'Push Alerts', desc: 'Real-time notifications for high-reward tasks matching your profile.', icon: 'fa-mobile-screen' },
                  { id: 'payouts', title: 'Payment Success', desc: 'Notifications specifically regarding withdrawal and deposit status.', icon: 'fa-money-check-dollar' },
                  { id: 'marketing', title: 'Marketing & Tips', desc: 'Occasional emails about new features and platform growth tips.', icon: 'fa-lightbulb' }
                ].map((pref) => (
                  <div key={pref.id} className="group flex items-center justify-between p-7 bg-slate-50 hover:bg-white border border-slate-50 hover:border-indigo-100 rounded-[2rem] transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-500 shadow-sm transition-colors">
                        <i className={`fa-solid ${pref.icon} text-lg`}></i>
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-sm">{pref.title}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{pref.desc}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setNotifications({...notifications, [pref.id]: !notifications[pref.id as keyof typeof notifications]})}
                      className={`w-16 h-9 rounded-full transition-all relative ${notifications[pref.id as keyof typeof notifications] ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all shadow-md ${notifications[pref.id as keyof typeof notifications] ? 'left-8.5' : 'left-1.5'}`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
