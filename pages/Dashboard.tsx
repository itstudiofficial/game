
import React from 'react';
import { User, Task, Transaction } from '../types';

interface DashboardProps {
  user: User;
  tasks: Task[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, tasks, transactions }) => {
  const userTasks = tasks.filter(t => user.createdTasks.includes(t.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900">Welcome Back, {user.username}!</h1>
        <p className="text-slate-500">Manage your earnings and created tasks here.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Available Balance', val: `${user.coins} Coins`, icon: 'fa-wallet', color: 'indigo' },
          { label: 'Tasks Completed', val: user.completedTasks.length, icon: 'fa-check-double', color: 'emerald' },
          { label: 'Tasks Created', val: user.createdTasks.length, icon: 'fa-plus-circle', color: 'blue' },
          { label: 'Pending Payouts', val: transactions.filter(t => t.status === 'pending').length, icon: 'fa-clock', color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${stat.color}-50 text-${stat.color}-600`}>
              <i className={`fa-solid ${stat.icon} text-xl`}></i>
            </div>
            <div className="text-slate-500 text-sm font-medium mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-slate-900">{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            <button className="text-indigo-600 text-sm font-bold">See All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No transactions found</div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'earn' ? 'bg-emerald-50 text-emerald-600' : 
                      tx.type === 'spend' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <i className={`fa-solid ${
                        tx.type === 'earn' ? 'fa-arrow-down' : 
                        tx.type === 'spend' ? 'fa-arrow-up' : 'fa-money-bill'
                      }`}></i>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 capitalize">{tx.type}</div>
                      <div className="text-xs text-slate-400">{tx.date}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    tx.type === 'earn' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Created Tasks */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">My Created Tasks</h3>
            <button className="text-indigo-600 text-sm font-bold">Manage</button>
          </div>
          <div className="divide-y divide-slate-50">
            {userTasks.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No tasks created yet</div>
            ) : (
              userTasks.map(task => (
                <div key={task.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">{task.title}</div>
                    <div className="text-xs text-slate-400">{task.completedCount} / {task.totalWorkers} workers completed</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
