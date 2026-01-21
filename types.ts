
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
  depositBalance: number; 
  completedTasks: string[];
  createdTasks: string[];
  claimedReferrals?: string[]; 
  isLoggedIn: boolean;
  isAdmin?: boolean;
  lastSpinTimestamp?: number;
  dailySpinsCount?: number;
  status?: 'active' | 'banned';
  referredBy?: string;
  currentSessionId?: string; // New field for single session enforcement
}

export interface Transaction {
  id: string;
  userId: string;
  username?: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'earn' | 'spend' | 'spin' | 'referral_claim';
  method?: string;
  account?: string; 
  proofImage?: string; 
  status: 'pending' | 'success' | 'failed';
  date: string;
}

export interface SEOConfig {
  siteTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
}
