//task.js
//task.js
export class Task {
  constructor({ id = null, title, category, assignedTo, dueDate, completed = false, completedAt = null }) {
    // FIX: Backticks wrapped around the entire string template here
    this.id = id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.title = title;
    this.category = category;
    this.assignedTo = assignedTo;
    // FIX: Clean split layout index definition array
    this.dueDate = dueDate || new Date().toISOString().split('T')[0];
    this.completed = completed;
    this.completedAt = completedAt;
  }

  toggleStatus() {
    this.completed = !this.completed;
    this.completedAt = this.completed ? Date.now() : null;
  }

  update(updatedFields) {
    const { title, category, assignedTo, dueDate } = updatedFields;
    if (title) this.title = title;
    if (category) this.category = category;
    if (assignedTo) this.assignedTo = assignedTo;
    if (dueDate) this.dueDate = dueDate;
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

  getTasksForUser(user) {
    if (user.role === 'Manager') {
      return this.tasks;
    }
    return this.tasks.filter(task => 
      task.assignedTo === user.id || 
      (task.assignedTo && task.assignedTo.toLowerCase() === user.username.toLowerCase())
    );
  }

  calculateProgress(userId = null, isManager = false) {
    const targetTasks = isManager 
      ? this.tasks 
      : this.tasks.filter(t => t.assignedTo === userId || (t.assignedTo && t.assignedTo.toLowerCase() === userId.toLowerCase()));

    if (targetTasks.length === 0) return 0;

    const completedCount = targetTasks.reduce((acc, current) => {
      return current.completed ? acc + 1 : acc;
    }, 0);

    return Math.round((completedCount / targetTasks.length) * 100);
  }

  // CORE CALCULATION: Compiles task counts per day for graph layout
  getWeeklyHistoricalData(userId = null, isManager = false) {
    const targetTasks = isManager 
      ? this.tasks 
      : this.tasks.filter(t => t.assignedTo === userId || (t.assignedTo && t.assignedTo.toLowerCase() === userId.toLowerCase()));

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const distribution = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    targetTasks.forEach(task => {
      if (task.completed && task.completedAt) {
        const dayName = weekDays[new Date(task.completedAt).getDay()];
        if (distribution[dayName] !== undefined) {
          distribution[dayName]++;
        }
      }
    });

    return distribution;
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

    // Sort: Uncompleted calendar goals go to the top, sorted by nearest expiration timeline
    return [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
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