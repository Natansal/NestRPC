export type User = {
  id: string;
  name: string;
  email: string;
};

const users = new Map<string, User>();
let nextId = 1;

// Seed demo data
(() => {
  const u1: User = {
    id: String(nextId++),
    name: 'John Doe',
    email: 'john.doe@example.com',
  };
  const u2: User = {
    id: String(nextId++),
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
  };
  users.set(u1.id, u1);
  users.set(u2.id, u2);
})();

/**
 * 🔎 Get a single user by id from the in-memory store.
 *
 * @param id - 🆔 User identifier
 * @returns 👤 The user if found, otherwise `null`.
 */
export function fetchUser(id: string): User | null {
  return users.get(id) ?? null;
}

/**
 * 📃 List all users from the in-memory store.
 *
 * @returns 📚 Array of users.
 */
export function fetchAllUsers(): User[] {
  return Array.from(users.values());
}

/**
 * ➕ Create a new user and store it in the in-memory table.
 *
 * @param name - 🧑 Person name
 * @param email - ✉️ Email address
 * @returns ✅ The created user.
 */
export function addUser(name: string, email: string): User {
  const id = String(nextId++);
  const user: User = { id, name, email };
  users.set(id, user);
  return user;
}

/**
 * ✏️ Update an existing user in the in-memory table.
 *
 * @param id - 🆔 User identifier
 * @param input - 📨 Partial user fields to update
 * @param input.name - 🧑 Optional new name
 * @param input.email - ✉️ Optional new email
 * @returns 🔁 The updated user, or `null` if not found.
 */
export function modifyUser(
  id: string,
  input: { name?: string; email?: string },
): User | null {
  const existing = users.get(id);
  if (!existing) return null;
  if (typeof input.name !== 'undefined') existing.name = input.name;
  if (typeof input.email !== 'undefined') existing.email = input.email;
  users.set(id, existing);
  return existing;
}

/**
 * 🗑️ Delete a user from the in-memory table.
 *
 * @param id - 🆔 User identifier
 * @returns ⚖️ `true` if a user was deleted, otherwise `false`.
 */
export function removeUser(id: string): boolean {
  return users.delete(id);
}
