
import React, { useState } from 'react';
import { TaskType } from '../types';

interface CreateTaskProps {
  onCreate: (task: { title: string; type: TaskType; reward: number; totalWorkers: number; description: string }) => void;
  userCoins: number;
  // Added navigateTo to props to allow switching pages from this component
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
    if (totalCost > userCoins) return alert('Insufficient coins to create this task. Please deposit first.');
    if (!formData.title || !formData.description) return alert('Please fill all fields');
    
    onCreate(formData);
    setFormData({ title: '', type: 'YouTube', reward: 10, totalWorkers: 10, description: '' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Campaign Manager</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">Get high-quality engagement from thousands of real users worldwide.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Campaign Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Subscribe to my Gaming Channel" 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Platform</label>
                <div className="relative">
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as TaskType})}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 appearance-none font-bold text-slate-700"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"></i>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Reward/User</label>
                  <input 
                    type="number" 
                    min="5"
                    value={formData.reward}
                    onChange={e => setFormData({...formData, reward: parseInt(e.target.value) || 0})}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Target (Users)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.totalWorkers}
                    onChange={e => setFormData({...formData, totalWorkers: parseInt(e.target.value) || 0})}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Proof Instructions</label>
                <textarea 
                  rows={5}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Be specific. e.g. '1. Watch video for 2 mins. 2. Subscribe. 3. Upload screenshot of subscription.'" 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 leading-relaxed"
                ></textarea>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!isBalanceEnough}
              className={`w-full py-6 text-white font-black rounded-[1.5rem] transition-all shadow-xl flex items-center justify-center gap-3 transform active:scale-[0.98] ${
                isBalanceEnough ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-200 cursor-not-allowed shadow-none'
              }`}
            >
              {isBalanceEnough ? 'LAUNCH GLOBAL CAMPAIGN' : 'INSUFFICIENT BALANCE'}
              <i className="fa-solid fa-rocket"></i>
            </button>
          </form>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white sticky top-24 shadow-2xl">
            <h3 className="font-black text-lg mb-8 flex items-center">
              <i className="fa-solid fa-receipt text-indigo-400 mr-3"></i>
              Budget Check
            </h3>
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold">Base Cost:</span>
                <span className="font-black">{totalCost} Coins</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold">Priority Fee:</span>
                <span className="font-black">FREE</span>
              </div>
              <div className="pt-6 border-t border-white border-opacity-10 flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Grand Total</span>
                <span className="text-4xl font-black">{totalCost} <span className="text-sm font-bold text-slate-500">COINS</span></span>
              </div>
            </div>

            <div className={`p-6 rounded-[1.5rem] flex items-start gap-4 ${isBalanceEnough ? 'bg-indigo-500 bg-opacity-10 text-indigo-200 border border-indigo-500 border-opacity-20' : 'bg-red-500 bg-opacity-10 text-red-200 border border-red-500 border-opacity-20'}`}>
              <i className={`fa-solid ${isBalanceEnough ? 'fa-circle-check' : 'fa-circle-exclamation'} mt-1`}></i>
              <div className="text-xs font-bold leading-relaxed">
                {isBalanceEnough 
                  ? "Wallet check passed. You have sufficient funds to start this campaign immediately."
                  : `Budget deficit: ${totalCost - userCoins} coins. Please deposit funds to your wallet to continue.`
                }
              </div>
            </div>
            
            {!isBalanceEnough && (
              <button 
                // Fixed: used navigateTo from props instead of the undefined variable
                onClick={() => navigateTo('wallet')}
                className="w-full mt-6 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-colors"
              >
                GO TO WALLET
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;