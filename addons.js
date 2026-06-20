// addons.js
import { AuthManager } from './auth.js';

let isDarkModeInjected = false;
let isCalendarInjected = false;

function executeSafeAddonsEngine() {
  const appWorkspace = document.getElementById('workspaceScreen');
  
  if (!appWorkspace || appWorkspace.classList.contains('hidden')) {
    isDarkModeInjected = false;
    isCalendarInjected = false;
    return;
  }

  // ==========================================
  // MODULE 1: DARK MODE ENGINE (Text Colors Names)
  // ==========================================
  if (!isDarkModeInjected) {
    const navbar = document.querySelector('.header-bar');
    if (navbar) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'darkModeToggleBtn';
      toggleBtn.textContent = '🌙 Dark Mode';
      toggleBtn.style.cssText = `
        background: #34495e; color: #fff; border: none; padding: 8px 12px; 
        border-radius: 4px; font-weight: bold; cursor: pointer; margin-left: 15px;
        font-size: 13px; transition: all 0.2s ease; font-family: Arial, sans-serif;
      `;

      if (!document.getElementById('darkModeStyles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'darkModeStyles';
        styleSheet.textContent = `
          body.dark-theme { background-color: black !important; color: lightgray !important; }
          body.dark-theme .card, body.dark-theme .auth-card, body.dark-theme .header-bar, body.dark-theme .progress-container { 
            background-color: rgb(30, 30, 30) !important; color: white !important; border: 1px solid rgb(50, 50, 50) !important; box-shadow: 0 4px 6px rgba(0,0,0,0.3) !important;
          }
          body.dark-theme h1, body.dark-theme h2, body.dark-theme h3, body.dark-theme .header-bar h1, body.dark-theme .card h3, body.dark-theme .header-bar div p, body.dark-theme .header-bar div p span, body.dark-theme #userDisplay, body.dark-theme #roleDisplay { color: white !important; }
          body.dark-theme .form-control, body.dark-theme select, body.dark-theme input { background-color: dimgray !important; color: white !important; border: 1px solid gray !important; }
          body.dark-theme label, body.dark-theme .form-group label { color: lightgray !important; }
          body.dark-theme #calendarDisplayGrid { background-color: dimgray !important; color: white !important; }
          body.dark-theme p, body.dark-theme .progress-label span, body.dark-theme #addonCalendarCard p, body.dark-theme .progress-label { color: lightgray !important; }
          body.dark-theme .progress-track { background-color: dimgray !important; }
          body.dark-theme .task-item, body.dark-theme li { background-color: rgb(40, 40, 40) !important; color: white !important; border: 1px solid gray !important; }
          body.dark-theme .tab-btn:not(.active) { background-color: dimgray !important; color: lightgray !important; }
        `;
        document.head.appendChild(styleSheet);
      }

      navbar.appendChild(toggleBtn);
      isDarkModeInjected = true; 

      toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        toggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        toggleBtn.style.background = isDark ? '#f1c40f' : '#34495e';
        toggleBtn.style.color = isDark ? '#333' : '#fff';
        localStorage.setItem('dd_dark_mode_preference', isDark ? 'enabled' : 'disabled');
      });

      if (localStorage.getItem('dd_dark_mode_preference') === 'enabled') {
        toggleBtn.click();
      }
    }
  }

  // ==========================================
  // MODULE 2: DUE DATE & CALENDAR INJECTION (Click Pre-Intercept Fix)
  // ==========================================
  if (!isCalendarInjected) {
    const taskForm = document.getElementById('taskForm');
    const formCard = document.getElementById('formCard');

    if (taskForm && formCard) {
      const submitBtn = document.getElementById('submitTaskBtn');
      const dateGroup = document.createElement('div');
      dateGroup.id = 'addonDueDateGroup';
      dateGroup.className = 'form-group';
      dateGroup.style.marginTop = '15px';
      dateGroup.innerHTML = `
        <label for="taskDueDate" style="font-weight: bold; display: block; margin-bottom: 5px;">Set Completion Due Date</label>
        <input type="date" id="taskDueDate" class="form-control" style="width: 100%; padding: 8px; box-sizing: border-box;">
      `;
      taskForm.insertBefore(dateGroup, submitBtn);

      const calendarCard = document.createElement('div');
      calendarCard.className = 'card';
      calendarCard.id = 'addonCalendarCard';
      calendarCard.style.marginTop = '20px';
      calendarCard.innerHTML = `
        <h3 style="margin-top: 0;">📅 Schedule & Deadlines Calendar</h3>
        <p style="color: #777; font-size: 13px; margin-bottom: 15px;">Monitor upcoming work assignments timeline.</p>
        <div id="calendarDisplayGrid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; background: #eee; padding: 10px; border-radius: 6px; text-align: center; font-size: 12px; font-family: sans-serif; color: #333;">
        </div>
      `;
      formCard.parentNode.insertBefore(calendarCard, formCard.nextSibling);

      // TIMING FIX: Capture the date right when the click happens BEFORE script.js resets the form fields
      submitBtn.addEventListener('click', () => {
        const dateInput = document.getElementById('taskDueDate');
        if (dateInput && dateInput.value) {
          const tempDatesStore = JSON.parse(localStorage.getItem('dd_task_due_dates_map')) || {};
          tempDatesStore['latest_added_date'] = dateInput.value;
          localStorage.setItem('dd_task_due_dates_map', JSON.stringify(tempDatesStore));
        }
      });

      isCalendarInjected = true; 
    }
  }

  // ==========================================
  // MODULE 3: BALANCED DOM INJECTION STRATEGY
  // ==========================================
  const tempDatesStore = JSON.parse(localStorage.getItem('dd_task_due_dates_map')) || {};
  const rawTasks = JSON.parse(localStorage.getItem('dd_tasks')) || [];
  
  if (tempDatesStore['latest_added_date'] && rawTasks.length > 0) {
    const latestTask = rawTasks[rawTasks.length - 1];
    if (!tempDatesStore[latestTask.id]) {
      tempDatesStore[latestTask.id] = tempDatesStore['latest_added_date'];
      delete tempDatesStore['latest_added_date'];
      localStorage.setItem('dd_task_due_dates_map', JSON.stringify(tempDatesStore));
      const inputField = document.getElementById('taskDueDate');
      if (inputField) inputField.value = '';
    }
  }

  // Directly check list items on screen and overlay the date text
  const currentItemsOnScreen = document.querySelectorAll('#taskList li');
  currentItemsOnScreen.forEach(item => {
    const checkbox = item.querySelector('.task-checkbox');
    if (!checkbox) return;
    
    const taskId = checkbox.dataset.id;
    
    if (tempDatesStore[taskId] && !item.querySelector('.addon-date-lbl')) {
      const targetAppendArea = item.querySelector('.task-meta') || item.querySelector('.task-text') || item;
      
      if (targetAppendArea) {
        const dateLabel = document.createElement('span');
        dateLabel.className = 'addon-date-lbl';
        dateLabel.textContent = `⏰ Due: ${tempDatesStore[taskId]}`;
        dateLabel.style.cssText = `
          font-size: 11px; 
          background-color: red !important; 
          color: white !important; 
          padding: 2px 6px; 
          border-radius: 4px; 
          margin-left: 8px; 
          font-weight: bold; 
          display: inline-block;
          vertical-align: middle;
        `;
        targetAppendArea.appendChild(dateLabel);
      }
    }
  });

  drawCalendarGrid(tempDatesStore, rawTasks);
}

function drawCalendarGrid(dateMap, taskList) {
  const grid = document.getElementById('calendarDisplayGrid');
  if (!grid) return;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let gridHTML = daysOfWeek.map(d => `<div style="font-weight:bold; padding: 5px; color:#555;">${d}</div>`).join('');
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDayIndex; i++) {
    gridHTML += `<div style="background:transparent; padding:8px;"></div>`;
  }

  const currentUser = AuthManager.getCurrentUser();
  if (!currentUser) return;

  for (let day = 1; day <= totalDays; day++) {
    const dayString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let dayHasTask = false;

    taskList.forEach(t => {
      if (dateMap[t.id] === dayString) {
        if (currentUser.role === 'Manager' || String(t.assignedTo).toLowerCase() === String(currentUser.username).toLowerCase()) {
          dayHasTask = true;
        }
      }
    });

    const cellBg = dayHasTask ? 'red' : 'white';
    const cellColor = dayHasTask ? 'white' : '#333';
    const isToday = day === today.getDate() ? 'border: 2px solid #2c3e50;' : '';

    gridHTML += `
      <div style="background: ${cellBg}; color: ${cellColor}; padding: 8px; border-radius: 4px; font-weight: bold; ${isToday}">
        ${day}
      </div>
    `;
  }

  grid.innerHTML = gridHTML;
}

setInterval(executeSafeAddonsEngine, 500);