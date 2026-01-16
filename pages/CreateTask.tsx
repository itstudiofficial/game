
import React, { useState } from 'react';
import { TaskType } from '../types';

interface CreateTaskProps {
  onCreate: (task: { title: string; type: TaskType; reward: number; totalWorkers: number; description: string }) => void;
  userCoins: number;
  navigateTo: (page: string) => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ onCreate, userCoins, navigateTo }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'YouTube' as TaskType,
    reward: 10,
    totalWorkers: 10,
    description: ''
  });

  const totalCost = formData.reward * formData.totalWorkers;
  const isBalanceEnough = userCoins >= totalCost;

  const categories: TaskType[] = ['YouTube', 'Websites', 'Apps', 'Social Media'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCost > userCoins) return alert('Insufficient coins to create this campaign. Please deposit first.');
    if (!formData.title || !formData.description) return alert('Please fill all fields');
    if (formData.reward < 5) return alert('Minimum reward per user is 5 coins');
    
    onCreate(formData);
    setFormData({ title: '', type: 'YouTube', reward: 10, totalWorkers: 10, description: '' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100 shadow-sm">
          Advertise Hub
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Launch Campaign</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">Reach our global network of verified earners and drive high-quality engagement for your brand or project.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Campaign Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Subscribe to my Gaming Channel" 
                  className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Target Platform</label>
                <div className="relative">
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as TaskType})}
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 appearance-none font-bold text-slate-700 shadow-inner"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"></i>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Reward (Coins/User)</label>
                  <input 
                    type="number" 
                    min="5"
                    value={formData.reward}
                    onChange={e => setFormData({...formData, reward: parseInt(e.target.value) || 0})}
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Target Slots</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.totalWorkers}
                    onChange={e => setFormData({...formData, totalWorkers: parseInt(e.target.value) || 0})}
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Step-by-Step Instructions</label>
                <textarea 
                  rows={6}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="1. Visit link... 2. Click button... 3. Upload screenshot..." 
                  className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 leading-relaxed shadow-inner"
                ></textarea>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!isBalanceEnough}
              className={`w-full py-6 text-white font-black rounded-[2rem] transition-all shadow-xl flex items-center justify-center gap-3 transform active:scale-[0.98] ${
                isBalanceEnough ? 'bg-slate-900 hover:bg-indigo-600 shadow-indigo-100' : 'bg-slate-200 cursor-not-allowed shadow-none'
              }`}
            >
              {isBalanceEnough ? 'DEPLOY LIVE CAMPAIGN' : 'INSUFFICIENT BALANCE'}
              <i className="fa-solid fa-rocket"></i>
            </button>
          </form>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 sticky top-24 shadow-sm">
            <h3 className="font-black text-lg mb-8 flex items-center text-slate-800">
              <i className="fa-solid fa-receipt text-indigo-600 mr-3"></i>
              Budget Forecast
            </h3>
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Base Payout:</span>
                <span className="font-black text-slate-700">{totalCost} Coins</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Platform Fee:</span>
                <span className="font-black text-emerald-500">0% PROMO</span>
              </div>
              <div className="pt-6 border-t border-slate-50 flex flex-col">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">Estimated Spend</span>
                <span className="text-5xl font-black text-slate-900 tracking-tighter">${(totalCost / 2500).toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span></span>
              </div>
            </div>

            <div className={`p-6 rounded-[1.5rem] flex items-start gap-4 ${isBalanceEnough ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              <i className={`fa-solid ${isBalanceEnough ? 'fa-circle-check' : 'fa-circle-exclamation'} mt-1`}></i>
              <div className="text-[11px] font-bold leading-relaxed">
                {isBalanceEnough 
                  ? "Campaign fully funded. Your coins will be locked in escrow to ensure worker trust."
                  : `You need ${totalCost - userCoins} more coins to launch this campaign.`
                }
              </div>
            </div>
            
            {!isBalanceEnough && (
              <button 
                onClick={() => navigateTo('wallet')}
                className="w-full mt-6 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
              >
                Go to Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
