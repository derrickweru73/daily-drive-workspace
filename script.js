// script.js
import { AuthManager, USER_ROLES } from './auth.js';
import { WorkspaceManager } from './task.js';

document.addEventListener('DOMContentLoaded', () => {
  const workspace = new WorkspaceManager();
   
  //major layout containers
  const authScreen = document.getElementById('authScreen');
  const loginCard = document.getElementById('loginCard');
  const registerCard = document.getElementById('registerCard');
  const workspaceScreen = document.getElementById('workspaceScreen');
  
  //forms & input field 
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const taskForm = document.getElementById('taskForm');
  const taskIdField = document.getElementById('taskIdField');
  const taskTitle = document.getElementById('taskTitle');
  const taskCategory = document.getElementById('taskCategory');

  // navigation links
  const taskAssignment = document.getElementById('taskAssignment');
  
  const goToRegister = document.getElementById('goToRegister');

  //cathing text areas meant for showing erros
  const goToLogin = document.getElementById('goToLogin');
  
  const authError = document.getElementById('authError');//get login error
  const registerError = document.getElementById('registerError');
  const registerSuccess = document.getElementById('registerSuccess');
  const titleError = document.getElementById('titleError');
  const userDisplay = document.getElementById('userDisplay');//get user profile element
  const roleDisplay = document.getElementById('roleDisplay');
  const progressPercent = document.getElementById('progressPercent');
  const progressBar = document.getElementById('progressBar');
  const taskList = document.getElementById('taskList');
  const formTitle = document.getElementById('formTitle');
  const submitTaskBtn = document.getElementById('submitTaskBtn');//get task submit button
  const formCard = document.getElementById('formCard');//get task form wrapper
  
  const filterCategory = document.getElementById('filterCategory');//get category dropdown selector
  const statusTabs = document.getElementById('statusTabs');// get status filter tabs container
  
  let currentStatusFilter = 'All';// tracking active task filter state
  let isEditingMode = false;// track is app editing a task

  //Register link click event handler
  goToRegister.addEventListener('click', () => {
    loginCard.classList.add('hidden');// hide login pannel
    registerCard.classList.remove('hidden');//display registration pannel
    registerForm.reset();//clear registration  input fields
    registerError.classList.add('hidden'); // hide registrations errors
  });

  //login link click event handler
  goToLogin.addEventListener('click', () => {
    registerCard.classList.add('hidden');
    loginCard.classList.remove('hidden');
    loginForm.reset();//clear login inputs
    authError.classList.add('hidden');// hide login errors
  });

  function initSession() {// starting session checking  function
    const user = AuthManager.getCurrentUser();// fetch currently logged in user
    if (user) {// checking if user is logged in
      authScreen.classList.add('hidden');// hide authentication screen
      workspaceScreen.classList.remove('hidden');//displaying main workspace
      userDisplay.textContent = user.name;
      roleDisplay.textContent = user.role;
      
      setupFormAvailability(user);//configuring visible elements based on role
      render();//display task list to the screen
    } else {//if no active session run
      authScreen.classList.remove('hidden');//show login/registration on the screen
      workspaceScreen.classList.add('hidden');//hide main workspace screen
    }
  }

  function setupFormAvailability(user) {// checking user permission for form access
    if (user.role === USER_ROLES.EMPLOYEE) {// run if user is an employee
      formCard.classList.add('hidden');//hide task creation form from employess
    } else { // run if user is an admin /manager
      formCard.classList.remove('hidden');// display creation form
      // Dropdown assigns directly using the username string
      taskAssignment.innerHTML = AuthManager.getAllEmployees().map(emp => //fetch list and map options
        `<option value="${emp.username}">${emp.name}</option>`//generating individual dropdown choice
      ).join('');//converting html options
    }
  }

  //login in listner
  // safety block
  loginForm.addEventListener('submit', (e) => {// handle login form submission event
    e.preventDefault();//stop the page from reload
    authError.classList.add('hidden');// clearing previous login errors
    try { // attempt secure login
      AuthManager.login(// call login validation system
        document.getElementById('username').value,// retrieve entered user name value
        document.getElementById('password').value// retrieve entered password value
      );
      loginForm.reset(); // clear login form inputs
      initSession();// initialize workspace user session 
    } catch (err) {// handling failed authenticatiion
      authError.textContent = err.message;// injecting error text to user UI
      authError.classList.remove('hidden');// display login error to user UI
    }
  });

  // Registration  Form submissions
  registerForm.addEventListener('submit', (e) => {// handle registration form submission
    e.preventDefault();// 
    registerError.classList.add('hidden'); // hide registration error elements
    registerSuccess.classList.add('hidden');// hide registration success
    try {// attempt new account creation
      AuthManager.register({// pass structured object payload 
        name: document.getElementById('regName').value,// gather full name
        username: document.getElementById('regUsername').value,// gather profile
        password: document.getElementById('regPassword').value,//gathering secured passwords
        role: document.getElementById('regRole').value//gathering chosen workspace role
      });
      registerSuccess.classList.remove('hidden');// showing successful account creation 
      setTimeout(() => {// delays interface transition
        registerCard.classList.add('hidden');// hide regestration panel
        loginCard.classList.remove('hidden');//displaying logon panel
      }, 1000); // execute after one second
    } catch (err) {// catching runtime errors after execution
      registerError.textContent = err.message;// inserting error text
      registerError.classList.remove('hidden');//revealing  registration error
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => { //attaching logout click listner
    AuthManager.logout();// clearing user session
    initSession(); //resetting the page 
  });

  taskForm.addEventListener('submit', (e) => {// watching the form submission
    e.preventDefault();//prevent the page frrom reloading
    titleError.classList.add('hidden');// hide the error message

    const titleValue = taskTitle.value.trim();// remove exta spaces from the text typed text
    if (!titleValue) { // if input field blank 
      titleError.classList.remove('hidden');// show the error message box
      return; //stop running the code
    }

    // form data package
    const taskPayload = {// collect all form inputs into a package
      title: titleValue,// save the written task name
      category: taskCategory.value,// save the selected task category
      assignedTo: taskAssignment.value// save the assignrd person's name
    };

    //edit task check
    if (isEditingMode) {// if updating an event task
      workspace.updateTask(taskIdField.value, taskPayload);//save changes over the old
      exitEditingState();// closing editing mode and reseting views
    } else {// if creating a brand new task 
      workspace.addTask(taskPayload);// add new task package to the list
    }

    // form submit action
    taskForm.reset();// clear text fields and downdrop choices
    render();// redraw the update list on screen
  });


  //editing function
  function exitEditingState() {// starting function to turn off editing mode
    isEditingMode = false;//seting editing state back to false
    formTitle.textContent = 'Create New Task';//reset form header back to normal text
    submitTaskBtn.textContent = 'Add Task';// reset form button back to normal text
    taskIdField.value = '';// clearing out the hidden task id value
  }

  filterCategory.addEventListener('change', () => render());//redraw list when dropdown category changes
  
  //tab validation
  statusTabs.addEventListener('click', (e) => {//watching clicks on the navigation bars
    if (e.target.classList.contains('tab-btn')) {// checking if valid tab button  was clicked
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));// remove active design from all tabs
      e.target.classList.add('active');//add active design highlight to clicked button
      currentStatusFilter = e.target.dataset.status;// updating current filter setting with tab data 
      render();// redraw the task list with active filter applied
    }
  });


  // filter tracking data
  function render() {// stert main function to redraw tasks on the screen 
    const currentUser = AuthManager.getCurrentUser();// fetch data of currently logged in user
    if (!currentUser) return;// stop ruunning if no user is logged in

    const renderingStack = workspace.filterAndSortTasks({// requesting a filtered and sorted task list array 
      user: currentUser,// passing current users details for tracking ownership
      category: filterCategory.value,// passing category dropdown value to narrow down details
      status: currentStatusFilter//passing active status tab filter to select correct tasks
    });

    taskList.innerHTML = '';// clearing all old task  from the list display

    renderingStack.forEach(task => {// looping through every single task in the sorted array
      const li = document.createElement('li');//creating anew list item element for the task
      li.className = `task-item ${task.completed ? 'completed' : ''}`;// adding completed styling in if the task is finished
      
      //button container
      const accessControlLinks = currentUser.role === USER_ROLES.MANAGER // checcking if the logged in user is a manager
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
      `;// end of task item content  template string
      taskList.appendChild(li);// appending copleted new task item into real screen list
    });

    const score = workspace.calculateProgress(currentUser.username, currentUser.role === USER_ROLES.MANAGER);
    progressPercent.textContent = `${score}%`;// updating percentages  text lable visible on the screen
    progressBar.style.width = `${score}%`;// resize the visual progress bar with element
  }

  taskList.addEventListener('click', (e) => {// watching for any click inside the task list area
    const id = e.target.dataset.id;// grabing the unique task id from the clicked element
    if (!id) return;// stop ruuning if clicked elemeny has no task id

    if (e.target.classList.contains('task-checkbox')) {// checking if status checkbox was clicked
      // FIXED ENGINE CALL: Safely triggers orchestrator data sync rather than raw object properties
      workspace.toggleTaskStatus(id);// switch the task status between done and not done
      render();// redraw the updated list of tasks on the screen
    } else if (e.target.classList.contains('action-delete')) {// check if delete button was clicked
      workspace.deleteTask(id);// complete remove the task from saved data
      if (isEditingMode && taskIdField.value === id) exitEditingState();// cancel editing if we just deleted the task
      render();// redraw  the updated list of task on the screen 
    } else if (e.target.classList.contains('action-edit')) {// check if an edited button was clicked
      const targetTask = workspace.tasks.find(t => t.id === id);// search the list to find the task data matching this id
      if (targetTask) {// making sure thr matching data was succesfuuly found 
        isEditingMode = true;// turning on editing mode
        formTitle.textContent = 'Modify Workspace Task';// change the form header tittle text
        submitTaskBtn.textContent = 'Update Task';// change the form button txt
        taskIdField.value = targetTask.id;// save the task id into hidden  input field id
        taskTitle.value = targetTask.title;//put the task tittle text into the new input box
        taskCategory.value = targetTask.category;// select the task category in the dropdown list
        taskAssignment.value = targetTask.assignedTo;// selecting the assinged person in the dropdown  list
        taskTitle.focus();//placing the typing cursor  automatically inside the task name box
      }
    }//  end of check blocks
  });// end of task list

  initSession();// run the function on startup  to check login state and seup screen view
});// end of main document loaded listner