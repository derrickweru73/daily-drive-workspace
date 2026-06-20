// auth.js

export const USER_ROLES = {
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee'
};

// Only Admin is hardcoded by default now
const DEFAULT_USERS = [
  { id: 'admin_root', username: 'admin', password: 'password123', name: 'Derrick Weru', role: USER_ROLES.MANAGER }
];

export class AuthManager {
  static getUsersDatabase() {
    const storedUsers = localStorage.getItem('dd_users_database');
    if (!storedUsers) {
      localStorage.setItem('dd_users_database', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(storedUsers);
  }

  static login(username, password) {
    const db = this.getUsersDatabase();
    
    // Clean up inputs by stripping spaces before matching
    const cleanUsername = username.trim().toLowerCase();

    const user = db.find(
      u => u.username.toLowerCase() === cleanUsername && u.password === password
    );

    if (!user) {
      throw new Error('Invalid username or password.');
    }

    const sessionData = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    };

    localStorage.setItem('dd_workspace_session', JSON.stringify(sessionData));
    return sessionData;
  }

  static register({ name, username, password, role = USER_ROLES.EMPLOYEE }) {
    const db = this.getUsersDatabase();
    
    if (!name.trim() || !username.trim() || !password.trim()) {
      throw new Error('All registration fields are required.');
    }

    const usernameExists = db.some(u => u.username.toLowerCase() === username.toLowerCase().trim());
    if (usernameExists) {
      throw new Error('Username is already taken.');
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      username: username.toLowerCase().trim(),
      password: password,
      role: role
    };

    const updatedDb = [...db, newUser];
    localStorage.setItem('dd_users_database', JSON.stringify(updatedDb));
    return newUser;
  }

  static logout() {
    localStorage.removeItem('dd_workspace_session');
  }

  static getCurrentUser() {
    const session = localStorage.getItem('dd_workspace_session');
    return session ? JSON.parse(session) : null;
  }

  static isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  static getAllEmployees() {
    return this.getUsersDatabase().filter(user => user.role === USER_ROLES.EMPLOYEE);
  }
}