// Importing the Task class blueprint from the file task.js
import { Task } from './task.js';

class WorkspaceManager {
    
    constructor() {
        // Load saved items from browser storage or start with an empty list
        const savedData = JSON.parse(localStorage.getItem('dd_tasks')) || [];
        
        // Loop through raw saved items and convert each one into a real Task object
        this.tasks = savedData.map(t => new Task(t.id, t.title, t.category, t.completed, t.dateCreated));
        
        // Default tracker settings for filters and edits
        this.currentFilter = 'all';
        this.currentCategoryFilter = 'all';
        this.editingTaskId = null;

        // Grabing all the HTML elements we need to control
        this.taskForm = document.getElementById('task-form');
        this.taskInput = document.getElementById('task-input');
        this.categorySelect = document.getElementById('category-select');
        this.taskList = document.getElementById('task-list');
        this.statusFilters = document.querySelectorAll('[data-status-filter]');
        this.catFilterSelect = document.getElementById('filter-category-select');
        this.formSubmitBtn = document.getElementById('form-submit-btn');
        
        this.completionRateText = document.getElementById('completion-rate');
        this.progressFill = document.querySelector('.progress-bar'); 
        this.taskCountText = document.getElementById('task-count');

        // Run the event listeners function immediately
        this.init();
    }

    // Set up what happens when buttons are clicked or forms are changed
    init() {
        this.taskForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        this.catFilterSelect.addEventListener('change', (e) => {
            this.currentCategoryFilter = e.target.value;
            this.render();
        });

        // Looping through each filter button tab to attach a click event
        this.statusFilters.forEach(button => {
            button.addEventListener('click', (e) => {
                // Loop through all filter buttons to remove their active styling class
                this.statusFilters.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.statusFilter;
                this.render();
            });
        });

        this.render();
    }

    // Save the current tasks list into browser storage
    saveToLocalStorage() {
        localStorage.setItem('dd_tasks', JSON.stringify(this.tasks));
    }

    // Handle adding a brand new task or saving changes to an old task
    handleFormSubmit(event) {
        event.preventDefault(); 
        const title = this.taskInput.value.trim();
        const category = this.categorySelect.value;

        // If the task title is missing OR the category select box is empty
        if (!title || !category) {
            alert('Please enter a valid task description.');
            return; // Stop running the rest of this function immediately
        }

        // If currently editing an existing task (meaning editingTaskId holds an ID)
        if (this.editingTaskId) {
            // Find the single task object in the list that matches the ID we are editing
            const task = this.tasks.find(t => t.id === this.editingTaskId);
            // If the matching task object is successfully found in the array
            if (task) {
                task.title = title; // Update its description text with the new input value
                task.category = category; // Update its category value with the new dropdown value
            }
            this.editingTaskId = null; // Reset this tracker to null because   editing is finished
            // If the submit button element exists on the page
            if (this.formSubmitBtn) this.formSubmitBtn.textContent = 'Add Task'; // Switch button text back to default
        } 
        // Else run this block if editingTaskId is null (meaning its  creating a brand new task)
        else {
            const newTask = new Task(Date.now().toString(), title, category);
            this.tasks.push(newTask);
        }

        this.saveToLocalStorage();
        this.taskForm.reset();
        this.render();
    }

    // Delete a task by filtering out its unique ID number
    deleteTask(id) {
        // Filter the list to keep every single task whose ID does NOT match the one we want to delete
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.render();
    }

    // Flip the completion status back and forth between true and false
    toggleTaskStatus(id) {
        // Find the single task object in the array matching the clicked checkbox ID
        const task = this.tasks.find(t => t.id === id);
        // If the task object was successfully found in the list
        if (task) {
            task.completed = !task.completed; // Reverse its completion status value (true becomes false, or false becomes true)
            this.saveToLocalStorage();
            this.render();
        }
    }

    // Put a task's information back into the form inputs for editing
    startEdit(id) {
        // Find the task object matching the clicked edit button ID
        const task = this.tasks.find(t => t.id === id);
        // If the task object was successfully found in our array
        if (task) {
            this.editingTaskId = id; // Save the ID here so our app remembers which task is being modified
            this.taskInput.value = task.title; // Place the task's title string back inside the form input box
            this.categorySelect.value = task.category; // Select the task's category inside the dropdown menu
            // If the form submit button element exists on the page
            if (this.formSubmitBtn) this.formSubmitBtn.textContent = 'Update Task'; // Change button text to indicate edit mode
            this.taskInput.focus(); 
        }
    }

    // Calculate total numbers and percentage completed for the dashboard
    calculateMetrics() {
        const total = this.tasks.length;
        // If the total number of tasks is exactly 0
        if (total === 0) return { percentage: 0, total: 0 }; // Return zero stats immediately to prevent math errors

        // Filter out and count only the task items where completed is true
        const completedCount = this.tasks.filter(t => t.completed).length;
        const percentage = Math.round((completedCount / total) * 100);

        return { percentage, total };
    }

    // Filter, sort, and draw the tasks onto the webpage
    render() {
        // Loop through all tasks and only keep the ones that pass  filter criteria rules
        let filtered = this.tasks.filter(task => {
            const matchesStatus = 
                this.currentFilter === 'all' || 
                (this.currentFilter === 'completed' && task.completed) || 
                (this.currentFilter === 'pending' && !task.completed);
            
            const matchesCategory = 
                this.currentCategoryFilter === 'all' || 
                task.category === this.currentCategoryFilter;

            return matchesStatus && matchesCategory;
        });

        // Automatically push completed items to the bottom of the list array
        filtered.sort((a, b) => a.completed - b.completed);

        this.taskList.innerHTML = '';

        // Loop through each filtered task to generate and display its HTML structure
        filtered.forEach(task => {
            const { id, title, category, completed } = task;
            
            const li = document.createElement('li');
            li.className = `task-item ${completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="task-left-section">
                    <input type="checkbox" ${completed ? 'checked' : ''} class="task-checkbox">
                    <div class="task-info-block">
                        <span class="task-title-text ${completed ? 'strikethrough' : ''}">${title}</span>
                        <span class="task-category-badge">${category}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-link edit-action edit-btn">Edit</button>
                    <button class="action-link delete-action delete-btn">Delete</button>
                </div>
            `;

            li.querySelector('.task-checkbox').addEventListener('change', () => this.toggleTaskStatus(id));
            li.querySelector('.edit-btn').addEventListener('click', () => this.startEdit(id));
            li.querySelector('.delete-btn').addEventListener('click', () => this.deleteTask(id));

            this.taskList.appendChild(li);
        });

        const { percentage, total } = this.calculateMetrics();
        // If the total tasks count label element is found on  page
        if (this.taskCountText) this.taskCountText.textContent = `${total} Total Tasks`; // Update text with the new total number
        // If the percentage completion text element is found on the page
        if (this.completionRateText) this.completionRateText.textContent = `${percentage}%`; // Update text with the new percentage number
        // If the progress bar element is found on the page
        if (this.progressFill) this.progressFill.style.width = `${percentage}%`; 
    }
}

// Wait for the browser window HTML nodes layout to load fully before running code
document.addEventListener('DOMContentLoaded', () => {
    new WorkspaceManager();
});
 