export interface Summary {
  totalOrders: number;
  totalRevenue: number;
  unpaidAmount: number;
  repeatCustomers: number;
}

export interface DebtOrder {
  date: string;
  slot: string;
  order: string;
  amount: number;
}

export interface DebtCustomer {
  name: string;
  totalOwed: number;
  orders: DebtOrder[];
}

export interface HistoryEntry {
  date: string;
  order: string;
  amount: number;
  paid: boolean;
}

export interface Customer {
  name: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
  history: HistoryEntry[];
}

export interface Metrics {
  todayRevenue: number;
  todayOrders: number;
  todayTarget: number;
  weekRevenue: number;
  weekPrev: number;
  outstanding: number;
  outstandingCount: number;
  avgOrder: number;
}

export interface ActivityItem {
  id: number;
  t: string;
  who: string;
  what: string;
  amount: number;
  paid: boolean;
  slot: string;
  kind?: 'payment';
}

export interface OpenOrder {
  id: number;
  who: string;
  order: string;
  amount: number;
  age: string;
  slot: string;
}

export interface DashboardData {
  today: string;
  metrics: Metrics;
  rev14: number[];
  chartLabels: string[];
  activity: ActivityItem[];
  openOrders: OpenOrder[];
}
