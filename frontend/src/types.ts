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
