const KEY = 'app_users';

export type Gender = 'male' | 'female';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  gender: Gender;
  createdAt: string;
};

export function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(KEY, JSON.stringify(users));
}
