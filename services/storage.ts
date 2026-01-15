
import { User, Task, Transaction } from '../types';

const KEYS = {
  USER: 'ct_user',
  TASKS: 'ct_tasks',
  TRANSACTIONS: 'ct_transactions'
};

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Subscribe to Tech Channel', type: 'Video', reward: 50, description: 'Watch at least 2 mins and subscribe.', creatorId: 'admin', totalWorkers: 100, completedCount: 45, status: 'active' },
  { id: '2', title: 'Follow on Instagram', type: 'Social', reward: 20, description: 'Follow @cointasker_pro for updates.', creatorId: 'admin', totalWorkers: 500, completedCount: 120, status: 'active' },
  { id: '3', title: 'Visit Landing Page', type: 'Web', reward: 15, description: 'Stay on page for 30 seconds.', creatorId: 'admin', totalWorkers: 1000, completedCount: 850, status: 'active' },
  { id: '4', title: 'Retweet Promotion', type: 'Social', reward: 30, description: 'Retweet the pinned post.', creatorId: 'admin', totalWorkers: 200, completedCount: 10, status: 'active' }
];

export const storage = {
  getUser: (): User => {
    const data = localStorage.getItem(KEYS.USER);
    if (!data) return { id: 'u1', username: 'Guest', email: '', coins: 100, completedTasks: [], createdTasks: [], isLoggedIn: false };
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
