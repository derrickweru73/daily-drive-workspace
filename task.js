// Exporting the class so other files can use it
export class Task {
    
    // Creating the task properties when a new task is made
    constructor(id, title, category, completed = false, dateCreated = new Date().toISOString()) {
        this.id = id; // Savng the unique ID number
        this.title = title; // Saving the task name text
        this.category = category; // Saving the category name text
        this.completed = completed; // Saving  done or not
        this.dateCreated = dateCreated; // Saving the date it was created
    } 

    // Updating the task name or category with new information
    updateDetails({ title, category }) {
        // If a new title name was typed in
        if (title) this.title = title.trim(); // Save it and trim blank spaces
        // If a new category dropdown was chosen
        if (category) this.category = category; // Save the new category name
    } 

    // Switching the completion status back and forth
    toggleStatus() {
        this.completed = !this.completed; // Fliping  true to check false or false one  to true
    } 
} 