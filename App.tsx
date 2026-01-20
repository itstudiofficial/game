
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
import Referrals from './pages/Referrals'; 
import AdminPanel from './pages/AdminPanel';
import Features from './pages/Features';
import Contact from './pages/Contact';
import MyCampaigns from './pages/MyCampaigns';
import ProfileSettings from './pages/ProfileSettings';
import { User, Task, Transaction, TaskType } from './types';
import { storage } from './services/storage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User>(storage.getUser());
  const [tasks, setTasks] = useState<Task[]>(storage.getTasks());
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions());
  const [infoModal, setInfoModal] = useState<{title: string, content: React.ReactNode} | null>(null);

  useEffect(() => {
    const handleUrlReferral = () => {
      const search = window.location.search;
      const urlParams = new URLSearchParams(search);
      const refId = (urlParams.get('ref') || '').toUpperCase().trim();

      if (refId && refId.length > 0 && refId !== 'UNDEFINED' && refId !== 'NULL') {
        sessionStorage.setItem('pending_referral', refId);
        window.history.replaceState({}, '', window.location.origin);
        if (!storage.getUser().isLoggedIn) {
          setCurrentPage('login');
        }
      }
    };
    handleUrlReferral();
  }, []);

  useEffect(() => {
    storage.setUser(user);
  }, [user]);

  useEffect(() => {
    storage.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
    });
  }, []);

  const handleLogin = (userData: { username: string; email?: string; isLoggedIn: boolean, isAdmin?: boolean, referredBy?: string }) => {
    const finalReferredBy = (userData.referredBy || user.referredBy || '').toUpperCase().trim();
    const updatedUser: User = {
      ...user,
      ...userData,
      isLoggedIn: true,
      coins: user.isLoggedIn ? user.coins : 0,
      referredBy: finalReferredBy
    };
    sessionStorage.removeItem('pending_referral');
    setUser(updatedUser);
    setCurrentPage(userData.isAdmin ? 'admin' : 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    const guestUser: User = {
      ...user,
      username: 'Guest',
      isLoggedIn: false,
      isAdmin: false,
      coins: 0,
      completedTasks: [],
      createdTasks: []
    };
    setUser(guestUser);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (page: string) => {
    const mainPages = ['home', 'tasks', 'create', 'my-campaigns', 'profile', 'spin', 'referrals', 'wallet', 'dashboard', 'login', 'admin', 'features', 'contact'];
    if (mainPages.includes(page)) {
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeTask = (taskId: string, submissionTime?: string) => {
    if (!user.isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'active') return;
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
    storage.setTasks(updatedTasks);

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      amount: task.reward,
      type: 'earn',
      status: 'success',
      date: submissionTime || new Date().toLocaleString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
    alert(`Success! You earned ${task.reward} coins.`);
  };

  const handleClaimReferralRewards = (amount: number) => {
    const updatedUser = { ...user, coins: user.coins + amount };
    setUser(updatedUser);
    
    const newTx: Transaction = {
      id: 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: user.id,
      username: user.username,
      amount: amount,
      type: 'earn',
      status: 'success',
      method: 'Referral Bounty',
      date: new Date().toLocaleString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
  };

  const handleSpin = (reward: number, cost: number) => {
    const updatedUser = { ...user, coins: user.coins - cost + reward };
    setUser(updatedUser);
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      amount: reward - cost,
      type: 'spin',
      status: 'success',
      date: new Date().toLocaleString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
  };

  const createTask = (taskData: { title: string; type: TaskType; reward: number; totalWorkers: number; description: string, link?: string }) => {
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
      status: 'pending'
    };
    const updatedUser = {
      ...user,
      coins: user.coins - totalCost,
      createdTasks: [...user.createdTasks, newTask.id]
    };
    setUser(updatedUser);
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    storage.setTasks(updatedTasks);
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      amount: totalCost,
      type: 'spend',
      status: 'success',
      date: new Date().toLocaleString()
    };
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
    alert('Campaign created! Status: PENDING review.');
    setCurrentPage('my-campaigns');
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...data } : t);
    setTasks(updatedTasks);
    storage.setTasks(updatedTasks);
    alert('Campaign updated successfully.');
  };

  const deleteTask = (id: string) => {
    if (window.confirm('Delete this campaign? This action is permanent.')) {
      const updatedTasks = tasks.filter(t => t.id !== id);
      setTasks(updatedTasks);
      storage.setTasks(updatedTasks);
    }
  };

  const handleWalletAction = (type: 'deposit' | 'withdraw', amount: number, method: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      amount: amount,
      type: type,
      method: method,
      status: 'pending',
      date: new Date().toLocaleString()
    };
    if (type === 'withdraw') {
      if (amount < 3000) return alert('Minimum withdrawal is 3000 coins');
      setUser({ ...user, coins: user.coins - amount });
    }
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
    alert(`${type.toUpperCase()} request for ${amount} coins submitted.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentPage={currentPage} setCurrentPage={navigateTo} user={user} onLogout={handleLogout} />
      <main className="flex-grow">
        {currentPage === 'home' && <Home onStart={navigateTo} isLoggedIn={user.isLoggedIn} />}
        {currentPage === 'features' && <Features />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'tasks' && <Tasks tasks={tasks.filter(t => t.status === 'active')} onComplete={completeTask} />}
        {currentPage === 'create' && <CreateTask onCreate={createTask} userCoins={user.coins} navigateTo={navigateTo} />}
        {currentPage === 'my-campaigns' && user.isLoggedIn && <MyCampaigns user={user} tasks={tasks} onDeleteTask={deleteTask} onUpdateTask={updateTask} />}
        {currentPage === 'profile' && user.isLoggedIn && <ProfileSettings user={user} />}
        {currentPage === 'spin' && <SpinWheel userCoins={user.coins} onSpin={handleSpin} transactions={transactions} />}
        {currentPage === 'referrals' && <Referrals user={user} onClaim={handleClaimReferralRewards} />}
        {currentPage === 'wallet' && <Wallet coins={user.coins} onAction={handleWalletAction} transactions={transactions} />}
        {currentPage === 'dashboard' && (
          user.isLoggedIn 
          ? <Dashboard user={user} tasks={tasks} transactions={transactions} onDeleteTask={deleteTask} onUpdateTask={updateTask} />
          : <Login onLogin={handleLogin} />
        )}
        {currentPage === 'login' && <Login onLogin={handleLogin} />}
        {currentPage === 'admin' && user.isAdmin && <AdminPanel />}
      </main>
      <Footer setCurrentPage={navigateTo} isLoggedIn={user.isLoggedIn} />
    </div>
  );
};

export default App;
