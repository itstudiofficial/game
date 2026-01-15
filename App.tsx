
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import CreateTask from './pages/CreateTask';
import Wallet from './pages/Wallet';
import Dashboard from './pages/Dashboard';
import { User, Task, Transaction, TaskType } from './types';
import { storage } from './services/storage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User>(storage.getUser());
  const [tasks, setTasks] = useState<Task[]>(storage.getTasks());
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulation of loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sync with storage
  useEffect(() => {
    storage.setUser(user);
  }, [user]);

  useEffect(() => {
    storage.setTasks(tasks);
  }, [tasks]);

  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (user.completedTasks.includes(taskId)) {
      alert('You have already completed this task!');
      return;
    }

    const updatedUser = {
      ...user,
      coins: user.coins + task.reward,
      completedTasks: [...user.completedTasks, taskId]
    };
    setUser(updatedUser);

    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, completedCount: t.completedCount + 1 } : t
    );
    setTasks(updatedTasks);

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      amount: task.reward,
      type: 'earn',
      status: 'success',
      date: new Date().toLocaleDateString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);

    alert(`Success! You earned ${task.reward} coins.`);
  };

  const createTask = (taskData: { title: string; type: TaskType; reward: number; totalWorkers: number; description: string }) => {
    const totalCost = taskData.reward * taskData.totalWorkers;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...taskData,
      creatorId: user.id,
      completedCount: 0,
      status: 'active'
    };

    const updatedUser = {
      ...user,
      coins: user.coins - totalCost,
      createdTasks: [...user.createdTasks, newTask.id]
    };
    setUser(updatedUser);
    setTasks([newTask, ...tasks]);

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      amount: totalCost,
      type: 'spend',
      status: 'success',
      date: new Date().toLocaleDateString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);

    alert('Task created successfully and is now live!');
    setCurrentPage('dashboard');
  };

  const handleWalletAction = (type: 'deposit' | 'withdraw', amount: number, method: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      amount: amount,
      type: type,
      method: method,
      status: 'pending',
      date: new Date().toLocaleDateString()
    };
    
    if (type === 'withdraw') {
      setUser({ ...user, coins: user.coins - amount });
    }

    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
    alert(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} request of ${amount} coins submitted via ${method}. Check status in dashboard.`);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <i className="fa-solid fa-coins text-indigo-600 text-6xl animate-bounce mb-4"></i>
        <h2 className="text-xl font-bold text-slate-800">Loading CoinTasker...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} />
      
      <main className="flex-grow">
        {currentPage === 'home' && <Home onStart={setCurrentPage} />}
        {currentPage === 'tasks' && <Tasks tasks={tasks} onComplete={completeTask} />}
        {currentPage === 'create' && <CreateTask onCreate={createTask} userCoins={user.coins} />}
        {currentPage === 'wallet' && <Wallet coins={user.coins} onAction={handleWalletAction} />}
        {currentPage === 'dashboard' && <Dashboard user={user} tasks={tasks} transactions={transactions} />}
        {currentPage === 'login' && (
           <div className="max-w-md mx-auto py-24 px-6 text-center">
             <h2 className="text-3xl font-bold mb-6">Demo Mode</h2>
             <p className="text-slate-500 mb-8">This is a demonstration app. You are currently logged in as a simulated user.</p>
             <button onClick={() => { setUser({...user, isLoggedIn: true}); setCurrentPage('home'); }} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">Start Session</button>
           </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
