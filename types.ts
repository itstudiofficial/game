
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
  status: 'active' | 'completed' | 'pending';
}

export interface User {
  id: string;
  username: string;
  email: string;
  coins: number;
  completedTasks: string[];
  createdTasks: string[];
  isLoggedIn: boolean;
  lastSpinTimestamp?: number;
  dailySpinsCount?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'earn' | 'spend' | 'spin';
  method?: string;
  status: 'pending' | 'success' | 'failed';
  date: string;
}
