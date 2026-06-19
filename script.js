// script.js
import { AuthManager, USER_ROLES } from './auth.js';
import { WorkspaceManager } from './task.js';

document.addEventListener('DOMContentLoaded', () => {
  const workspace = new WorkspaceManager();
  
  // App view layers
  const authScreen = document.getElementById('authScreen');
  const loginCard = document.getElementById('loginCard');
  const registerCard = document.getElementById('registerCard');
  const workspaceScreen = document.getElementById('workspaceScreen');
  
  // Forms & Inputs
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const taskForm = document.getElementById('taskForm');
  const taskIdField = document.getElementById('taskIdField');
  const taskTitle = document.getElementById('taskTitle');
  const taskCategory = document.getElementById('taskCategory');
  const taskAssignment = document.getElementById('taskAssignment');
  
  // Interface Toggles
  const goToRegister = document.getElementById('goToRegister');
  const goToLogin = document.getElementById('goToLogin');
  
  // Display nodes
  const authError = document.getElementById('authError');
  const registerError = document.getElementById('registerError');
  const registerSuccess = document.getElementById('registerSuccess');
  const titleError = document.getElementById('titleError');
  const userDisplay = document.getElementById('userDisplay');
  const roleDisplay = document.getElementById('roleDisplay');
  const progressPercent = document.getElementById('progressPercent');
  const progressBar = document.getElementById('progressBar');
  const taskList = document.getElementById('taskList');
  const formTitle = document.getElementById('formTitle');
  const submitTaskBtn = document.getElementById('submitTaskBtn');
  const formCard = document.getElementById('formCard');
  
  // Dynamic filter contexts
  const filterCategory = document.getElementById('filterCategory');
  const statusTabs = document.getElementById('statusTabs');
  
  let currentStatusFilter = 'All';
  let isEditingMode = false;

  // --- Layout Screen Transitions ---
  goToRegister.addEventListener('click', () => {
    loginCard.classList.add('hidden');
    registerCard.classList.remove('hidden');
    registerForm.reset();
    registerError.classList.add('hidden');
  });

  goToLogin.addEventListener('click', () => {
    registerCard.classList.add('hidden');
    loginCard.classList.remove('hidden');
    loginForm.reset();
    authError.classList.add('hidden');
  });

  // --- Core Routing States ---
  function initSession() {
    const user = AuthManager.getCurrentUser();
    if (user) {
      authScreen.classList.add('hidden');
      workspaceScreen.classList.remove('hidden');
      userDisplay.textContent = user.name;
      roleDisplay.textContent = user.role;
      
      setupFormAvailability(user);
      render();
    } else {
      authScreen.classList.remove('hidden');
      workspaceScreen.classList.add('hidden');
      loginCard.classList.remove('hidden');
      registerCard.classList.add('hidden');
    }
  }

  function setupFormAvailability(user) {
    if (user.role === USER_ROLES.EMPLOYEE) {
      formCard.classList.add('hidden');
    } else {
      formCard.classList.remove('hidden');
      taskAssignment.innerHTML = AuthManager.getAllEmployees().map(emp => 
        `<option value="${emp.id}">${emp.name}</option>`
      ).join('');
    }
  }

  // --- Auth & Account Creation Handlers ---
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    authError.classList.add('hidden');
    
    try {
      AuthManager.login(
        document.getElementById('username').value,
        document.getElementById('password').value
      );
      loginForm.reset();
      initSession();
    } catch (err) {
      authError.textContent = err.message;
      authError.classList.remove('hidden');
    }
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    registerError.classList.add('hidden');
    registerSuccess.classList.add('hidden');

    try {
      AuthManager.register({
        name: document.getElementById('regName').value,
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value,
        role: document.getElementById('regRole').value
      });

      registerSuccess.classList.remove('hidden');
      
      // Delays briefly so user notices the success status indicator
      setTimeout(() => {
        registerCard.classList.add('hidden');
        loginCard.classList.remove('hidden');
        loginForm.reset();
      }, 1000);

    } catch (err) {
      registerError.textContent = err.message;
      registerError.classList.remove('hidden');
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    AuthManager.logout();
    initSession();
  });

  // --- Form Task Mutation Processors ---
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    titleError.classList.add('hidden');

    const titleValue = taskTitle.value.trim();
    if (!titleValue) {
      titleError.classList.remove('hidden');
      return;
    }

    const taskPayload = {
      title: titleValue,
      category: taskCategory.value,
      assignedTo: taskAssignment.value
    };

    if (isEditingMode) {
      workspace.updateTask(taskIdField.value, taskPayload);
      exitEditingState();
    } else {
      workspace.addTask(taskPayload);
    }

    taskForm.reset();
    render();
  });

  function exitEditingState() {
    isEditingMode = false;
    formTitle.textContent = 'Create New Task';
    submitTaskBtn.textContent = 'Add Task';
    taskIdField.value = '';
  }

  // --- Filters Listeners ---
  filterCategory.addEventListener('change', () => render());
  
  statusTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentStatusFilter = e.target.dataset.status;
      render();
    }
  });

  // --- View Rendering Logic Engine ---
  function render() {
    const currentUser = AuthManager.getCurrentUser();
    if (!currentUser) return;

    const renderingStack = workspace.filterAndSortTasks({
      user: currentUser,
      category: filterCategory.value,
      status: currentStatusFilter
    });

    taskList.innerHTML = '';

    renderingStack.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      
      const accessControlLinks = currentUser.role === USER_ROLES.MANAGER 
        ? `<div class="task-actions">
            <span class="action-edit" data-id="${task.id}">Edit</span>
            <span class="action-delete" data-id="${task.id}">Delete</span>
           </div>`
        : '';

      li.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
          <div>
            <div class="task-text">${task.title}</div>
            <div class="task-meta">
              <span class="category-tag">${task.category}</span>
            </div>
          </div>
        </div>
        ${accessControlLinks}
      `;
      taskList.appendChild(li);
    });

    const score = workspace.calculateProgress(currentUser.id, currentUser.role === USER_ROLES.MANAGER);
    progressPercent.textContent = `${score}%`;
    progressBar.style.width = `${score}%`;
  }

  // --- Task Operations Routing Element ---
  taskList.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains('task-checkbox')) {
      const selectedTask = workspace.tasks.find(t => t.id === id);
      if (selectedTask) {
        selectedTask.toggleStatus();
        workspace.saveToStorage();
        render();
      }
    } else if (e.target.classList.contains('action-delete')) {
      workspace.deleteTask(id);
      if (isEditingMode && taskIdField.value === id) exitEditingState();
      render();
    } else if (e.target.classList.contains('action-edit')) {
      const targetTask = workspace.tasks.find(t => t.id === id);
      if (targetTask) {
        isEditingMode = true;
        formTitle.textContent = 'Modify Workspace Task';
        submitTaskBtn.textContent = 'Update Task';
        taskIdField.value = targetTask.id;
        taskTitle.value = targetTask.title;
        taskCategory.value = targetTask.category;
        taskAssignment.value = targetTask.assignedTo;
        taskTitle.focus();
      }
    }
  });

  initSession();
});