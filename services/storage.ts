
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
      const userToSave = storage.cleanData({ ...user, isAdmin });
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
    
    const data = localStorage.getItem(KEYS.TASKS);
    try {
      const parsed = data ? JSON.parse(data) : [];
      return storage.ensureArray<Task>(parsed);
    } catch (e) {
      return [];
    }
  },

  setTasks: (tasks: Task[]) => {
    const cleanTasks = storage.ensureArray<Task>(tasks).map(storage.cleanData);
    localStorage.setItem(KEYS.TASKS, JSON.stringify(cleanTasks));
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
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  getUserTransactions: async (userId: string): Promise<Transaction[]> => {
    try {
      const snapshot = await get(ref(db, `${KEYS.USER_TXS}/${userId}`));
      if (snapshot.exists()) {
        const txs = storage.ensureArray<Transaction>(snapshot.val());
        const sorted = txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(sorted));
        return sorted;
      }
    } catch (error) {
      console.error("Error fetching user transactions:", error);
    }
    return storage.getTransactions();
  },

  addTransaction: async (tx: Transaction) => {
    const cleanTx = storage.cleanData(tx);
    const txs = storage.getTransactions();
    const updated = [cleanTx, ...txs];
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updated));
    
    // Save to user node and global node
    await push(ref(db, `${KEYS.USER_TXS}/${tx.userId}`), cleanTx);
    await set(ref(db, `${KEYS.ALL_TRANSACTIONS}/${tx.id}`), cleanTx);
  },

  getAllUsers: async (): Promise<User[]> => {
    const snapshot = await get(ref(db, KEYS.USERS));
    return storage.ensureArray<User>(snapshot.val());
  },

  getAllGlobalTransactions: async (): Promise<Transaction[]> => {
    try {
      const snapshot = await get(ref(db, KEYS.ALL_TRANSACTIONS));
      if (snapshot.exists()) {
        return storage.ensureArray<Transaction>(snapshot.val());
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
      callback(storage.ensureArray<Transaction>(data));
    });
  },

  updateGlobalTransaction: async (txId: string, updates: Partial<Transaction>) => {
    await update(ref(db, `${KEYS.ALL_TRANSACTIONS}/${txId}`), storage.cleanData(updates));
    
    // Also update in user-specific node
    const snapshot = await get(ref(db, `${KEYS.ALL_TRANSACTIONS}/${txId}`));
    if (snapshot.exists()) {
      const tx = snapshot.val();
      const userTxRef = ref(db, `${KEYS.USER_TXS}/${tx.userId}`);
      const userTxSnapshot = await get(userTxRef);
      if (userTxSnapshot.exists()) {
        const userTxs = userTxSnapshot.val();
        const key = Object.keys(userTxs).find(k => userTxs[k].id === txId);
        if (key) {
          await update(ref(db, `${KEYS.USER_TXS}/${tx.userId}/${key}`), storage.cleanData(updates));
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
    await set(ref(db, KEYS.SEO), storage.cleanData(config));
  }
};
