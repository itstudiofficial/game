
import React, { useState } from 'react';
import { TaskType } from '../types';

interface CreateTaskProps {
  onCreate: (task: { title: string; type: TaskType; reward: number; totalWorkers: number; description: string }) => void;
  userCoins: number;
}

const CreateTask: React.FC<CreateTaskProps> = ({ onCreate, userCoins }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Social' as TaskType,
    reward: 10,
    totalWorkers: 10,
    description: ''
  });

  const totalCost = formData.reward * formData.totalWorkers;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCost > userCoins) return alert('Insufficient coins to create this task');
    if (!formData.title || !formData.description) return alert('Please fill all fields');
    
    onCreate(formData);
    setFormData({ title: '', type: 'Social', reward: 10, totalWorkers: 10, description: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Post a New Task</h1>
        <p className="text-slate-500">Reach thousands of active workers and get your work done fast.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Task Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Subscribe to my YouTube Channel" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Task Category</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as TaskType})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="Social">Social Media</option>
                  <option value="Video">Video Watching</option>
                  <option value="Web">Website Visit</option>
                  <option value="Micro">Micro Task</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Reward per Worker (Coins)</label>
                <input 
                  type="number" 
                  min="5"
                  value={formData.reward}
                  onChange={e => setFormData({...formData, reward: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Number of Workers Required</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.totalWorkers}
                  onChange={e => setFormData({...formData, totalWorkers: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Instructions</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell workers exactly what they need to do and what proof you require..." 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Launch Campaign
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-24">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center">
              <i className="fa-solid fa-calculator text-indigo-500 mr-2"></i>
              Summary
            </h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Unit Price:</span>
                <span className="font-bold">{formData.reward} Coins</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Workers:</span>
                <span className="font-bold">{formData.totalWorkers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Service Fee (0%):</span>
                <span className="font-bold">0 Coins</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <span className="font-bold text-slate-800">Total Cost:</span>
                <span className="font-extrabold text-indigo-600 text-xl">{totalCost} Coins</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl text-xs flex items-start space-x-3 ${totalCost > userCoins ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <i className={`fa-solid ${totalCost > userCoins ? 'fa-circle-exclamation' : 'fa-circle-check'} mt-0.5`}></i>
              <p>
                {totalCost > userCoins 
                  ? `You need ${totalCost - userCoins} more coins to launch this task. Visit wallet to deposit.`
                  : "You have enough coins to launch this task! Workers will start seeing it immediately."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
