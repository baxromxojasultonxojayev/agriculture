import { create } from "zustand";
import { User, loadUsers, saveUsers } from "../services/storage";

type UsersState = {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
};

export const useUsersStore = create<UsersState>((set) => ({
  users: loadUsers(),
  addUser: (user) =>
    set((state) => {
      const users = [...state.users, user];
      saveUsers(users);
      return { users };
    }),
  updateUser: (user) =>
    set((state) => {
      const users = state.users.map((u) =>
        u.id === user.id ? user : u
      );
      saveUsers(users);
      return { users };
    }),
  deleteUser: (id) =>
    set((state) => {
      const users = state.users.filter((u) => u.id !== id);
      saveUsers(users);
      return { users };
    }),
}));
