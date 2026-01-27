
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
  dueDate?: string; 
  createdAt?: string; // New property for creation timestamp
}

export interface User {
  id: string;
  username: string; // Used as Full Name
  lastName?: string;
  nickName?: string;
  email: string;
  city?: string;
  country?: string;
  coins: number;
  depositBalance: number; 
  completedTasks: string[];
  createdTasks: string[];
  claimedReferrals?: string[]; 
  isLoggedIn: boolean;
  isAdmin?: boolean;
  lastSpinTimestamp?: number;
  lastMathTimestamp?: number;
  dailySpinsCount?: number;
  status?: 'active' | 'banned';
  referredBy?: string;
  currentSessionId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  taskId?: string; 
  username?: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'earn' | 'spend' | 'spin' | 'referral_claim' | 'math_reward';
  method?: string;
  account?: string; 
  proofImage?: string; 
  proofImage2?: string; // Support for dual-verification
  status: 'pending' | 'success' | 'failed';
  date: string;
}

export interface SEOConfig {
  siteTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
}
