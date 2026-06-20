// task.test.js
import { AuthManager, USER_ROLES } from './auth.js';
import { WorkspaceManager, Task } from './task.js';

describe('Daily Drive Workspace - Comprehensive System Tests', () => {
  let workspace;

  // Mocking the browser's localStorage environment so tests can run safely in isolation
  beforeEach(() => {
    let store = {};
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; }
    };

    // Instantiate a fresh manager instance before every individual test run
    workspace = new WorkspaceManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- UNIT 1: AUTHENTICATION & ACCESS SAFETY TESTS ---
  describe('Authentication & Access Control', () => {
    test('Should safely register and hash a new Employee profile into the database array', () => {
      const newUser = AuthManager.register({
        name: 'Alice Smith',
        username: 'alice_dev',
        password: 'securePassword123',
        role: USER_ROLES.EMPLOYEE
      });

      expect(newUser).toBeDefined();
      expect(newUser.username).toBe('alice_dev');
      expect(newUser.role).toBe('Employee');
      
      const employees = AuthManager.getAllEmployees();
      expect(employees.some(e => e.username === 'alice_dev')).toBe(true);
    });

    test('Should throw an explicit runtime validation error if registration fields are empty strings', () => {
      expect(() => {
        AuthManager.register({ name: ' ', username: 'bad_user', password: '123' });
      }).toThrow('All registration fields are required.');
    });
  });

  // --- UNIT 2: DATA SEGREGATION & EMPLOYEE VISIBILITY TESTS ---
  describe('Workspace Isolation & Visibility Security Matrix', () => {
    test('Should enforce absolute privacy: Employees must never see tasks assigned to other colleagues', () => {
      const managerUser = { username: 'admin', role: USER_ROLES.MANAGER };
      const employeeAlice = { username: 'alice_dev', role: USER_ROLES.EMPLOYEE };
      const employeeBob = { username: 'bob_designer', role: USER_ROLES.EMPLOYEE };

      // Manager creates distinct tasks assigned to separate people
      workspace.addTask({ title: 'Fix API Authentication Bug', category: 'Work', assignedTo: 'alice_dev' });
      workspace.addTask({ title: 'Deploy Container Infrastructure', category: 'Work', assignedTo: 'alice_dev' });
      workspace.addTask({ title: 'Create Figma High-Fi Prototypes', category: 'Work', assignedTo: 'bob_designer' });

      // Verification A: The Manager dashboard must see all 3 tasks globally
      const managerView = workspace.getTasksForUser(managerUser);
      expect(managerView.length).toBe(3);

      // Verification B: Alice must see only her 2 backend development items
      const aliceView = workspace.getTasksForUser(employeeAlice);
      expect(aliceView.length).toBe(2);
      expect(aliceView.every(t => t.assignedTo === 'alice_dev')).toBe(true);

      // Verification C: Bob must see only his 1 layout design item
      const bobView = workspace.getTasksForUser(employeeBob);
      expect(bobView.length).toBe(1);
      expect(bobView[0].title).toBe('Create Figma High-Fi Prototypes');
    });
  });

  // --- UNIT 3: BUSINESS LOGIC METRICS TESTS ---
  describe('Performance Tracking & Metrics Scoring Engine', () => {
    test('Should accurately calculate progress percentage scores based on data metrics', () => {
      const username = 'alice_dev';

      // Injecting localized context: Add 4 tasks for Alice
      const t1 = workspace.addTask({ title: 'Task 1', category: 'Work', assignedTo: username });
      const t2 = workspace.addTask({ title: 'Task 2', category: 'Study', assignedTo: username });
      const t3 = workspace.addTask({ title: 'Task 3', category: 'Finance', assignedTo: username });
      workspace.addTask({ title: 'Task 4', category: 'Health', assignedTo: username });

      // Complete exactly 3 out of 4 tasks (75% completion target)
      workspace.toggleTaskStatus(t1.id);
      workspace.toggleTaskStatus(t2.id);
      workspace.toggleTaskStatus(t3.id);

      const calculatedScore = workspace.calculateProgress(username, false);
      
      // The score engine output must match exactly 75%
      expect(calculatedScore).toBe(75);
    });

    test('Should return exactly 0% completion if an active workspace currently holds zero assigned tasks', () => {
      const emptyScore = workspace.calculateProgress('ghost_user', false);
      expect(emptyScore).toBe(0);
    });
  });
});