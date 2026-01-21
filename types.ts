
export type TaskType = 'YouTube' | 'Websites' | 'Apps' | 'Social Media';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  reward: number;
  description: string;
  creatorId: string;
  totalWorkers: number;
  completedCount: number;
  status: 'active' | 'completed' | 'pending' | 'rejected';
  link?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  coins: number;
  depositBalance: number; // For creating tasks
  completedTasks: string[];
  createdTasks: string[];
  claimedReferrals?: string[]; // IDs of users whose referral bonus has been claimed
  isLoggedIn: boolean;
  isAdmin?: boolean;
  lastSpinTimestamp?: number;
  dailySpinsCount?: number;
  status?: 'active' | 'banned';
  referredBy?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  username?: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'earn' | 'spend' | 'spin' | 'referral_claim';
  method?: string;
  status: 'pending' | 'success' | 'failed';
  date: string;
}
