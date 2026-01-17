
import { User, Task, Transaction } from '../types';

const KEYS = {
  USER: 'ct_user',
  TASKS: 'ct_tasks',
  TRANSACTIONS: 'ct_transactions'
};

// Initialized as an empty array to remove placeholder/demo tasks
const DEFAULT_TASKS: Task[] = [];

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
