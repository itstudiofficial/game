
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import CreateTask from './pages/CreateTask';
import Wallet from './pages/Wallet';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SpinWheel from './pages/SpinWheel';
import { User, Task, Transaction, TaskType } from './types';
import { storage } from './services/storage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User>(storage.getUser());
  const [tasks, setTasks] = useState<Task[]>(storage.getTasks());
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());

  useEffect(() => {
    storage.setUser(user);
  }, [user]);

  useEffect(() => {
    storage.setTasks(tasks);
  }, [tasks]);

  const handleLogin = (userData: { username: string; email?: string; isLoggedIn: boolean }) => {
    const updatedUser = {
      ...user,
      ...userData,
      isLoggedIn: true,
      // Removed bonus logic
      coins: user.coins 
    };
    setUser(updatedUser);
    setCurrentPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    const guestUser = {
      ...user,
      username: 'Guest',
      isLoggedIn: false,
      coins: 0,
      completedTasks: [],
      createdTasks: []
    };
    setUser(guestUser);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (page: string) => {
    const homeSections = ['about', 'features', 'contact', 'home'];
    if (homeSections.includes(page)) {
      if (currentPage !== 'home') {
        setCurrentPage('home');
        setTimeout(() => {
          const el = document.getElementById(page === 'home' ? 'root' : page);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(page === 'home' ? 'root' : page);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const completeTask = (taskId: string, submissionTime?: string) => {
    if (!user.isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (user.completedTasks.includes(taskId)) {
      alert('Task already completed!');
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
      date: submissionTime || new Date().toLocaleString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);

    alert(`Success! You earned ${task.reward} coins. Proof submitted at ${newTx.date}.`);
  };

  const handleSpin = (reward: number, cost: number) => {
    const updatedUser = {
      ...user,
      coins: user.coins - cost + reward
    };
    setUser(updatedUser);

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      amount: reward - cost,
      type: 'spin',
      status: 'success',
      date: new Date().toLocaleString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
  };

  const createTask = (taskData: { title: string; type: TaskType; reward: number; totalWorkers: number; description: string }) => {
    const totalCost = taskData.reward * taskData.totalWorkers;
    if (totalCost > user.coins) {
      alert('Insufficient balance. Please deposit coins first!');
      setCurrentPage('wallet');
      return;
    }

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
      date: new Date().toLocaleString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);

    alert('Task live! Check progress on your dashboard.');
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
      date: new Date().toLocaleString()
    };
    
    if (type === 'withdraw') {
      setUser({ ...user, coins: user.coins - amount });
    } else {
      setTimeout(() => {
        setUser(prev => ({ ...prev, coins: prev.coins + amount }));
        setTransactions(prev => prev.map(t => t.id === newTx.id ? { ...t, status: 'success' } : t));
      }, 3000);
    }

    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
    alert(`${type.toUpperCase()} request for ${amount} coins submitted via ${method}.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentPage={currentPage} setCurrentPage={navigateTo} user={user} onLogout={handleLogout} />
      
      <main className="flex-grow">
        {currentPage === 'home' && <Home onStart={navigateTo} isLoggedIn={user.isLoggedIn} />}
        {currentPage === 'tasks' && <Tasks tasks={tasks} onComplete={completeTask} />}
        {currentPage === 'create' && <CreateTask onCreate={createTask} userCoins={user.coins} navigateTo={navigateTo} />}
        {currentPage === 'spin' && <SpinWheel userCoins={user.coins} onSpin={handleSpin} transactions={transactions} />}
        {currentPage === 'wallet' && <Wallet coins={user.coins} onAction={handleWalletAction} />}
        {currentPage === 'dashboard' && (
          user.isLoggedIn 
          ? <Dashboard user={user} tasks={tasks} transactions={transactions} />
          : <Login onLogin={handleLogin} />
        )}
        {currentPage === 'login' && <Login onLogin={handleLogin} />}
      </main>

      <Footer />
    </div>
  );
};

export default App;
