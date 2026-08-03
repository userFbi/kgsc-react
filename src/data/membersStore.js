const STORAGE_KEY = "kgsc_members";

const seedMembers = [
  {
    id: "KGSC-001",
    name: "Rakesh Patel",
    phone: "9825012345",
    aadhar: "234567890123",
    tshirtSize: "L",
    shortsSize: "L",
    address: "12, Shreeji Nagar-2, Surat",
    joined: "2019-06-12",
  },
  {
    id: "KGSC-002",
    name: "Meera Solanki",
    phone: "9898745210",
    aadhar: "345678901234",
    tshirtSize: "M",
    shortsSize: "S",
    address: "4, Ramji Mandir Road, Godadara, Surat",
    joined: "2021-02-03",
  },
  {
    id: "KGSC-003",
    name: "Jignesh Vaghela",
    phone: "9723456780",
    aadhar: "456789012345",
    tshirtSize: "XL",
    shortsSize: "L",
    address: "27, Kamlaba Society, Surat",
    joined: "2022-11-21",
  },
  {
    id: "KGSC-004",
    name: "Priya Chauhan",
    phone: "9909988776",
    aadhar: "567890123456",
    tshirtSize: "S",
    shortsSize: "S",
    address: "9, Nani Naher, Surat",
    joined: "2024-01-15",
  },
];

export function loadMembers() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read members from storage:", err);
  }
  saveMembers(seedMembers);
  return seedMembers;
}

export function saveMembers(members) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error("Failed to save members to storage:", err);
  }
}

export function addMemberRecord(member) {
  const members = loadMembers();
  const next = [member, ...members];
  saveMembers(next);
  return next;
}

export function deleteMemberRecord(id) {
  const next = loadMembers().filter((m) => m.id !== id);
  saveMembers(next);
  return next;
}

export function updateMemberRecord(id, updates) {
  const members = loadMembers().map((m) => (m.id === id ? { ...m, ...updates } : m));
  saveMembers(members);
  return members;
}

export function nextMemberId(members) {
  const nums = members
    .map((m) => parseInt(String(m.id).replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `KGSC-${String(max + 1).padStart(3, "0")}`;
}
