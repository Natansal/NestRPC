import { Route, Router } from 'server';
import { fetchAllUsers, fetchUser } from './user.store';

@Router()
export class UserQueriesRouter {
  /**
   * 🔎 Get a single user by id.
   *
   * @param param0 - 📥 Input object
   * @param param0.id - 🆔 User identifier
   * @returns 👤 The user if found, otherwise `null`.
   */
  @Route()
  getUser({ id }: { id: string }) {
    return fetchUser(id);
  }

  /**
   * 📃 List all users in the in-memory table.
   *
   * @returns 📚 Array of users.
   */
  @Route()
  listUsers() {
    return fetchAllUsers();
  }
}


