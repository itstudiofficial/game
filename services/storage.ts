import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, update } from 'firebase/database';
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
  EMAIL_LOOKUP: 'email_to_id',
  USER_TXS: 'user_transactions'
};

const isBrowser = typeof window !== 'undefined';

export const storage = {
  cleanData: (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(storage.cleanData);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, storage.cleanData(v)])
      );
    }
    return obj;
  },

  ensureArray: <T>(data: any): T[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data.filter(item => item !== null) as T[];
    if (typeof data === 'object') return Object.values(data).filter(item => item !== null) as T[];
    return [];
  },

  sanitizeEmail: (email: string): string => {
    return email.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '_');
  },

  getUserId: (): string => {
    if (!isBrowser) return 'SERVER';
    let id = localStorage.getItem('ap_local_id');
    if (!id) {
      id = 'USR-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      localStorage.setItem('ap_local_id', id);
    }
    return id;
  },

  getUser: (): User => {
    if (!isBrowser) return { id: 'SERVER', username: 'Guest', email: '', coins: 0, depositBalance: 0, completedTasks: [], createdTasks: [], isLoggedIn: false };
    const data = localStorage.getItem(KEYS.USER);
    try {
      return data ? JSON.parse(data) : { id: storage.getUserId(), username: 'Guest', email: '', coins: 0, depositBalance: 0, completedTasks: [], createdTasks: [], isLoggedIn: false };
    } catch {
      return { id: storage.getUserId(), username: 'Guest', email: '', coins: 0, depositBalance: 0, completedTasks: [], createdTasks: [], isLoggedIn: false };
    }
  },

  setUser: async (user: User) => {
    const formattedUsername = user.username.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const sanitizedUser = { ...user, username: formattedUsername };
    if (isBrowser) localStorage.setItem(KEYS.USER, JSON.stringify(sanitizedUser));
    if (sanitizedUser.isLoggedIn) {
      const isAdmin = sanitizedUser.email.toLowerCase().trim() === 'ehtesham@adspredia.site' ? true : (sanitizedUser.isAdmin || false);
      const userToSave = storage.cleanData({ ...sanitizedUser, isAdmin, status: sanitizedUser.status || 'active' });
      await set(ref(db, `${KEYS.USERS}/${sanitizedUser.id}`), userToSave);
      if (sanitizedUser.email) {
        const emailKey = storage.sanitizeEmail(sanitizedUser.email).replace(/\./g, '_');
        await set(ref(db, `${KEYS.EMAIL_LOOKUP}/${emailKey}`), sanitizedUser.id);
      }
    }
  },

  getUserIdByEmail: async (email: string): Promise<string | null> => {
    const emailKey = storage.sanitizeEmail(email).replace(/\./g, '_');
    const snapshot = await get(ref(db, `${KEYS.EMAIL_LOOKUP}/${emailKey}`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  syncUserFromCloud: async (userId: string): Promise<User | null> => {
    const snapshot = await get(ref(db, `${KEYS.USERS}/${userId}`));
    if (snapshot.exists()) {
      const cloudData = snapshot.val();
      if (isBrowser) localStorage.setItem(KEYS.USER, JSON.stringify(cloudData));
      return cloudData;
    }
    return null;
  },
  
  getTasks: async (): Promise<Task[]> => {
    const snapshot = await get(ref(db, KEYS.TASKS));
    return snapshot.exists() ? storage.ensureArray<Task>(snapshot.val()) : [];
  },

  setTasks: (tasks: Task[]) => {
    set(ref(db, KEYS.TASKS), storage.ensureArray<Task>(tasks).map(storage.cleanData));
  },

  updateTaskInCloud: async (taskId: string, updates: Partial<Task>) => {
    const snapshot = await get(ref(db, KEYS.TASKS));
    let tasks: Task[] = storage.ensureArray<Task>(snapshot.val());
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = storage.cleanData({ ...tasks[index], ...updates });
      await set(ref(db, KEYS.TASKS), tasks);
    }
  },

  deleteTaskFromCloud: async (taskId: string) => {
    const snapshot = await get(ref(db, KEYS.TASKS));
    let tasks: Task[] = storage.ensureArray<Task>(snapshot.val());
    await set(ref(db, KEYS.TASKS), tasks.filter(t => t.id !== taskId));
  },
  
  getTransactions: (): Transaction[] => {
    if (isBrowser) {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    }
    return [];
  },

  getUserTransactions: async (userId: string): Promise<Transaction[]> => {
    const snapshot = await get(ref(db, `${KEYS.USER_TXS}/${userId}`));
    if (snapshot.exists()) {
      const txs = storage.ensureArray<Transaction>(snapshot.val()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (isBrowser) localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
      return txs;
    }
    return [];
  },

  addTransaction: async (tx: Transaction) => {
    const cleanTx = storage.cleanData(tx);
    await set(ref(db, `${KEYS.ALL_TRANSACTIONS}/${tx.id}`), cleanTx);
    await push(ref(db, `${KEYS.USER_TXS}/${tx.userId}`), cleanTx);
    const currentTxs = storage.getTransactions();
    if (isBrowser) localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([cleanTx, ...currentTxs]));
  },

  getAllUsers: async (): Promise<User[]> => {
    const snapshot = await get(ref(db, KEYS.USERS));
    return storage.ensureArray<User>(snapshot.val());
  },

  getAllGlobalTransactions: async (): Promise<Transaction[]> => {
    const snapshot = await get(ref(db, KEYS.ALL_TRANSACTIONS));
    return snapshot.exists() ? storage.ensureArray<Transaction>(snapshot.val()) : [];
  },

  updateGlobalTransaction: async (txId: string, updates: Partial<Transaction>) => {
    const updateData = storage.cleanData(updates);
    await update(ref(db, `${KEYS.ALL_TRANSACTIONS}/${txId}`), updateData);
    const globalSnapshot = await get(ref(db, `${KEYS.ALL_TRANSACTIONS}/${txId}`));
    if (globalSnapshot.exists()) {
      const txData = globalSnapshot.val();
      const userTxsSnapshot = await get(ref(db, `${KEYS.USER_TXS}/${txData.userId}`));
      if (userTxsSnapshot.exists()) {
        const entries = userTxsSnapshot.val();
        const firebaseKey = Object.keys(entries).find(key => entries[key].id === txId);
        if (firebaseKey) await update(ref(db, `${KEYS.USER_TXS}/${txData.userId}/${firebaseKey}`), updateData);
      }
    }
  },

  updateUserInCloud: async (userId: string, updates: Partial<User>) => {
    await update(ref(db, `${KEYS.USERS}/${userId}`), storage.cleanData(updates));
  },

  getSEOConfig: async (): Promise<SEOConfig> => {
    const snapshot = await get(ref(db, KEYS.SEO));
    return snapshot.exists() ? snapshot.val() : { siteTitle: 'Ads Predia', metaDescription: 'Micro-freelancing platform.', keywords: 'earn, advertise', ogImage: '' };
  },

  setSEOConfig: async (config: SEOConfig) => {
    await set(ref(db, KEYS.SEO), storage.cleanData(config));
  }
};