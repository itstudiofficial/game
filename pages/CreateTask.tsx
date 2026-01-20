
import React, { useState } from 'react';
import { TaskType } from '../types';

interface CreateTaskProps {
  onCreate: (task: { 
    title: string; 
    type: TaskType; 
    reward: number; 
    totalWorkers: number; 
    description: string;
    link?: string;
  }) => void;
  userCoins: number;
  navigateTo: (page: string) => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ onCreate, userCoins, navigateTo }) => {
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    type: 'YouTube' as TaskType,
    reward: 10,
    totalWorkers: 10,
    description: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Updated Policy: 3,000 Coins = $1.00
  const COIN_RATE = 3000;
  const totalCost = formData.reward * formData.totalWorkers;
  const isBalanceEnough = userCoins >= totalCost;

  const categories: {id: TaskType, icon: string}[] = [
    { id: 'YouTube', icon: 'fa-youtube' },
    { id: 'Websites', icon: 'fa-globe' },
    { id: 'Apps', icon: 'fa-mobile-screen' },
    { id: 'Social Media', icon: 'fa-share-nodes' }
  ];

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCost > userCoins) return alert('Insufficient vault balance. Please inject coins first.');
    if (!formData.title || !formData.description || !formData.link) {
      return alert('Operational parameters incomplete. Title, Link, and Instructions are required.');
    }
    if (formData.reward < 5) return alert('Minimum reward per user is 5 coins to ensure engagement quality.');
    
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    setIsDeploying(true);
    setTimeout(() => {
      onCreate(formData);
      setFormData({ title: '', link: '', type: 'YouTube', reward: 10, totalWorkers: 10, description: '' });
      setShowConfirmModal(false);
      setIsDeploying(false);
    }, 1500);
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        
        <div className="mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
            <i className="fa-solid fa-satellite-dish"></i>
            Global Deployment Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
            Launch <span className="text-indigo-600">Campaign</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Initialize high-precision micro-tasks. Define your target engagement and authorize the escrow allocation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-100 p-10 md:p-16">
              <form onSubmit={handleInitialSubmit} className="space-y-12">
                
                <div className="space-y-10">
                  <div className="grid grid-cols-1 gap-10">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Campaign Identity (Title)</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g. Subscribe to official network channel" 
                        className="w-full px-10 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl focus:ring-4 focus:ring-indigo-600/5 font-black text-slate-800 shadow-inner outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Destination Resource (Target URL)</label>
                      <div className="relative group">
                        <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                          <i className="fa-solid fa-link"></i>
                        </div>
                        <input 
                          type="url" 
                          value={formData.link}
                          onChange={e => setFormData({...formData, link: e.target.value})}
                          placeholder="https://www.youtube.com/watch?v=..." 
                          className="w-full pl-16 pr-10 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl focus:ring-4 focus:ring-indigo-600/5 font-black text-slate-800 shadow-inner outline-none transition-all placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Modality</label>
                    <div className="relative">
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as TaskType})}
                        className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl font-black text-slate-800 shadow-inner appearance-none outline-none cursor-pointer"
                      >
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.id}</option>)}
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-xs"></i>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Reward / User</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="5"
                        value={formData.reward}
                        onChange={e => setFormData({...formData, reward: parseInt(e.target.value) || 0})}
                        className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl font-black text-slate-800 shadow-inner outline-none"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">Coins</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Total Slot Quota</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="1"
                        value={formData.totalWorkers}
                        onChange={e => setFormData({...formData, totalWorkers: parseInt(e.target.value) || 0})}
                        className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-3xl font-black text-slate-800 shadow-inner outline-none"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">Users</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Operational Protocol (Instructions)</label>
                  <textarea 
                    rows={6}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Provide explicit instructions. Example: 'Initialize video, sustain playback for 120 seconds, and capture a verified screenshot of the subscription status.'" 
                    className="w-full px-10 py-8 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2.5rem] font-black text-slate-800 leading-relaxed shadow-inner outline-none transition-all placeholder:text-slate-300"
                  ></textarea>
                </div>

                <div className="bg-indigo-50/50 p-8 rounded-[3rem] border border-indigo-100/50 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 text-2xl shadow-sm border border-indigo-50 relative z-10 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-shield-check"></i>
                  </div>
                  <div className="relative z-10 text-center sm:text-left">
                    <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">AI Proof Enforcement</h4>
                    <p className="text-[11px] font-bold text-indigo-700/60 leading-relaxed">
                      Every submission requires a visual snapshot. Our validation layer ensures honest engagement.
                    </p>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!isBalanceEnough}
                  className={`w-full py-8 text-white font-black rounded-[2.5rem] transition-all shadow-2xl flex items-center justify-center gap-6 uppercase tracking-[0.4em] text-xs transform active:scale-[0.98] ${
                    isBalanceEnough ? 'bg-slate-900 hover:bg-indigo-600 shadow-indigo-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isBalanceEnough ? 'Initialize Deployment Protocol' : 'Vault Liquidity Low'}
                  <i className="fa-solid fa-paper-plane text-sm"></i>
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-28">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-10">Escrow Analysis</h3>
                
                <div className="space-y-8 mb-12">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Reward per user</span>
                    <span className="text-white">{formData.reward.toLocaleString()} <span className="text-[8px] opacity-40">Coins</span></span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>Target userbase</span>
                    <span className="text-white">{formData.totalWorkers.toLocaleString()} <span className="text-[8px] opacity-40">Slots</span></span>
                  </div>
                  <div className="h-px bg-white/10 w-full"></div>
                  <div className="pt-2">
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2">Projected Campaign Cost</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-black tracking-tighter leading-none">{totalCost.toLocaleString()}</span>
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Coins</span>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black text-slate-300">
                      ≈ ${(totalCost / COIN_RATE).toFixed(2)} USD
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl flex items-start gap-4 ${isBalanceEnough ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  <i className={`fa-solid ${isBalanceEnough ? 'fa-check-double' : 'fa-circle-exclamation'} mt-1`}></i>
                  <div className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    {isBalanceEnough 
                      ? "Escrow coverage verified. Authorization ready."
                      : `Inject ${(totalCost - userCoins).toLocaleString()} coins to authorize.`
                    }
                  </div>
                </div>
              </div>
              <i className="fa-solid fa-vault absolute -right-12 -bottom-12 text-[15rem] text-white/5 rotate-12 pointer-events-none"></i>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[4rem] w-full max-w-xl shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] border border-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-12 md:p-16">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-white text-2xl shadow-xl">
                  <i className="fa-solid fa-file-signature"></i>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Operational Audit</h3>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Reviewing Final Deployment Metrics</p>
                </div>
              </div>

              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200/60 mb-12 space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-slate-200/60">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Asset Point</span>
                   <span className="text-sm font-black text-indigo-600 truncate max-w-[200px]">{formData.link}</span>
                </div>
                <div className="flex justify-between items-center pb-6 border-b border-slate-200/60">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Escrow Total</span>
                   <div className="text-right">
                      <span className="text-xl font-black text-slate-900 block leading-none">{totalCost.toLocaleString()} Coins</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase">≈ ${(totalCost / COIN_RATE).toFixed(2)} USD</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Adjust Specs</button>
                <button 
                  onClick={handleFinalConfirm}
                  disabled={isDeploying}
                  className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl text-[11px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {isDeploying ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Deploying...
                    </>
                  ) : 'Commit Deployment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTask;
