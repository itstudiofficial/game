
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
  // Helper to ensure we always work with an array from Firebase
  ensureArray: <T>(data: any): T[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data.filter(item => item !== null);
    return Object.values(data).filter(item => item !== null) as T[];
  },

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
      const isAdmin = user.email.toLowerCase().trim() === 'ehtesham@adspredia.site' ? true : (user.isAdmin || false);
      const userToSave = { ...user, isAdmin };
      await set(cloudRef, userToSave);
      
      if (user.email) {
        const emailKey = storage.sanitizeEmail(user.email);
        await set(ref(db, `${KEYS.EMAIL_LOOKUP}/${emailKey}`), user.id);
      }
    }
  },

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
  
  // FIX: Updated to fetch directly from cloud if requested for Admin Panel consistency
  getTasks: async (): Promise<Task[]> => {
    try {
      const snapshot = await get(ref(db, KEYS.TASKS));
      if (snapshot.exists()) {
        const cloudTasks = storage.ensureArray<Task>(snapshot.val());
        localStorage.setItem(KEYS.TASKS, JSON.stringify(cloudTasks));
        return cloudTasks;
      }
    } catch (error) {
      console.error("Cloud task fetch error:", error);
    }
    
    // Fallback to local storage
    const data = localStorage.getItem(KEYS.TASKS);
    try {
      const parsed = data ? JSON.parse(data) : [];
      return storage.ensureArray<Task>(parsed);
    } catch (e) {
      return [];
    }
  },

  setTasks: (tasks: Task[]) => {
    const cleanTasks = storage.ensureArray<Task>(tasks);
    localStorage.setItem(KEYS.TASKS, JSON.stringify(cleanTasks));
    set(ref(db, KEYS.TASKS), cleanTasks);
  },

  updateTaskInCloud: async (taskId: string, updates: Partial<Task>) => {
    const snapshot = await get(ref(db, KEYS.TASKS));
    let tasks: Task[] = storage.ensureArray<Task>(snapshot.val());
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      await set(ref(db, KEYS.TASKS), tasks);
    }
  },

  deleteTaskFromCloud: async (taskId: string) => {
    const snapshot = await get(ref(db, KEYS.TASKS));
    let tasks: Task[] = storage.ensureArray<Task>(snapshot.val());
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
    return storage.ensureArray<User>(snapshot.val());
  },

  getAllGlobalTransactions: async (): Promise<Transaction[]> => {
    const snapshot = await get(ref(db, KEYS.ALL_TRANSACTIONS));
    return storage.ensureArray<Transaction>(snapshot.val());
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
      const tasksArray = storage.ensureArray<Task>(data);
      localStorage.setItem(KEYS.TASKS, JSON.stringify(tasksArray));
      callback(tasksArray);
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
