
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, push, update, query, orderByChild, equalTo } from 'firebase/database';
import { User, Task, Transaction } from '../types';

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
  ALL_TRANSACTIONS: 'all_transactions'
};

export const storage = {
  getUserId: (): string => {
    let id = localStorage.getItem('ap_local_id');
    if (!id) {
      id = 'UID-' + Math.random().toString(36).substr(2, 6).toUpperCase();
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
      completedTasks: [], 
      createdTasks: [], 
      isLoggedIn: false 
    };
    return JSON.parse(data);
  },

  setUser: async (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    if (user.isLoggedIn) {
      await set(ref(db, `${KEYS.USERS}/${user.id}`), user);
    }
  },
  
  getTasks: (): Task[] => {
    const data = localStorage.getItem(KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },

  setTasks: (tasks: Task[]) => {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    set(ref(db, KEYS.TASKS), tasks);
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

  getReferralCount: async (userId: string): Promise<number> => {
    try {
      const usersRef = ref(db, KEYS.USERS);
      // Case-insensitive check: we store IDs as they are, usually uppercase
      const referralQuery = query(usersRef, orderByChild('referredBy'), equalTo(userId.toUpperCase()));
      const snapshot = await get(referralQuery);
      if (snapshot.exists()) {
        return Object.keys(snapshot.val()).length;
      }
    } catch (e) {
      console.error("Referral fetch error:", e);
    }
    return 0;
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
  }
};
