# Daily Drive Workspace

## Quick Summary for beginers
If you are new to this project, here is the simple version: Daily Drive Workspace is a digital to-do list web page. It lets you type in tasks, pick a category for  (like Work or Study), check them off when done, and watch a green progress bar grow to 100% as you complete your goals. It automatically saves your list so your tasks don't disappear when you close or refresh your browser tab.

---
## Project Overview

Daily Drive Workspace is a simple, easy-to-use task tracker website. The main goal of this project is to help people organize their day-to-day life without getting overwhelmed. 

Instead of writing things down on scrap paper that gets lost, users can type their chores or goals directly into this dashboard. The system automatically does the hard work: it counts your tasks, calculates your completion score, sorts your finished items to the bottom out of your way, and saves everything safely inside your browser's memory.
---

## Problems It Solves

Many people struggle to stay organized, manage tasks effectively, and keep track of what they achieve throughout the day. This application fixes several common daily challenges:

* **Forgotten tasks:** Keeps all your chores in one safe digital place.
* **Poor time management:** Helps you see exactly what needs to be done next.
* **Lack of goal tracking:** Shows you a live percentage score of your daily progress.
* **Difficulty prioritizing:** Lets you label items by category so you can tackle important sections first.
* **Lack of visibility:** Gives you a clear green bar that fills up as you check off items.

---

## Features

### Task Management

* Add new tasks
* View all tasks
* Edit existing tasks
* Delete completed or unnecessary tasks

### Task Categorization

* Organize tasks into categories such as:

  * Work
  * Personal
  * Study
  * Health
  * Finance

### Task Filtering
* Filter tasks by category (for example, choose to only see Study tasks)
* Filter tasks by completion status (choose to only see what is left to do)
### Goal & Progress Tracking

* Set daily goals
* Track task completion progress
* Automatically calculate completion percentages
* Monitor productivity levels

### Persistent Data Storage

* Save task records using the browser's local memory
* Keep all your data even after refreshing or closing the browser
### Responsive User Interface

* Mobile-friendly design that works great on phones, tablets, and laptops
* Clean and easy-to-use dashboard

---

## Technical Concepts Implemented

### Object-Oriented Programming (OOP)

* Task Class
* WorkspaceManager Class
* Constructors
* Methods
* Encapsulation

### Functional Programming

* filter()
* map()
* reduce()

### Variables and Data Types

* let
* const
* Strings
* Numbers
* Booleans
* Arrays
* Objects

### Functions

* Function Declarations
* Function Expressions
* Arrow Functions
* Callback Functions
* Higher-Order Functions

### Array Methods

* push()
* pop()
* splice()
* find()
* findIndex()
* filter()
* map()
* reduce()
* some()
* every()
* sort()

### Destructuring

* Extract task properties efficiently

### Spread Operator

* Update task collections

### Rest Operator

* Handle multiple task entries

### Local Storage

* localStorage.setItem()
* localStorage.getItem()
* localStorage.removeItem()
* JSON.stringify()
* JSON.parse()

### DOM Manipulation

* getElementById()
* querySelector()
* querySelectorAll()
* createElement()
* appendChild()
* removeChild()
* innerHTML
* textContent
* classList

### Event Handling

* addEventListener()
* Click Events
* Submit Events
* Input Events

### Form Validation

* Required Field Validation
* Empty Input Validation

### Unit Testing

* Jest testing framework
* Test Suites
* Assertions

---

## Project Structure

```text
daily-drive-workspace/
│
├── index.html
├── styles.css
├── script.js
├── task.js
├── task.test.js
└── README.md
```

---

## Technologies Used

* HTML5
* styling  CSS v4
* JavaScript (ES6+)
* Local Storage
* Jest

---

## Visual Identity

### Brand Name

Daily Drive Workspace

### Primary Color

Blue – productivity, focus, and organization

### Secondary Color

Green – growth, progress, and achievement

### Accent Color

White – clean, modern, and minimal interface


---

## Requirements Before Running
Before you can run or test this project on your computer, you need to download and install these two free tools:
* **Node.js** (A program that lets your computer run JavaScript code outside of a browser)
* **npm** (A tool used to install helper code packages, which comes included automatically when you install Node.js)

---

## Typography

* Headings: Poppins
* Body Text: Inter / Roboto
* Buttons: Inter / Roboto

---

## Installation

### Clone Repository
Run this command in your terminal to download a copy of the project:
```bash
git clone https://github.com
```
 
### Open Project

Navigate into the project folder and open it in VS Code:
```bash
cd daily-drive-workspace
code .
```

### Install Dependencies
Run this command to install the required testing tools (like Jest):
```bash
npm install
```

---




## How to Use the Project

Because this application uses a modern JavaScript feature called **Modules**, web browsers will block the files from opening if you simply double-click the HTML file from your computer folder. Follow these steps to run the website correctly:

1. **Launch a Local Server:** Inside VS Code, right-click on the `module.html` file and choose **Open with Live Server**. This creates a private local web address for your project.
2. **Adding a Task:** Type your task name into the box under *Task Title*, choose a category from the dropdown menu, and click the **Add Task** button.
3. **Completing a Task:** Click the checkbox next to any task. The website will cross out the task name, move it to the bottom of the list, and increase your progress bar percentage at the top of the screen.
4. **Editing a Task:** Click the **Edit** link next to a task. The information will jump back into the input boxes, the main button will change to *Update Task*, and your typing cursor will focus on the text field automatically.
5. **Filtering Tasks:** Click the **All**, **Pending**, or **Completed** tabs, or use the category dropdown menu to show or hide specific tasks.

---



## Running Automated Tests

This project includes automated tests to make sure the code logic runs perfectly. To check the tests, open your terminal window inside the project folder and run:
```bash
npm test
```

---

## Deployment

### GitHub Pages

1. Push your project files to your GitHub profile.
2. Open your GitHub Repository Settings.
3. Scroll down and click on the **Pages** menu on the left side.
4. Under Build and deployment, choose your **main** branch.
5. Click Save and wait a minute for GitHub to give you a live website link.

### Vercel
1. Log into Vercel and import your GitHub repository.
2. Click the **Deploy** button.
3. Vercel will instantly build your project and give you a live shareable web link.

---
## Future Improvements

* Calendar integration to schedule tasks on specific days
* Task reminders and pop-up notifications
* Detailed productivity history charts and reports
* Weekly and monthly goal tracking
* Cloud backup so you can log in from any device
* User accounts and passwords
* Team features to share task lists with friends or coworkers

---

## Privacy and Data Security
All of your task names, categories, and settings are saved completely on your own computer inside your browser's private local storage. No data is ever sent, shared, or uploaded to an external internet server. If you clear your browser history or cache files, your task list will be reset.

---

## Contribution

Contributions are highly valued and help make Daily Drive Workspace better. Please follow these simple steps to contribute to the project:

### How to Contribute
1. **Fork the Repository:** Create a copy of this repository on your personal GitHub account.
2. **Create a Feature Branch:** Set up a separate branch for your changes (`git checkout -b feature/AmazingFeature`).
3. **Commit Your Changes:** Keep your code clean, well-organized, and add concise comments above major logical blocks (`git commit -m 'Add some AmazingFeature'`).
4. **Run Code Tests:** Check your browser developer console or run Jest commands (`npm test`) to ensure everything behaves properly without errors.
5. **Open a Pull Request:** Submit your feature branch back to the main project repository with a short summary describing your enhancements or bug fixes.

### Contribution Areas
* Bug fixes for task mechanics or UI states
* Responsive styling updates using STYLE CSS v4
* Code performance optimizations for array sorting or data rendering pipeline structures

---
## Author

Developed by Derrick Weru

---

## License

This project is for educational purposes.



 