
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

  const handleLogin = async (userData: { username: string; email?: string; isLoggedIn: boolean, isAdmin?: boolean, referredBy?: string }) => {
    const updatedUser: User = {
      ...user,
      ...userData,
      isLoggedIn: true,
      coins: user.isLoggedIn ? user.coins : 0,
      depositBalance: user.isLoggedIn ? user.depositBalance : 0,
      referredBy: (userData.referredBy || '').toUpperCase().trim(),
      completedTasks: user.completedTasks || [],
      createdTasks: user.createdTasks || []
    };
    
    setUser(updatedUser);
    setCurrentPage(userData.isAdmin ? 'admin' : 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    const guestUser: User = {
      id: storage.getUserId(),
      username: 'Guest',
      email: '',
      isLoggedIn: false,
      isAdmin: false,
      coins: 0,
      depositBalance: 0,
      completedTasks: [],
      createdTasks: []
    };
    setUser(guestUser);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createTask = (taskData: { title: string; type: TaskType; reward: number; totalWorkers: number; description: string, link?: string }) => {
    const totalCost = taskData.reward * taskData.totalWorkers;
    if (totalCost > (user.depositBalance || 0)) {
      alert('Insufficient deposit balance. Please add funds to your Ad Vault first!');
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
      depositBalance: (user.depositBalance || 0) - totalCost,
      createdTasks: [...(user.createdTasks || []), newTask.id]
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
    alert('Campaign launched! Status: PENDING review.');
    setCurrentPage('my-campaigns');
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
      if (amount < 5000) return alert('Minimum withdrawal is 5,000 coins ($1.00)');
      if (user.coins < amount) return alert('Insufficient earning balance.');
      setUser({ ...user, coins: user.coins - amount });
    }
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
    alert(`${type.toUpperCase()} request for ${amount} coins submitted.`);
  };

  const handleSpinResult = (reward: number, cost: number) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      amount: reward,
      type: 'spin',
      status: 'success',
      date: new Date().toLocaleString()
    };
    setUser({ ...user, coins: user.coins + reward });
    storage.addTransaction(newTx);
    setTransactions([newTx, ...transactions]);
  };

  const deleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      const updatedTasks = tasks.filter(t => t.id !== id);
      setTasks(updatedTasks);
      storage.setTasks(updatedTasks);
    }
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...data } : t);
    setTasks(updatedTasks);
    storage.setTasks(updatedTasks);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentPage={currentPage} setCurrentPage={navigateTo} user={user} onLogout={handleLogout} />
      <main className="flex-grow">
        {currentPage === 'home' && <Home onStart={navigateTo} isLoggedIn={user.isLoggedIn} />}
        {currentPage === 'features' && <Features />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'tasks' && <Tasks tasks={tasks.filter(t => t.status === 'active')} onComplete={(id) => { /* Logic */ }} />}
        {currentPage === 'create' && <CreateTask onCreate={createTask} userDepositBalance={user.depositBalance} navigateTo={navigateTo} />}
        {currentPage === 'wallet' && <Wallet coins={user.coins} depositBalance={user.depositBalance} onAction={handleWalletAction} transactions={transactions} />}
        {currentPage === 'dashboard' && user.isLoggedIn && <Dashboard user={user} tasks={tasks} transactions={transactions} onDeleteTask={deleteTask} onUpdateTask={updateTask} />}
        {currentPage === 'login' && <Login onLogin={handleLogin} />}
        {currentPage === 'spin' && user.isLoggedIn && <SpinWheel userCoins={user.coins} onSpin={handleSpinResult} transactions={transactions} />}
        {currentPage === 'referrals' && user.isLoggedIn && <Referrals user={user} />}
        {currentPage === 'my-campaigns' && user.isLoggedIn && <MyCampaigns user={user} tasks={tasks} onDeleteTask={deleteTask} onUpdateTask={updateTask} />}
        {currentPage === 'profile' && user.isLoggedIn && <ProfileSettings user={user} />}
        {currentPage === 'admin' && user.isAdmin && <AdminPanel />}
      </main>
      <Footer setCurrentPage={navigateTo} isLoggedIn={user.isLoggedIn} />
    </div>
  );
};

export default App;
