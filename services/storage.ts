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
  EMAIL_LOOKUP: 'email_to_id',
  USER_TXS: 'user_transactions'
};

const isBrowser = typeof window !== 'undefined';

export const storage = {
  safeSetItem: (key: string, value: string) => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Storage quota exceeded for key: ${key}. Initiating emergency cache purge.`);
      
      // Attempt to clear non-critical admin caches to make space
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('admin_data_cache_')) {
          localStorage.removeItem(k);
        }
      });
      
      // Try one last time after purge
      try {
        localStorage.setItem(key, value);
      } catch (retryError) {
        console.error("Critical: Storage still full after purge. Item not saved:", key);
      }
    }
  },

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
    try {
      if (Array.isArray(data)) {
        return data.filter(item => item !== null) as T[];
      }
      if (typeof data === 'object') {
        return Object.values(data).filter(item => item !== null) as T[];
      }
    } catch (e) {
      console.error("Critical: ensureArray conversion failed", e);
    }
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
      storage.safeSetItem('ap_local_id', id);
    }
    return id;
  },

  getUser: (): User => {
    if (!isBrowser) return { 
      id: 'SERVER', username: 'Guest', email: '', coins: 0, depositBalance: 0,
      completedTasks: [], createdTasks: [], isLoggedIn: false 
    };
    
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
    try {
      return JSON.parse(data);
    } catch {
      return { 
        id: storage.getUserId(), username: 'Guest', email: '', coins: 0, depositBalance: 0,
        completedTasks: [], createdTasks: [], isLoggedIn: false 
      };
    }
  },

  setUser: async (user: User) => {
    const formattedUsername = user.username.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const sanitizedUser = { ...user, username: formattedUsername };

    if (isBrowser) {
      storage.safeSetItem(KEYS.USER, JSON.stringify(sanitizedUser));
    }
    
    if (sanitizedUser.isLoggedIn) {
      const cloudRef = ref(db, `${KEYS.USERS}/${sanitizedUser.id}`);
      const isAdmin = sanitizedUser.email.toLowerCase().trim() === 'ehtesham@adspredia.site' ? true : (sanitizedUser.isAdmin || false);
      const userToSave = storage.cleanData({ 
        ...sanitizedUser, 
        isAdmin, 
        status: sanitizedUser.status || 'active' 
      });
      await set(cloudRef, userToSave);
      
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
    const cloudRef = ref(db, `${KEYS.USERS}/${userId}`);
    const snapshot = await get(cloudRef);
    if (snapshot.exists()) {
      const cloudData = snapshot.val();
      if (isBrowser) {
        storage.safeSetItem(KEYS.USER, JSON.stringify(cloudData));
      }
      return cloudData;
    }
    return null;
  },
  
  getTasks: async (): Promise<Task[]> => {
    try {
      const snapshot = await get(ref(db, KEYS.TASKS));
      if (snapshot.exists()) {
        const cloudTasks = storage.ensureArray<Task>(snapshot.val());
        if (isBrowser) {
          storage.safeSetItem(KEYS.TASKS, JSON.stringify(cloudTasks));
        }
        return cloudTasks;
      }
    } catch (error) {
      console.error("Cloud task fetch error:", error);
    }
    
    if (isBrowser) {
      const data = localStorage.getItem(KEYS.TASKS);
      try {
        const parsed = data ? JSON.parse(data) : [];
        return storage.ensureArray<Task>(parsed);
      } catch (e) {
        return [];
      }
    }
    return [];
  },

  setTasks: (tasks: Task[]) => {
    const cleanTasks = storage.ensureArray<Task>(tasks).map(storage.cleanData);
    if (isBrowser) {
      storage.safeSetItem(KEYS.TASKS, JSON.stringify(cleanTasks));
    }
    set(ref(db, KEYS.TASKS), cleanTasks);
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
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    await set(ref(db, KEYS.TASKS), updatedTasks);
  },
  
  getTransactions: (): Transaction[] => {
    if (isBrowser) {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    }
    return [];
  },

  getUserTransactions: async (userId: string): Promise<Transaction[]> => {
    try {
      const snapshot = await get(ref(db, `${KEYS.USER_TXS}/${userId}`));
      if (snapshot.exists()) {
        const txs = storage.ensureArray<Transaction>(snapshot.val());
        const sorted = txs.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });
        if (isBrowser) {
          storage.safeSetItem(KEYS.TRANSACTIONS, JSON.stringify(sorted));
        }
        return sorted;
      }
    } catch (error) {
      console.error("Error fetching user transactions:", error);
    }
    return storage.getTransactions();
  },

  addTransaction: async (tx: Transaction) => {
    const cleanTx = storage.cleanData(tx);
    const globalTxRef = ref(db, `${KEYS.ALL_TRANSACTIONS}/${tx.id}`);
    await set(globalTxRef, cleanTx);
    
    const userTxRef = ref(db, `${KEYS.USER_TXS}/${tx.userId}`);
    await push(userTxRef, cleanTx);
    
    const currentTxs = storage.getTransactions();
    if (isBrowser) {
      storage.safeSetItem(KEYS.TRANSACTIONS, JSON.stringify([cleanTx, ...currentTxs]));
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    const snapshot = await get(ref(db, KEYS.USERS));
    return storage.ensureArray<User>(snapshot.val());
  },

  getAllGlobalTransactions: async (): Promise<Transaction[]> => {
    try {
      const snapshot = await get(ref(db, KEYS.ALL_TRANSACTIONS));
      if (snapshot.exists()) {
        const data = snapshot.val();
        return storage.ensureArray<Transaction>(data);
      }
    } catch (error) {
      console.error("Global Transaction Fetch Error:", error);
    }
    return [];
  },

  subscribeToAllTransactions: (callback: (txs: Transaction[]) => void) => {
    const txRef = ref(db, KEYS.ALL_TRANSACTIONS);
    return onValue(txRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(storage.ensureArray<Transaction>(data));
      } else {
        callback([]);
      }
    }, (error) => {
      console.error("Live subscription failed:", error);
    });
  },

  updateGlobalTransaction: async (txId: string, updates: Partial<Transaction>) => {
    const updateData = storage.cleanData(updates);
    await update(ref(db, `${KEYS.ALL_TRANSACTIONS}/${txId}`), updateData);
    
    const globalSnapshot = await get(ref(db, `${KEYS.ALL_TRANSACTIONS}/${txId}`));
    if (globalSnapshot.exists()) {
      const txData = globalSnapshot.val();
      const userTxsRef = ref(db, `${KEYS.USER_TXS}/${txData.userId}`);
      const userTxsSnapshot = await get(userTxsRef);
      
      if (userTxsSnapshot.exists()) {
        const entries = userTxsSnapshot.val();
        const firebaseKey = Object.keys(entries).find(key => entries[key].id === txId);
        if (firebaseKey) {
          await update(ref(db, `${KEYS.USER_TXS}/${txData.userId}/${firebaseKey}`), updateData);
        }
      }
    }
  },

  updateUserInCloud: async (userId: string, updates: Partial<User>) => {
    await update(ref(db, `${KEYS.USERS}/${userId}`), storage.cleanData(updates));
  },

  subscribeToTasks: (callback: (tasks: Task[]) => void) => {
    const tasksRef = ref(db, KEYS.TASKS);
    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      const tasksArray = storage.ensureArray<Task>(data);
      if (isBrowser) {
        storage.safeSetItem(KEYS.TASKS, JSON.stringify(tasksArray));
      }
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
    await set(ref(db, KEYS.SEO), storage.cleanData(config));
  }
};