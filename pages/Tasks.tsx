
import React, { useState, useRef, useMemo } from 'react';
import { Task, TaskType, User, Transaction } from '../types';

interface TasksProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
  onComplete: (taskId: string, proofImage?: string, timestamp?: string) => Promise<void> | void;
}

const Tasks: React.FC<TasksProps> = ({ user, tasks, transactions, onComplete }) => {
  const [activeView, setActiveView] = useState<'Marketplace' | 'My History'>('Marketplace');
  const [categoryFilter, setCategoryFilter] = useState<TaskType | 'All'>('All');
  const [historyFilter, setHistoryFilter] = useState<'Pending' | 'Approved'>('Pending');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [viewingHistoryScreenshot, setViewingHistoryScreenshot] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const marketCategories: {id: TaskType | 'All', label: string, icon: string}[] = [
    { id: 'All', label: 'All Tasks', icon: 'fa-layer-group' },
    { id: 'YouTube', label: 'Video Ops', icon: 'fa-youtube' },
    { id: 'Websites', label: 'Web Traffic', icon: 'fa-globe' },
    { id: 'Apps', label: 'App Installs', icon: 'fa-mobile-screen' },
    { id: 'Social Media', label: 'Social Reach', icon: 'fa-share-nodes' }
  ];

  const availableTasks = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const today = new Date().toISOString().split('T')[0];
    
    return safeTasks.filter(t => {
      if (!t) return false;
      const isSubmitted = user.completedTasks?.includes(t.id);
      if (isSubmitted) return false;

      // Filter out expired tasks
      if (t.dueDate && t.dueDate < today) return false;

      const categoryMatch = categoryFilter === 'All' || t.type === categoryFilter;
      return categoryMatch && t.status === 'active';
    });
  }, [tasks, user.completedTasks, categoryFilter]);

  const userHistoryItems = useMemo(() => {
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    return safeTransactions
      .filter(tx => tx && tx.type === 'earn' && tx.userId === user.id)
      .filter(tx => {
        if (historyFilter === 'Pending') return tx.status === 'pending';
        return tx.status === 'success';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, user.id, historyFilter]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        // Aggressive compression for mobile speed
        const MAX_WIDTH = 480; 
        const MAX_HEIGHT = 640;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'low';
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.3));
        } else {
          reject(new Error('Failed to create canvas context'));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image into memory'));
      };
      
      img.src = objectUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);
        setPreviewImage(compressed);
      } catch (error) {
        console.error("Compression error:", error);
        alert("Error processing screenshot. Ensure it is a valid image file.");
      } finally {
        setIsCompressing(false);
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (!previewImage) return alert("Please upload a screenshot proof first.");
    if (!selectedTask) return;

    setIsUploading(true);
    try {
      await onComplete(selectedTask.id, previewImage, new Date().toLocaleString());
      handleCloseModal();
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Verification signal failed to reach the server. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setIsSubmittingProof(false);
    setIsUploading(false);
    setIsCompressing(false);
    setPreviewImage(null);
  };

  const getIcon = (type: string) => {
    if (type.includes('YouTube')) return 'fa-youtube text-red-500';
    if (type.includes('Websites')) return 'fa-globe text-indigo-500';
    if (type.includes('Apps')) return 'fa-mobile-screen text-emerald-500';
    if (type.includes('Social Media')) return 'fa-hashtag text-blue-500';
    return 'fa-tasks text-slate-500';
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-slate-200 pb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
                Operational Node: Verified
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                {activeView === 'Marketplace' ? 'Task Marketplace' : 'Audit Protocol'}
              </h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                {activeView === 'Marketplace' 
                  ? 'Discover and execute high-precision micro-tasks to generate daily coin yield.' 
                  : 'Track your verification status and audit history of submitted engagement assets.'}
              </p>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner">
               <button 
                onClick={() => setActiveView('Marketplace')}
                className={`px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeView === 'Marketplace' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Marketplace
               </button>
               <button 
                onClick={() => setActiveView('My History')}
                className={`px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeView === 'My History' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 My History
               </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
             {activeView === 'Marketplace' ? (
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                  {marketCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        categoryFilter === cat.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <i className={`fa-solid ${cat.icon} text-xs ${categoryFilter === cat.id ? 'opacity-100' : 'opacity-40'}`}></i>
                      {cat.label}
                    </button>
                  ))}
                </div>
             ) : (
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                   <button onClick={() => setHistoryFilter('Pending')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyFilter === 'Pending' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400'}`}>Pending Audits</button>
                   <button onClick={() => setHistoryFilter('Approved')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyFilter === 'Approved' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>Verified Success</button>
                </div>
             )}
          </div>
        </div>

        {activeView === 'Marketplace' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-700">
            {availableTasks.length === 0 ? (
              <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
                <i className="fa-solid fa-box-open text-6xl text-slate-100 mb-6"></i>
                <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Active Assets in {categoryFilter}</h3>
              </div>
            ) : (
              availableTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => setSelectedTask(task)}
                  className="group bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col h-full relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="w-14 h-14 bg-slate-50 rounded-[1.25rem] flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <i className={`fa-solid ${getIcon(task.type)}`}></i>
                    </div>
                    <div className="px-5 py-3 bg-slate-900 rounded-[1.25rem] text-white flex items-center gap-3">
                      <i className="fa-solid fa-coins text-yellow-400"></i>
                      <span className="text-xl font-black">{task.reward}</span>
                    </div>
                  </div>
                  <div className="flex-grow mb-8 relative z-10">
                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-2 block">{task.type} Unit</span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                    <p className="text-slate-400 text-xs font-medium line-clamp-2">{task.description}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-50 relative z-10">
                    {task.dueDate && (
                      <div className="mb-4 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <i className="fa-solid fa-calendar-day text-[10px] text-slate-400"></i>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Due: {task.dueDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                       <span>Quota Fullness</span>
                       <span>{Math.floor((task.completedCount / task.totalWorkers) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                       <div className="h-full bg-indigo-600" style={{ width: `${(task.completedCount / task.totalWorkers) * 100}%` }}></div>
                    </div>
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 transition-all">
                      Execute Task
                    </button>
                  </div>
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6 duration-700">
             {userHistoryItems.length === 0 ? (
               <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
                  <i className="fa-solid fa-receipt text-6xl text-slate-100 mb-6"></i>
                  <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No {historyFilter} Records Found</h3>
               </div>
             ) : (
               userHistoryItems.map(tx => (
                 <div key={tx.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <i className={`fa-solid ${getIcon(tx.method || '')}`}></i>
                       </div>
                       <div className={`px-4 py-1.5 text-[8px] font-black rounded-lg uppercase tracking-widest border transition-all ${tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'}`}>
                          {tx.status === 'success' ? 'Verified Success' : 'Audit In-Progress'}
                       </div>
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{tx.method?.split('|')[0] || 'Unknown Task'}</h3>
                       <div className="flex items-center justify-between mt-6">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credited Coins</p>
                             <div className="text-3xl font-black text-slate-900">+{tx.amount.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Date</p>
                             <div className="text-xs font-bold text-slate-500 uppercase">{tx.date.split(',')[0]}</div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ref: {tx.id.toUpperCase()}</span>
                       {tx.proofImage && (
                          <button 
                            onClick={() => setViewingHistoryScreenshot(tx.proofImage || null)}
                            className="flex items-center gap-2 text-indigo-500 hover:text-indigo-700 transition-colors"
                          >
                             <i className="fa-solid fa-camera text-xs"></i>
                             <span className="text-[9px] font-black uppercase tracking-widest">View Saved Snapshot</span>
                          </button>
                       )}
                    </div>
                 </div>
               ))
             )}
          </div>
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] w-full max-w-2xl shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] border border-white/20 animate-in zoom-in-95 duration-500 relative max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-12">
              <div className="flex justify-between items-start mb-6 md:mb-10 sticky top-0 bg-white z-10 py-2">
                <div className="flex items-center gap-4 md:gap-6">
                   <div className="w-10 h-10 md:w-16 md:h-16 bg-slate-900 rounded-[1rem] md:rounded-[1.75rem] flex items-center justify-center text-white text-lg md:text-2xl shadow-xl shrink-0">
                      <i className={`fa-solid ${getIcon(selectedTask.type).split(' ')[0]}`}></i>
                   </div>
                   <div className="min-w-0">
                      <h2 className="text-lg md:text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-1 line-clamp-1">{selectedTask.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                         <span className="px-2 py-0.5 md:px-3 md:py-1 bg-indigo-50 text-indigo-600 text-[6px] md:text-[8px] font-black rounded-lg uppercase tracking-widest border border-indigo-100">
                            {selectedTask.type}
                         </span>
                         <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">ID: {selectedTask.id.toUpperCase()}</span>
                      </div>
                   </div>
                </div>
                <button onClick={handleCloseModal} className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl flex items-center justify-center hover:text-slate-900 transition-colors shrink-0">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              {!isSubmittingProof ? (
                <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-50 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-inner">
                    <div className="flex justify-between items-center mb-3">
                       <h4 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Instructions</h4>
                       {selectedTask.dueDate && (
                         <span className="text-[8px] md:text-[10px] font-black text-rose-500 uppercase tracking-widest">Expires: {selectedTask.dueDate}</span>
                       )}
                    </div>
                    <p className="text-slate-700 text-xs md:text-base font-bold leading-relaxed whitespace-pre-wrap">
                      {selectedTask.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-6">
                    <div className="p-4 md:p-6 bg-slate-900 rounded-[1.25rem] md:rounded-[2rem] text-white">
                        <div className="text-[6px] md:text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Asset Value</div>
                        <div className="text-lg md:text-3xl font-black">{selectedTask.reward} <span className="text-[7px] md:text-[10px] text-slate-500 uppercase">Coins</span></div>
                    </div>
                    <div className={`p-4 md:p-6 rounded-[1.25rem] md:rounded-[2rem] border ${
                      selectedTask.status === 'active' ? 'bg-indigo-50 border-indigo-100' : 
                      'bg-amber-50 border-amber-100'
                    }`}>
                        <div className={`text-[6px] md:text-[8px] font-black uppercase tracking-widest mb-1 ${
                          selectedTask.status === 'active' ? 'text-indigo-600' : 'text-amber-600'
                        }`}>Security Level</div>
                        <div className={`text-lg md:text-3xl font-black ${
                          selectedTask.status === 'active' ? 'text-indigo-900' : 'text-amber-900'
                        }`}>{selectedTask.status.toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <a 
                      href={selectedTask.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex-[2] py-4 md:py-6 text-white font-black rounded-2xl md:rounded-3xl text-[9px] md:text-xs uppercase tracking-widest text-center shadow-2xl transition-all active:scale-95 ${
                        selectedTask.status === 'active' ? 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-400 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <i className="fa-solid fa-up-right-from-square mr-2 md:mr-3"></i> Open Target Asset
                    </a>
                    <button 
                      onClick={() => setIsSubmittingProof(true)}
                      disabled={selectedTask.status !== 'active' || user.completedTasks?.includes(selectedTask.id)}
                      className={`flex-1 py-4 md:py-6 font-black rounded-2xl md:rounded-3xl text-[9px] md:text-xs uppercase tracking-widest transition-all ${
                        selectedTask.status === 'active' && !user.completedTasks?.includes(selectedTask.id) ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {user.completedTasks?.includes(selectedTask.id) ? 'Submitted' : 'Start Proof'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-8 animate-in slide-in-from-right-12 duration-500">
                  <div className="bg-amber-50 p-4 md:p-6 rounded-[1.25rem] md:rounded-[2.5rem] border border-amber-100 flex items-center gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-amber-500 text-lg shadow-sm shrink-0">
                      <i className="fa-solid fa-camera"></i>
                    </div>
                    <div>
                      <h5 className="font-black text-amber-900 text-[8px] md:text-xs uppercase tracking-widest mb-0.5">Verification Required</h5>
                      <p className="text-[8px] md:text-[11px] text-amber-800/70 font-bold leading-tight md:leading-relaxed">
                        Please upload a clear screenshot. The audit node verifies visual markers in seconds.
                      </p>
                    </div>
                  </div>

                  <div className="relative group">
                    <label 
                      htmlFor="screenshot-upload-v3"
                      className={`relative border-2 md:border-4 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[300px] md:min-h-[500px] overflow-hidden ${
                        previewImage ? 'border-emerald-500 bg-slate-950 shadow-2xl' : 'border-slate-100 bg-slate-50 hover:border-indigo-400'
                      } ${isCompressing ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <input id="screenshot-upload-v3" type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                      
                      {isCompressing ? (
                        <div className="flex flex-col items-center gap-3">
                          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500"></i>
                          <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest text-center">Optimizing Asset...</p>
                        </div>
                      ) : previewImage ? (
                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950 group/preview">
                          <img src={previewImage} alt="Proof Preview" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                             <div className="flex gap-2">
                               <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setViewingHistoryScreenshot(previewImage); }}
                                  className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-slate-50 transition-all"
                               >
                                 <i className="fa-solid fa-expand"></i> Review
                               </button>
                               <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
                                  className="bg-rose-600 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-rose-700 transition-all"
                               >
                                 <i className="fa-solid fa-trash"></i> Replace
                               </button>
                             </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center text-slate-300 mb-6 shadow-sm border border-slate-50 group-hover:text-indigo-50 transition-colors">
                            <i className="fa-solid fa-cloud-arrow-up text-2xl md:text-3xl"></i>
                          </div>
                          <p className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.2em] text-center px-4 mb-8">Drag & Drop or Take a Photo</p>
                          
                          <div className="flex flex-col gap-4 w-full px-4">
                             <button 
                               type="button"
                               onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}
                               className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                             >
                                <i className="fa-solid fa-image"></i>
                                Choose From Gallery
                             </button>
                             <button 
                               type="button"
                               onClick={(e) => { 
                                 e.preventDefault(); 
                                 e.stopPropagation(); 
                                 if(fileInputRef.current) {
                                   fileInputRef.current.setAttribute('capture', 'environment');
                                   fileInputRef.current.click();
                                   // Reset after click so gallery still works next time
                                   setTimeout(() => fileInputRef.current?.removeAttribute('capture'), 500);
                                 }
                               }}
                               className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                             >
                                <i className="fa-solid fa-camera"></i>
                                Capture Now
                             </button>
                          </div>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <button 
                      onClick={() => setIsSubmittingProof(false)} 
                      className="flex-1 py-4 md:py-6 bg-slate-100 text-slate-500 font-black rounded-2xl md:rounded-3xl text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-200 transition-all order-2 sm:order-1"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleFinalSubmit} 
                      disabled={isUploading || isCompressing || !previewImage} 
                      className={`flex-[2] py-4 md:py-6 text-white font-black rounded-2xl md:rounded-3xl text-[10px] md:text-xs uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 order-1 sm:order-2 ${
                        previewImage ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i> Dispatching...
                        </>
                      ) : (
                        <>Finalize Submission <i className="fa-solid fa-paper-plane"></i></>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL SCREENSHOT VIEWER MODAL */}
      {viewingHistoryScreenshot && (
        <div 
          className="fixed inset-0 z-[2000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setViewingHistoryScreenshot(null)}
        >
           <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center pointer-events-none">
              <div className="relative w-full h-full flex items-center justify-center pointer-events-auto overflow-hidden rounded-[2rem] md:rounded-[4rem] shadow-2xl border border-white/10">
                 <img src={viewingHistoryScreenshot} alt="Full Proof Viewer" className="max-w-full max-h-full object-contain" />
                 <button 
                   onClick={(e) => { e.stopPropagation(); setViewingHistoryScreenshot(null); }} 
                   className="absolute top-6 right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-xl border border-white/20"
                 >
                   <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
