import { Route, Router } from 'server';
import { addUser, modifyUser, removeUser } from './user.store';

@Router()
export class UserMutationsRouter {
  /**
   * ➕ Create a new user and store it in the in-memory table.
   *
   * @param param0 - 📥 Input object
   * @param param0.name - 🧑 Person name
   * @param param0.email - ✉️ Email address
   * @returns ✅ The created user.
   */
  @Route()
  createUser({ name, email }: { name: string; email: string }) {
    return addUser(name, email);
  }

  /**
   * ✏️ Update an existing user.
   *
   * @param param0 - 📥 Input object
   * @param param0.id - 🆔 User identifier
   * @param param0.name - 🧑 Optional new name
   * @param param0.email - ✉️ Optional new email
   * @returns 🔁 The updated user, or `null` if not found.
   */
  @Route()
  updateUser({ id, name, email }: { id: string; name?: string; email?: string }) {
    return modifyUser(id, { name, email });
  }

  /**
   * 🗑️ Delete a user by id.
   *
   * @param param0 - 📥 Input object
   * @param param0.id - 🆔 User identifier
   * @returns ⚖️ `true` if a user was deleted, otherwise `false`.
   */
  @Route()
  deleteUser({ id }: { id: string }) {
    return removeUser(id);
  }
}


