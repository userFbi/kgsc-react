const STORAGE_KEY = "kgsc_transactions";

export const CATEGORIES = ["Matki", "Lezim", "Donation", "Other"];

const seedTransactions = [
  {
    id: "TXN-001",
    type: "income",
    amount: 15000,
    date: "2026-07-02",
    category: "Matki",
    description: "Matki booking collections — July batch",
    createdAt: "2026-07-02T10:15:00.000Z",
  },
  {
    id: "TXN-002",
    type: "income",
    amount: 8000,
    date: "2026-07-10",
    category: "Donation",
    description: "Donation from Patel family",
    createdAt: "2026-07-10T14:30:00.000Z",
  },
  {
    id: "TXN-003",
    type: "expense",
    amount: 4200,
    date: "2026-07-14",
    category: "Other",
    description: "Grounds maintenance and equipment repair",
    createdAt: "2026-07-14T09:00:00.000Z",
  },
  {
    id: "TXN-004",
    type: "income",
    amount: 6000,
    date: "2026-07-20",
    category: "Lezim",
    description: "Lezim group registration fees",
    createdAt: "2026-07-20T16:45:00.000Z",
  },
  {
    id: "TXN-005",
    type: "expense",
    amount: 2100,
    date: "2026-06-28",
    category: "Other",
    description: "Cleaning supplies for the clubhouse",
    createdAt: "2026-06-28T11:00:00.000Z",
  },
  {
    id: "TXN-006",
    type: "income",
    amount: 12000,
    date: "2026-06-18",
    category: "Matki",
    description: "Matki booking collections — June batch",
    createdAt: "2026-06-18T10:00:00.000Z",
  },
  {
    id: "TXN-007",
    type: "expense",
    amount: 3500,
    date: "2026-06-10",
    category: "Other",
    description: "Electricity bill",
    createdAt: "2026-06-10T09:30:00.000Z",
  },
  {
    id: "TXN-008",
    type: "income",
    amount: 5000,
    date: "2026-06-05",
    category: "Donation",
    description: "Donation from Shah trust",
    createdAt: "2026-06-05T12:00:00.000Z",
  },
  {
    id: "TXN-009",
    type: "expense",
    amount: 1800,
    date: "2026-05-22",
    category: "Other",
    description: "Sports equipment repair",
    createdAt: "2026-05-22T15:20:00.000Z",
  },
  {
    id: "TXN-010",
    type: "income",
    amount: 7200,
    date: "2026-05-15",
    category: "Lezim",
    description: "Lezim group registration fees",
    createdAt: "2026-05-15T13:40:00.000Z",
  },
];

export function loadTransactions() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read transactions from storage:", err);
  }
  saveTransactions(seedTransactions);
  return seedTransactions;
}

export function saveTransactions(transactions) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error("Failed to save transactions to storage:", err);
  }
}

export function addTransactionRecord(transaction) {
  const transactions = loadTransactions();
  const next = [transaction, ...transactions];
  saveTransactions(next);
  return next;
}

export function deleteTransactionRecord(id) {
  const next = loadTransactions().filter((t) => t.id !== id);
  saveTransactions(next);
  return next;
}

export function nextTransactionId(transactions) {
  const nums = transactions
    .map((t) => parseInt(String(t.id).replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `TXN-${String(max + 1).padStart(3, "0")}`;
}
