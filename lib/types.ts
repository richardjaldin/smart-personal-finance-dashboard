export type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseInput = {
  amount: number;
  category: string;
  date: string;
  description: string;
};

export const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Health",
  "Shopping",
  "Education",
  "Other",
] as const;
