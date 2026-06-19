// auth.js

export const USER_ROLES = {
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee'
};

// Hardcoded users for local enterprise simulation
const USERS_DATABASE = [
  { id: 'u1', username: 'admin', password: 'password123', name: 'Derrick Weru', role: USER_ROLES.MANAGER },
  { id: 'u2', username: 'john_dev', password: 'password123', name: 'John Doe', role: USER_ROLES.EMPLOYEE },
  { id: 'u3', username: 'jane_ux', password: 'password123', name: 'Jane Smith', role: USER_ROLES.EMPLOYEE }
];

export class AuthManager {
  static login(username, password) {
    const user = USERS_DATABASE.find(
      u => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password
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
    return USERS_DATABASE.filter(user => user.role === USER_ROLES.EMPLOYEE);
  }
}