// task.js

export class Task {
  constructor({ id = null, title, category, assignedTo, completed = false }) {
    this.id = id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.title = title;
    this.category = category; 
    this.assignedTo = assignedTo; // Links explicitly to the employee's username string
    this.completed = completed;
  }

  toggleStatus() {
    this.completed = !this.completed;
  }

  update(updatedFields) {
    const { title, category, assignedTo } = updatedFields;
    if (title) this.title = title;
    if (category) this.category = category;
    if (assignedTo) this.assignedTo = assignedTo;
  }
}

export class WorkspaceManager {
  constructor() {
    this.tasks = [];
    this.loadFromStorage();
  }

  addTask(taskData) {
    if (!taskData.title || taskData.title.trim() === '') {
      throw new Error('Task title is required.');
    }
    const newTask = new Task(taskData);
    this.tasks = [...this.tasks, newTask];
    this.saveToStorage();
    return newTask;
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveToStorage();
  }

  updateTask(taskId, updatedFields) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.update(updatedFields);
      this.saveToStorage();
    }
    return task;
  }

  // FIXED LINE: Encapsulates state updates and forces data storage persistence 
  toggleTaskStatus(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.toggleStatus();
      this.saveToStorage();
    }
    return task;
  }

  getTasksForUser(user) {
    if (user.role === 'Manager') {
      return this.tasks;
    }
    // Isolates tasks strictly matching the logged-in employee's username
    return this.tasks.filter(task => 
      task.assignedTo && task.assignedTo.toLowerCase() === user.username.toLowerCase()
    );
  }

  calculateProgress(username = null, isManager = false) {
    const targetTasks = isManager 
      ? this.tasks 
      : this.tasks.filter(t => t.assignedTo && t.assignedTo.toLowerCase() === username.toLowerCase());

    if (targetTasks.length === 0) return 0;

    const completedCount = targetTasks.reduce((acc, current) => {
      return current.completed ? acc + 1 : acc;
    }, 0);

    return Math.round((completedCount / targetTasks.length) * 100);
  }

  filterAndSortTasks({ user, category, status }) {
    let filtered = this.getTasksForUser(user);

    if (category && category !== 'All') {
      filtered = filtered.filter(t => t.category === category);
    }

    if (status === 'Pending') {
      filtered = filtered.filter(t => !t.completed);
    } else if (status === 'Completed') {
      filtered = filtered.filter(t => t.completed);
    }

    return [...filtered].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  }

  saveToStorage() {
    localStorage.setItem('dd_tasks', JSON.stringify(this.tasks));
  }

  loadFromStorage() {
    const stored = localStorage.getItem('dd_tasks');
    if (stored) {
      const parsed = JSON.parse(stored);
      this.tasks = parsed.map(t => new Task(t));
    }
  }
}