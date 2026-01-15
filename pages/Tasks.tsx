
import React, { useState } from 'react';
import { Task } from '../types';

interface TasksProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, onComplete }) => {
  const [filter, setFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.type === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Available Tasks</h1>
          <p className="text-slate-500">Find tasks that suit your skills and start earning.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Social', 'Video', 'Web', 'Micro'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                task.type === 'Video' ? 'bg-red-50 text-red-600' :
                task.type === 'Social' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {task.type}
              </span>
              <div className="flex items-center text-yellow-600 font-bold">
                <i className="fa-solid fa-coins mr-1"></i>
                {task.reward}
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">{task.title}</h3>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2">{task.description}</p>
            
            <div className="mt-auto">
               <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
                  <span>Progress: {task.completedCount}/{task.totalWorkers}</span>
                  <span>{Math.round((task.completedCount / task.totalWorkers) * 100)}%</span>
               </div>
               <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(task.completedCount / task.totalWorkers) * 100}%` }}
                  ></div>
               </div>
               <button 
                onClick={() => setSelectedTask(task)}
                className="w-full py-3 bg-slate-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold rounded-xl transition-all border border-indigo-100"
               >
                View Details
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedTask.title}</h2>
                  <span className="text-indigo-600 font-medium">{selectedTask.type} Task</span>
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
              
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Instructions</h4>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedTask.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <div className="text-xs text-yellow-600 font-bold uppercase mb-1">Reward</div>
                    <div className="text-xl font-bold text-yellow-700">{selectedTask.reward} Coins</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="text-xs text-indigo-600 font-bold uppercase mb-1">Avg Time</div>
                    <div className="text-xl font-bold text-indigo-700">2 Mins</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => { onComplete(selectedTask.id); setSelectedTask(null); }}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Complete & Submit Proof
                </button>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="w-full py-4 text-slate-500 font-medium hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
