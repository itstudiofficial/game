
import React, { useState } from 'react';
import { Task, TaskType } from '../types';

interface TasksProps {
  tasks: Task[];
  onComplete: (taskId: string, timestamp?: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, onComplete }) => {
  const [filter, setFilter] = useState<TaskType | 'All'>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const categories: (TaskType | 'All')[] = ['All', 'YouTube', 'Websites', 'Apps', 'Social Media'];

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.type === filter);

  const getIcon = (type: TaskType) => {
    switch(type) {
      case 'YouTube': return 'fa-youtube text-red-600';
      case 'Websites': return 'fa-globe text-indigo-600';
      case 'Apps': return 'fa-mobile-screen text-emerald-600';
      case 'Social Media': return 'fa-share-nodes text-blue-600';
      default: return 'fa-tasks text-slate-600';
    }
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setIsSubmittingProof(false);
    setIsUploading(false);
  };

  const handleFinalSubmit = () => {
    setIsUploading(true);
    const submissionTimestamp = new Date().toLocaleString();
    
    setTimeout(() => {
      if (selectedTask) {
        onComplete(selectedTask.id, submissionTimestamp);
      }
      handleCloseModal();
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Marketplace Live
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Available Tasks</h1>
          <p className="text-slate-500 font-medium">Earn coins by completing verified micro-tasks from global partners.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                filter === f 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200 scale-105' 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
           <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
              <i className="fa-solid fa-cloud-sun text-4xl"></i>
           </div>
           <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Check back later</p>
           <p className="text-slate-300 text-sm mt-2 font-medium">No active tasks in this category at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTasks.map(task => (
            <div key={task.id} className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 group-hover:bg-indigo-100/50 rounded-full blur-3xl transition-colors duration-500"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 group-hover:scale-110 transition-transform duration-500`}>
                  <i className={`fa-solid ${getIcon(task.type)} text-2xl`}></i>
                </div>
                <div className="flex flex-col items-end">
                  <div className="bg-yellow-400 text-slate-900 px-5 py-2.5 rounded-2xl font-black text-xl flex items-center shadow-lg shadow-yellow-100 border-b-4 border-yellow-600 active:translate-y-0.5 transition-transform">
                    <i className="fa-solid fa-coins mr-2 text-yellow-800"></i>
                    {task.reward}
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 mr-1">REWARD</span>
                </div>
              </div>

              <div className="relative z-10 mb-8 flex-grow">
                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{task.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed font-medium">
                  {task.description}
                </p>
              </div>
              
              <div className="mt-auto relative z-10">
                 <div className="flex justify-between items-center text-[10px] font-black mb-3 uppercase tracking-widest">
                    <span className="text-slate-400">{task.completedCount} / {task.totalWorkers} Slots</span>
                    <span className={task.completedCount/task.totalWorkers > 0.8 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}>
                       {task.completedCount/task.totalWorkers > 0.8 ? 'Ending Soon' : 'Active'}
                    </span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2 mb-8 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${(task.completedCount / task.totalWorkers) * 100}%` }}
                    ></div>
                 </div>
                 <button 
                  onClick={() => setSelectedTask(task)}
                  className="w-full py-4 bg-slate-900 text-white hover:bg-indigo-600 font-black rounded-2xl transition-all duration-300 shadow-xl shadow-slate-100 flex items-center justify-center gap-2 group/btn"
                 >
                  View Full Details
                  <i className="fa-solid fa-arrow-right text-[10px] group-hover/btn:translate-x-1 transition-transform"></i>
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl transition-all">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-indigo-600 text-2xl">
                    <i className={`fa-solid ${getIcon(selectedTask.type).split(' ')[0]}`}></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{selectedTask.title}</h2>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] font-black rounded uppercase tracking-widest">{selectedTask.type}</span>
                    </div>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
              
              {!isSubmittingProof ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Worker Instructions</h4>
                    <p className="text-slate-700 text-sm leading-relaxed font-medium">
                      {selectedTask.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
                      <div className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-1">Guaranteed Payout</div>
                      <div className="text-3xl font-black">{selectedTask.reward} <span className="text-xs text-slate-500 uppercase">Coins</span></div>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 text-emerald-700">
                      <div className="text-[9px] font-black uppercase tracking-widest mb-1">Target Audience</div>
                      <div className="text-3xl font-black">GLOBAL</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button 
                      onClick={() => setIsSubmittingProof(true)}
                      className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200"
                    >
                      Start Task & Submit Proof
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className="bg-yellow-50 p-6 rounded-[1.5rem] flex items-center gap-4 border border-yellow-100">
                    <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-yellow-800">
                      <i className="fa-solid fa-camera"></i>
                    </div>
                    <p className="text-xs text-yellow-800 font-bold">
                      Upload a screenshot of the completed action for verification.
                    </p>
                  </div>

                  <div className="relative border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center bg-slate-50 hover:bg-white transition-all cursor-pointer group">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-300 group-hover:text-indigo-600 mb-4 transition-colors"></i>
                    <p className="text-sm font-black text-slate-900">Select Proof Image</p>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={isUploading}
                      className={`w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'}`}
                    >
                      {isUploading ? 'Verifying...' : 'Submit Verification'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
