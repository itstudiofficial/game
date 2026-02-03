
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
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200