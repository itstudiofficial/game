
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
    
    // Simulate upload delay
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Earn Coins</h1>
          <p className="text-slate-500">Choose a category and start completing micro-tasks.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                filter === f 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-400'
              }`}
            >
              {f !== 'All' && <i className={`fa-solid ${getIcon(f as TaskType).split(' ')[0]}`}></i>}
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
           <i className="fa-solid fa-folder-open text-6xl text-slate-200 mb-4"></i>
           <p className="text-slate-400 font-medium">No tasks available in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 card-hover flex flex-col h-full relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50`}>
                  <i className={`fa-brands fa-solid ${getIcon(task.type)} text-2xl`}></i>
                </div>
                <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full text-yellow-700 font-bold text-sm">
                  <i className="fa-solid fa-coins mr-1.5"></i>
                  {task.reward}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{task.title}</h3>
              <p className="text-slate-500 text-sm mb-8 line-clamp-3 leading-relaxed">{task.description}</p>
              
              <div className="mt-auto">
                 <div className="flex justify-between items-center text-xs text-slate-400 font-bold mb-3 uppercase tracking-wider">
                    <span>{task.completedCount} / {task.totalWorkers} Done</span>
                    <span>{Math.round((task.completedCount / task.totalWorkers) * 100)}%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2 mb-8 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${(task.completedCount / task.totalWorkers) * 100}%` }}
                    ></div>
                 </div>
                 <button 
                  onClick={() => setSelectedTask(task)}
                  className="w-full py-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold rounded-2xl transition-all border border-indigo-100"
                 >
                  View Details
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-60 backdrop-blur-md transition-all">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-1">{selectedTask.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{selectedTask.type}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-slate-400 text-sm font-medium">Verify within 24h</span>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
              
              {!isSubmittingProof ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Steps to follow</h4>
                    <div className="text-slate-700 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 text-sm leading-relaxed">
                      {selectedTask.description}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-yellow-50 p-6 rounded-[1.5rem] border border-yellow-100">
                      <div className="text-[10px] text-yellow-600 font-black uppercase tracking-widest mb-1">Earning</div>
                      <div className="text-2xl font-black text-yellow-700">{selectedTask.reward} <span className="text-sm font-bold">Coins</span></div>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-[1.5rem] border border-indigo-100">
                      <div className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-1">Difficulty</div>
                      <div className="text-2xl font-black text-indigo-700">Easy</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => setIsSubmittingProof(true)}
                      className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 transform active:scale-95"
                    >
                      Start Task & Submit Proof
                    </button>
                    <button 
                      onClick={handleCloseModal}
                      className="w-full py-5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                  <div className="bg-indigo-50 p-4 rounded-xl flex items-center gap-3 border border-indigo-100">
                    <i className="fa-solid fa-circle-info text-indigo-600"></i>
                    <p className="text-xs text-indigo-700 font-bold leading-tight">Please upload a screenshot showing you completed the task steps.</p>
                  </div>

                  <div>
                    <label htmlFor="proof-upload" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Screenshot Proof</label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                      <input 
                        type="file" 
                        id="proof-upload" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        accept="image/*"
                      />
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                        <i className="fa-solid fa-camera text-xl"></i>
                      </div>
                      <p className="text-sm font-bold text-slate-600">Click or drag image</p>
                      <p className="text-[10px] text-slate-400 uppercase mt-1 font-black">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="proof-notes" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Additional Notes (Optional)</label>
                    <textarea 
                      id="proof-notes"
                      rows={3}
                      placeholder="Enter your username or link used for completion..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm font-medium"
                    ></textarea>
                  </div>

                  <div className="pt-4 space-y-3">
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={isUploading}
                      className={`w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 ${isUploading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                    >
                      {isUploading ? (
                        <>
                          <i className="fa-solid fa-circle-notch fa-spin text-xl"></i>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up"></i>
                          Submit For Verification
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setIsSubmittingProof(false)}
                      disabled={isUploading}
                      className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm"
                    >
                      Go Back
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
