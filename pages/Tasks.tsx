
import React, { useState, useRef, useMemo } from 'react';
import { Task, TaskType, User, Transaction } from '../types';

interface TasksProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
  onComplete: (taskId: string, proofImage?: string, proofImage2?: string, timestamp?: string) => Promise<void> | void;
}

export default function Tasks({ user, tasks, transactions, onComplete }: TasksProps) {
  const [activeView, setActiveView] = useState<'Marketplace' | 'My History'>('Marketplace');
  const [categoryFilter, setCategoryFilter] = useState<TaskType | 'All'>('All');
  const [historyFilter, setHistoryFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState<number | null>(null);
  const [proof1, setProof1] = useState<string | null>(null);
  const [proof2, setProof2] = useState<string | null>(null);
  const [viewingHistoryScreenshots, setViewingHistoryScreenshots] = useState<string[] | null>(null);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

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
        if (historyFilter === 'Rejected') return tx.status === 'failed';
        return tx.status === 'success';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, user.id, historyFilter]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280; 
        const MAX_HEIGHT = 2400; 
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
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Failed to create canvas context'));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };
      
      img.src = objectUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(slot);
      try {
        const compressed = await compressImage(file);
        if (slot === 1) setProof1(compressed);
        else setProof2(compressed);
      } catch (error) {
        console.error("Compression error:", error);
      } finally {
        setIsCompressing(null);
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (!proof1 || !proof2) return alert("Please upload both required screenshots for verification.");
    if (!selectedTask) return;

    setIsUploading(true);
    try {
      await onComplete(selectedTask.id, proof1, proof2, new Date().toLocaleString());
      handleCloseModal();
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setIsSubmittingProof(false);
    setIsUploading(false);
    setIsCompressing(null);
    setProof1(null);
    setProof2(null);
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
                Node Status: Active
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                {activeView === 'Marketplace' ? 'Task Marketplace' : 'My History'}
              </h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                {activeView === 'Marketplace' 
                  ? 'Identify micro-tasks to generate daily coin yield. Dual-proof verification required.' 
                  : 'Track your verification status and audit history.'}
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
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                   <button onClick={() => setHistoryFilter('Pending')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${historyFilter === 'Pending' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400'}`}>Pending</button>
                   <button onClick={() => setHistoryFilter('Approved')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${historyFilter === 'Approved' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>Approved</button>
                   <button onClick={() => setHistoryFilter('Rejected')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${historyFilter === 'Rejected' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}>Rejected</button>
                </div>
             )}
          </div>
        </div>

        {activeView === 'Marketplace' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {availableTasks.length === 0 ? (
              <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
                <i className="fa-solid fa-box-open text-6xl text-slate-100 mb-6"></i>
                <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Active Tasks</h3>
              </div>
            ) : (
              availableTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => setSelectedTask(task)}
                  className="group bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-slate-50 rounded-[1.25rem] flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <i className={`fa-solid ${getIcon(task.type)}`}></i>
                    </div>
                    <div className="px-5 py-3 bg-slate-900 rounded-[1.25rem] text-white flex items-center gap-3">
                      <i className="fa-solid fa-coins text-yellow-400"></i>
                      <span className="text-xl font-black">{task.reward}</span>
                    </div>
                  </div>
                  <div className="flex-grow mb-8">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{task.type}</span>
                       {task.createdAt && <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Posted: {task.createdAt}</span>}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                    <p className="text-slate-400 text-xs font-medium line-clamp-2">{task.description}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-50">
                    <div className="flex justify-between items-center mb-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                       <span>Progress</span>
                       <span>{Math.floor((task.completedCount / (task.totalWorkers || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                       <div className="h-full bg-indigo-600" style={{ width: `${(task.completedCount / (task.totalWorkers || 1)) * 100}%` }}></div>
                    </div>
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {userHistoryItems.length === 0 ? (
               <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
                  <i className="fa-solid fa-receipt text-6xl text-slate-100 mb-6"></i>
                  <p className="text-xl font-black text-slate-300 uppercase tracking-widest">No Records Found</p>
               </div>
             ) : (
               userHistoryItems.map(tx => (
                 <div key={tx.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <i className={`fa-solid ${getIcon(tx.method || '')}`}></i>
                       </div>
                       <div className={`px-4 py-1.5 text-[8px] font-black rounded-lg uppercase tracking-widest border transition-all ${
                         tx.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                         tx.status === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                         'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                       }`}>
                          {tx.status === 'failed' ? 'rejected' : tx.status}
                       </div>
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{tx.method?.split('|')[0] || 'Task'}</h3>
                       <div className="flex items-center justify-between mt-6">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield</p>
                             <div className="text-3xl font-black text-slate-900">+{tx.amount}</div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Date</p>
                             <div className="text-[10px] font-black text-slate-500 uppercase">{tx.date}</div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {tx.id.substring(0, 8)}</span>
                       <div className="flex gap-4">
                          {(tx.proofImage || tx.proofImage2) && (
                              <button 
                                onClick={() => {
                                  const list: string[] = [];
                                  if (tx.proofImage) list.push(tx.proofImage);
                                  if (tx.proofImage2) list.push(tx.proofImage2);
                                  setViewingHistoryScreenshots(list);
                                }}
                                className="text-indigo-500 hover:text-indigo-700 font-black text-[9px] uppercase tracking-widest flex items-center gap-2"
                              >
                                <i className="fa-solid fa-camera"></i> View Proofs
                              </button>
                          )}
                       </div>
                    </div>
                 </div>
               ))
             )}
          </div>
        )}
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-2xl">
           <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-3xl overflow-hidden relative flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-lg">
                       <i className={`fa-solid ${getIcon(selectedTask.type)}`}></i>
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{selectedTask.title}</h3>
                       <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Reward: {selectedTask.reward} Coins</p>
                    </div>
                 </div>
                 <button onClick={handleCloseModal} className="w-10 h-10 bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm">
                   <i className="fa-solid fa-xmark text-xl"></i>
                 </button>
              </div>

              <div className="p-8 overflow-y-auto no-scrollbar space-y-10 flex-grow">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Objective Node</label>
                    <a 
                      href={selectedTask.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-6 bg-indigo-50 border border-indigo-100 rounded-3xl hover:bg-indigo-600 transition-all group"
                    >
                       <span className="text-xs font-black text-indigo-600 group-hover:text-white truncate max-w-[80%]">{selectedTask.link}</span>
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                       </div>
                    </a>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Instructions</label>
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-line">
                       {selectedTask.description}
                    </div>
                 </div>

                 {isSubmittingProof ? (
                    <div className="space-y-8 animate-in slide-in-from-bottom-6">
                       <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-4 block text-center">Verification Required</label>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <input type="file" ref={fileInputRef1} onChange={e => handleFileChange(e, 1)} className="hidden" accept="image/*" />
                             <button 
                               onClick={() => fileInputRef1.current?.click()}
                               className={`w-full py-10 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${proof1 ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-indigo-400'}`}
                             >
                                {isCompressing === 1 ? <i className="fa-solid fa-spinner fa-spin text-2xl"></i> : <i className={`fa-solid ${proof1 ? 'fa-check-circle' : 'fa-camera'} text-2xl`}`}></i>}
                                <span className="text-[9px] font-black uppercase tracking-widest">{proof1 ? 'Proof 1 Loaded' : 'Primary Proof'}</span>
                             </button>
                          </div>
                          <div className="space-y-3">
                             <input type="file" ref={fileInputRef2} onChange={e => handleFileChange(e, 2)} className="hidden" accept="image/*" />
                             <button 
                               onClick={() => fileInputRef2.current?.click()}
                               className={`w-full py-10 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${proof2 ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-indigo-400'}`}
                             >
                                {isCompressing === 2 ? <i className="fa-solid fa-spinner fa-spin text-2xl"></i> : <i className={`fa-solid ${proof2 ? 'fa-check-circle' : 'fa-camera'} text-2xl`}`}></i>}
                                <span className="text-[9px] font-black uppercase tracking-widest">{proof2 ? 'Proof 2 Loaded' : 'Secondary Proof'}</span>
                             </button>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <button onClick={() => setIsSubmittingProof(false)} className="flex-1 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Back</button>
                          <button 
                            onClick={handleFinalSubmit}
                            disabled={!proof1 || !proof2 || isUploading}
                            className="flex-[2] py-6 bg-slate-900 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                          >
                             {isUploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-cloud-arrow-up"></i> Submit Audit</>}
                          </button>
                       </div>
                    </div>
                 ) : (
                    <button 
                      onClick={() => setIsSubmittingProof(true)}
                      className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-4"
                    >
                       Initialize Completion <i className="fa-solid fa-bolt"></i>
                    </button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* History screenshots modal */}
      {viewingHistoryScreenshots && (
        <div 
          className="fixed inset-0 z-[2000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-6"
          onClick={() => setViewingHistoryScreenshots(null)}
        >
           <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center pointer-events-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full pointer-events-auto overflow-y-auto no-scrollbar py-20">
                 {viewingHistoryScreenshots.map((src, idx) => (
                    <div key={idx} className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 bg-white/5 p-4">
                       <p className="absolute top-8 left-8 z-10 px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-[9px] font-black uppercase text-white border border-white/10">PROOF {idx+1}</p>
                       <img src={src} alt={`Audit ${idx+1}`} className="w-full h-auto object-contain rounded-[2rem]" />
                    </div>
                 ))}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setViewingHistoryScreenshots(null); }} 
                className="absolute top-8 right-8 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-xl border border-white/20 pointer-events-auto"
              >
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
           </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </div>
  );
}
