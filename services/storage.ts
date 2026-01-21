
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, push, update, remove } from 'firebase/database';
import { User, Task, Transaction, SEOConfig } from '../types';

const firebaseConfig = {
  databaseURL: "https://spreddd-d7d70-default-rtdb.firebaseio.com/",
  projectId: "spreddd-d7d70",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const KEYS = {
  USER: 'ct_user',
  TASKS: 'tasks',
  TRANSACTIONS: 'transactions',
  USERS: 'users',
  ALL_TRANSACTIONS: 'all_transactions',
  SEO: 'seo_config',
  EMAIL_LOOKUP: 'email_to_id'
};

export const storage = {
  // Utility to create a safe Firebase key from a email
  sanitizeEmail: (email: string): string => {
    return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  },

  getUserId: (): string => {
    let id = localStorage.getItem('ap_local_id');
    if (!id) {
      id = 'ID-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      localStorage.setItem('ap_local_id', id);
    }
    return id;
  },

  getUser: (): User => {
    const data = localStorage.getItem(KEYS.USER);
    if (!data) return { 
      id: storage.getUserId(), 
      username: 'Guest', 
      email: '', 
      coins: 0, 
      depositBalance: 0,
      completedTasks: [], 
      createdTasks: [], 
      isLoggedIn: false 
    };
    return JSON.parse(data);
  },

  setUser: async (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    if (user.isLoggedIn) {
      const cloudRef = ref(db, `${KEYS.USERS}/${user.id}`);
      // Updated admin email check
      const isAdmin = user.email.toLowerCase().trim() === 'admin@adspredia.site' ? true : (user.isAdmin || false);
      const userToSave = { ...user, isAdmin };
      
      // Update the user record
      await set(cloudRef, userToSave);
      
      // Update email lookup mapping
      if (user.email) {
        const emailKey = storage.sanitizeEmail(user.email);
        await set(ref(db, `${KEYS.EMAIL_LOOKUP}/${emailKey}`), user.id);
      }
    }
  },

  // Get User ID by Email
  getUserIdByEmail: async (email: string): Promise<string | null> => {
    const emailKey = storage.sanitizeEmail(email);
    const snapshot = await get(ref(db, `${KEYS.EMAIL_LOOKUP}/${emailKey}`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  syncUserFromCloud: async (userId: string): Promise<User | null> => {
    const cloudRef = ref(db, `${KEYS.USERS}/${userId}`);
    const snapshot = await get(cloudRef);
    if (snapshot.exists()) {
      const cloudData = snapshot.val();
      localStorage.setItem(KEYS.USER, JSON.stringify(cloudData));
      return cloudData;
    }
    return null;
  },
  
  getTasks: (): Task[] => {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },

  setTasks: (tasks: Task[]) => {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    set(ref(db, KEYS.TASKS), tasks);
  },

  updateTaskInCloud: async (taskId: string, updates: Partial<Task>) => {
    const snapshot = await get(ref(db, KEYS.TASKS));
    let tasks: Task[] = snapshot.exists() ? snapshot.val() : [];
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      await set(ref(db, KEYS.TASKS), tasks);
    }
  },

  deleteTaskFromCloud: async (taskId: string) => {
    const snapshot = await get(ref(db, KEYS.TASKS));
    let tasks: Task[] = snapshot.exists() ? snapshot.val() : [];
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    await set(ref(db, KEYS.TASKS), updatedTasks);
  },
  
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  addTransaction: async (tx: Transaction) => {
    const txs = storage.getTransactions();
    const updated = [tx, ...txs];
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updated));
    
    await push(ref(db, `user_transactions/${tx.userId}`), tx);
    await set(ref(db, `${KEYS.ALL_TRANSACTIONS}/${tx.id}`), tx);
  },

  getAllUsers: async (): Promise<User[]> => {
    const snapshot = await get(ref(db, KEYS.USERS));
    const data = snapshot.val();
    return data ? Object.values(data) : [];
  },

  getAllGlobalTransactions: async (): Promise<Transaction[]> => {
    const snapshot = await get(ref(db, KEYS.ALL_TRANSACTIONS));
    const data = snapshot.val();
    return data ? Object.values(data) : [];
  },

  updateGlobalTransaction: async (txId: string, updates: Partial<Transaction>) => {
    await update(ref(db, `${KEYS.ALL_TRANSACTIONS}/${txId}`), updates);
  },

  updateUserInCloud: async (userId: string, updates: Partial<User>) => {
    await update(ref(db, `${KEYS.USERS}/${userId}`), updates);
  },

  subscribeToTasks: (callback: (tasks: Task[]) => void) => {
    const tasksRef = ref(db, KEYS.TASKS);
    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        localStorage.setItem(KEYS.TASKS, JSON.stringify(data));
        callback(data);
      }
    });
  },

  getSEOConfig: async (): Promise<SEOConfig> => {
    const snapshot = await get(ref(db, KEYS.SEO));
    if (snapshot.exists()) return snapshot.val();
    return {
      siteTitle: 'Ads Predia | Earn & Advertise',
      metaDescription: 'A high-end micro-freelancing and advertising platform.',
      keywords: 'earn money, micro tasks, advertising, freelancers',
      ogImage: ''
    };
  },

  setSEOConfig: async (config: SEOConfig) => {
    await set(ref(db, KEYS.SEO), config);
  }
};
