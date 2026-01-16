
import { User, Task, Transaction } from '../types';

const KEYS = {
  USER: 'ct_user',
  TASKS: 'ct_tasks',
  TRANSACTIONS: 'ct_transactions'
};

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Subscribe to Tech Channel', type: 'YouTube', reward: 50, description: 'Watch at least 2 mins and subscribe.', creatorId: 'admin', totalWorkers: 100, completedCount: 45, status: 'active' },
  { id: '2', title: 'Install Fitness Tracker', type: 'Apps', reward: 150, description: 'Download, install and open the app for 1 minute.', creatorId: 'admin', totalWorkers: 50, completedCount: 12, status: 'active' },
  { id: '3', title: 'Visit Finance Blog', type: 'Websites', reward: 15, description: 'Stay on page for 30 seconds.', creatorId: 'admin', totalWorkers: 1000, completedCount: 850, status: 'active' },
  { id: '4', title: 'Like & Retweet Post', type: 'Social Media', reward: 30, description: 'Like and retweet the pinned post on our Twitter profile.', creatorId: 'admin', totalWorkers: 200, completedCount: 10, status: 'active' }
];

export const storage = {
  getUser: (): User => {
    const data = localStorage.getItem(KEYS.USER);
    if (!data) return { id: 'UID-' + Math.random().toString(36).substr(2, 6).toUpperCase(), username: 'Guest', email: '', coins: 0, completedTasks: [], createdTasks: [], isLoggedIn: false };
    return JSON.parse(data);
  },
  setUser: (user: User) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  
  getTasks: (): Task[] => {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : DEFAULT_TASKS;
  },
  setTasks: (tasks: Task[]) => localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks)),
  
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  addTransaction: (tx: Transaction) => {
    const txs = storage.getTransactions();
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([tx, ...txs]));
  }
};
