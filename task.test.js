// task.test.js
import { WorkspaceManager, Task } from './task.js';

// Mock browser LocalStorage API environment for terminal processing inside Jest context execution environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Daily Drive Workspace Task Engine Validation Test Suite', () => {
  let workspace;
  const managerUser = { id: 'u1', name: 'Derrick', role: 'Manager' };
  const employeeUser = { id: 'u2', name: 'John Doe', role: 'Employee' };

  beforeEach(() => {
    localStorage.clear();
    workspace = new WorkspaceManager();
  });

  test('Should accurately initialize basic values inside a newly spawned task class structural instance model', () => {
    const task = new Task({ title: 'Audit Accounts', category: 'Finance', assignedTo: 'u2' });
    expect(task.title).toBe('Audit Accounts');
    expect(task.completed).toBe(false);
    expect(task.category).toBe('Finance');
  });

  test('Should append target tasks to local tracker collections tracking specific enterprise parameters', () => {
    const task = workspace.addTask({ title: 'Deploy Sandbox Server', category: 'Work', assignedTo: 'u2' });
    expect(workspace.tasks.length).toBe(1);
    expect(workspace.tasks[0].id).toBe(task.id);
  });

  test('Should drop out target items efficiently during absolute execution of deletion filters', () => {
    const task = workspace.addTask({ title: 'Review Code Base', category: 'Study', assignedTo: 'u3' });
    workspace.deleteTask(task.id);
    expect(workspace.tasks.length).toBe(0);
  });

  test('Should run status value mutation updates upon toggle triggers execution workflows', () => {
    const task = workspace.addTask({ title: 'Fix CSS Bug UI Layer', category: 'Work', assignedTo: 'u2' });
    expect(task.completed).toBe(false);
    task.toggleStatus();
    expect(task.completed).toBe(true);
  });

  test('Should calculate isolated productivity scores accurately based on functional reduction pipelines', () => {
    workspace.addTask({ title: 'Task 1', category: 'Work', assignedTo: 'u2', completed: true });
    workspace.addTask({ title: 'Task 2', category: 'Work', assignedTo: 'u2', completed: false });
    // An external assignment from another employee should not skew employee 'u2's progress score
    workspace.addTask({ title: 'Task 3', category: 'Personal', assignedTo: 'u3', completed: true });

    const scoreEmployee = workspace.calculateProgress('u2', false);
    expect(scoreEmployee).toBe(50); // 1 completed out of 2 assigned

    const scoreManager = workspace.calculateProgress('u1', true);
    expect(scoreManager).toBe(67); // 2 total completed out of 3 total items system-wide
  });

  test('Should filter workspace elements using exact criteria metrics matching user permissions models', () => {
    workspace.addTask({ title: 'Work Alpha', category: 'Work', assignedTo: 'u2' });
    workspace.addTask({ title: 'Study Beta', category: 'Study', assignedTo: 'u2' });
    
    const results = workspace.filterAndSortTasks({
      user: employeeUser,
      category: 'Study',
      status: 'All'
    });
    
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Study Beta');
  });

  test('Should reject task additions containing empty tracking descriptors throw standard input exception error frameworks', () => {
    expect(() => {
      workspace.addTask({ title: '   ', category: 'Personal', assignedTo: 'u2' });
    }).toThrow('Task title is required.');
  });
});