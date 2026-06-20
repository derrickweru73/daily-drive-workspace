// script.js
import { AuthManager, USER_ROLES } from './auth.js';
import { WorkspaceManager } from './task.js';

document.addEventListener('DOMContentLoaded', () => {
  const workspace = new WorkspaceManager();
  
  const authScreen = document.getElementById('authScreen');
  const loginCard = document.getElementById('loginCard');
  const registerCard = document.getElementById('registerCard');
  const workspaceScreen = document.getElementById('workspaceScreen');
  
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const taskForm = document.getElementById('taskForm');
  const taskIdField = document.getElementById('taskIdField');
  const taskTitle = document.getElementById('taskTitle');
  const taskCategory = document.getElementById('taskCategory');
  const taskAssignment = document.getElementById('taskAssignment');
  
  const goToRegister = document.getElementById('goToRegister');
  const goToLogin = document.getElementById('goToLogin');
  
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
  
  const filterCategory = document.getElementById('filterCategory');
  const statusTabs = document.getElementById('statusTabs');
  
  let currentStatusFilter = 'All';
  let isEditingMode = false;

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
    }
  }

  function setupFormAvailability(user) {
    if (user.role === USER_ROLES.EMPLOYEE) {
      formCard.classList.add('hidden');
    } else {
      formCard.classList.remove('hidden');
      // Dropdown assigns directly using the username string
      taskAssignment.innerHTML = AuthManager.getAllEmployees().map(emp => 
        `<option value="${emp.username}">${emp.name}</option>`
      ).join('');
    }
  }

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
      setTimeout(() => {
        registerCard.classList.add('hidden');
        loginCard.classList.remove('hidden');
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

  filterCategory.addEventListener('change', () => render());
  
  statusTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentStatusFilter = e.target.dataset.status;
      render();
    }
  });

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

      // FIXED ELEMENT LAYOUT: Explicitly renders the assignee info label inline 
      li.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
          <div>
            <div class="task-text">${task.title}</div>
            <div class="task-meta">
              <span class="category-tag">${task.category}</span>
              <small class="assignee-lbl" style="color: #777; margin-left: 8px;">Assigned to: @${task.assignedTo}</small>
            </div>
          </div>
        </div>
        ${accessControlLinks}
      `;
      taskList.appendChild(li);
    });

    const score = workspace.calculateProgress(currentUser.username, currentUser.role === USER_ROLES.MANAGER);
    progressPercent.textContent = `${score}%`;
    progressBar.style.width = `${score}%`;
  }

  taskList.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains('task-checkbox')) {
      // FIXED ENGINE CALL: Safely triggers orchestrator data sync rather than raw object properties
      workspace.toggleTaskStatus(id);
      render();
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