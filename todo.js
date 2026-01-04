const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const taskCategorySelect = document.getElementById('task-category');

document.addEventListener('DOMContentLoaded', getLocalTasks);

function addTask() {
    const taskText = taskInput.value.trim();
    const taskCategory = taskCategorySelect.value;
    
    // Capture the START TIME
    const now = new Date();
    const startTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (taskText === "" || taskCategory === "none") {
        alert("Please enter a task and select a category!");
        return;
    }

    const taskObject = {
        text: taskText,
        category: taskCategory,
        startTime: startTime,
        finishTime: null, // Empty until marked done
        completed: false
    };

    createTaskElement(taskObject);
    saveToLocalStorage(taskObject);

    taskInput.value = '';
    taskCategorySelect.value = 'none';
}

function createTaskElement(task) {
    const listItem = document.createElement('li');
    if (task.completed) listItem.classList.add('completed');

    listItem.innerHTML = `
        <div class="task-content">
            <div class="task-meta">
                <span class="task-category-label">${task.category}</span>
                <span class="time-stamp">Started: ${task.startTime}</span>
                <span class="finish-stamp">${task.finishTime ? 'Finished: ' + task.finishTime : ''}</span>
            </div>
            <span class="task-text">${task.text}</span>
        </div>
        <div class="task-actions">
            <button class="complete-btn">${task.completed ? 'Undo' : 'Done'}</button>
            <button class="delete-btn">X</button>
        </div>
    `;

    const completeBtn = listItem.querySelector('.complete-btn');
    const finishSpan = listItem.querySelector('.finish-stamp');

    // DONE BUTTON LOGIC
    completeBtn.addEventListener('click', () => {
        const isCompleting = !listItem.classList.contains('completed');
        listItem.classList.toggle('completed');
        
        let finalTime = null;
        if (isCompleting) {
            finalTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            finishSpan.innerText = `Finished: ${finalTime}`;
            completeBtn.innerText = 'Undo';
        } else {
            finishSpan.innerText = '';
            completeBtn.innerText = 'Done';
        }
        
        updateTaskInLocal(task.text, isCompleting, finalTime);
    });

    listItem.querySelector('.delete-btn').addEventListener('click', () => {
        listItem.remove();
        removeFromLocalStorage(task.text);
    });

    taskList.appendChild(listItem);
}

// --- LOCAL STORAGE HELPERS ---
function saveToLocalStorage(task) {
    let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getLocalTasks() {
    let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
    tasks.forEach(task => createTaskElement(task));
}

function removeFromLocalStorage(taskText) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    localStorage.setItem('tasks', JSON.stringify(tasks.filter(t => t.text !== taskText)));
}

function updateTaskInLocal(taskText, isDone, fTime) {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks.forEach(t => {
        if(t.text === taskText) {
            t.completed = isDone;
            t.finishTime = fTime;
        }
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

addTaskBtn.addEventListener('click', addTask);