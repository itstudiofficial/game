
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileSettingsProps {
  user: User;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [profileData, setProfileData] = useState({
    username: user.username,
    email: user.email || 'user@adspredia.com',
    phone: '+92 3** **** ***',
    country: 'Pakistan',
    bio: "Micro-task enthusiast looking for high-quality campaigns and digital growth.",
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert('System identity updated successfully!');
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 space-y-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
            <i className="fa-solid fa-user-gear"></i>
            Identity Configuration
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
            Profile <span className="text-indigo-600">Settings</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Manage your network persona and authorized communication channels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-40 h-40 bg-slate-900 rounded-[3rem] shadow-2xl flex items-center justify-center text-white text-6xl mb-10 overflow-hidden">
                <i className="fa-solid fa-user-astronaut"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user.username}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{user.email}</p>
              
              <div className="mt-12 w-full space-y-4">
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vault Status</span>
                    <span className="text-xs font-black text-emerald-600 uppercase">Verified User</span>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auth Level</span>
                    <span className="text-xs font-black text-indigo-600 uppercase">Tier 1 Partner</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[4rem] p-12 md:p-16 border border-slate-200 shadow-sm">
              <form onSubmit={handleProfileUpdate} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">System Name</label>
                    <input type="text" value={profileData.username} onChange={e => setProfileData({...profileData, username: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Contact Email</label>
                    <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Country Node</label>
                    <input type="text" value={profileData.country} onChange={e => setProfileData({...profileData, country: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Mobile Identity</label>
                    <input type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Account Bio / Metadata</label>
                  <textarea rows={5} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="w-full px-8 py-6 bg-slate-50 rounded-[2.5rem] font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 resize-none leading-relaxed" />
                </div>

                <button type="submit" className="px-12 py-6 bg-slate-900 text-white font-black rounded-[2rem] uppercase text-[10px] tracking-widest hover:bg-indigo-600 shadow-2xl transition-all">
                  Commit Synchronous Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
