
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

  // Economic Policy: 2,500 Coins = $1.00
  const COIN_RATE = 2500;
  const totalCost = formData.reward * formData.totalWorkers;
  const isBalanceEnough = userCoins >= totalCost;

  const categories: TaskType[] = ['YouTube', 'Websites', 'Apps', 'Social Media'];

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCost > userCoins) return alert('Insufficient coins. Please deposit first.');
    if (!formData.title || !formData.description || !formData.link) {
      return alert('All fields including the Link are required.');
    }
    if (formData.reward < 5) return alert('Minimum reward per user is 5 coins');
    
    setShowConfirmModal(true);
  };

  const handleFinalConfirm = () => {
    onCreate(formData);
    setFormData({ title: '', link: '', type: 'YouTube', reward: 10, totalWorkers: 10, description: '' });
    setShowConfirmModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100 shadow-sm">
          Campaign Deployment Hub
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Launch <span className="text-indigo-600">Campaign</span></h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
          Provide your link and set your budget. Our system requires every worker to provide a screenshot for your verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <form onSubmit={handleInitialSubmit} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 space-y-10">
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Campaign Title (What should users do?)</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Subscribe to my Official Channel" 
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Target Destination URL (The Link)</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-slate-400">
                      <i className="fa-solid fa-link"></i>
                    </span>
                    <input 
                      type="url" 
                      value={formData.link}
                      onChange={e => setFormData({...formData, link: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..." 
                      className="w-full pl-14 pr-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Stats & Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Platform</label>
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
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Coins Per User</label>
                  <input 
                    type="number" 
                    min="5"
                    value={formData.reward}
                    onChange={e => setFormData({...formData, reward: parseInt(e.target.value) || 0})}
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Total Workers</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.totalWorkers}
                    onChange={e => setFormData({...formData, totalWorkers: parseInt(e.target.value) || 0})}
                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Campaign Instructions</label>
                <textarea 
                  rows={5}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell workers exactly what to do. Example: 'Go to the link, watch the video for 2 minutes, subscribe and take a screenshot.'" 
                  className="w-full px-8 py-6 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 leading-relaxed shadow-inner"
                ></textarea>
              </div>

              {/* Screenshot Requirement Alert */}
              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                  <i className="fa-solid fa-camera"></i>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Mandatory Proof</h4>
                  <p className="text-[11px] font-bold text-indigo-700/70">Our system automatically asks all workers for a screenshot before they can submit this task.</p>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!isBalanceEnough}
              className={`w-full py-6 text-white font-black rounded-[2rem] transition-all shadow-xl flex items-center justify-center gap-4 transform active:scale-[0.98] ${
                isBalanceEnough ? 'bg-slate-900 hover:bg-indigo-600 shadow-indigo-100' : 'bg-slate-200 cursor-not-allowed shadow-none'
              }`}
            >
              {isBalanceEnough ? 'Launch Task Now' : 'Insufficient Coins to Deploy'}
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>

        {/* Sidebar Cost Analysis */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 sticky top-24 shadow-sm">
            <h3 className="font-black text-lg mb-8 flex items-center text-slate-800 uppercase tracking-tighter">
              <i className="fa-solid fa-chart-line text-indigo-600 mr-3"></i>
              Budget Check
            </h3>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Payout per User:</span>
                <span className="font-black text-slate-700">{formData.reward} Coins</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Total Slot Target:</span>
                <span className="font-black text-slate-700">{formData.totalWorkers} Workers</span>
              </div>
              <div className="pt-6 border-t border-slate-50 flex flex-col">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">Total Campaign Cost</span>
                <span className="text-5xl font-black text-slate-900 tracking-tighter">
                  {totalCost.toLocaleString()} 
                  <span className="text-xs font-bold text-slate-400 uppercase ml-2">Coins</span>
                </span>
                <p className="mt-2 text-xs font-black text-slate-300 uppercase tracking-widest">≈ ${(totalCost / COIN_RATE).toFixed(2)} USD</p>
              </div>
            </div>

            <div className={`p-6 rounded-[1.5rem] flex items-start gap-4 ${isBalanceEnough ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              <i className={`fa-solid ${isBalanceEnough ? 'fa-circle-check' : 'fa-circle-exclamation'} mt-1`}></i>
              <div className="text-[11px] font-bold leading-relaxed">
                {isBalanceEnough 
                  ? "Wallet balance verified. Funds will be moved to Escrow upon launch."
                  : `Deposit ${(totalCost - userCoins).toLocaleString()} more coins to continue.`
                }
              </div>
            </div>
            
            {!isBalanceEnough && (
              <button 
                onClick={() => navigateTo('wallet')}
                className="w-full mt-6 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Go to Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Final Review Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-12">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-xl shadow-indigo-100">
                  <i className="fa-solid fa-clipboard-check"></i>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Final Review</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Campaign Deployment</p>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Destination</span>
                       <span className="text-xs font-black text-indigo-600 truncate max-w-[200px]">{formData.link}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Coins</span>
                       <span className="text-xs font-black text-slate-900">{totalCost.toLocaleString()} Coins</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Requirement</span>
                       <span className="text-[10px] font-black text-emerald-600 uppercase">Screenshot Needed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                >
                  Edit Form
                </button>
                <button 
                  onClick={handleFinalConfirm}
                  className="flex-2 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"
                >
                  Launch Task Now
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
