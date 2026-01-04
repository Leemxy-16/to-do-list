
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

// Function to add a new task to the task list
function addTask() {
    // 1. Get the task text from the input field and trim whitespace
    const taskText = taskInput.value.trim();

    // Check if the input is empty
    if (taskText === "") {
        alert("Please enter a task!");
        return; // Exit the function if no task is entered
    }

    
    const listItem = document.createElement('li');
    
    // Set the content of the list item to the task text
    // The innerHTML includes the task text and the delete button
    listItem.innerHTML = `
        <span>${taskText}</span>
        <button class="delete-btn">X</button>
    `;

    // 3. Add an event listener to the delete button to remove the task when clicked
    const deleteButton = listItem.querySelector('.delete-btn');
    deleteButton.addEventListener('click', () => {
        taskList.removeChild(listItem);
    });


    taskList.appendChild(listItem);

    // 4. Clear the input field after adding the task
    taskInput.value = '';
    
    // 5. Optionally, set focus back to the input field for convenience
    taskInput.focus(); 
}
// 2. Attach an event listener to the "Add Task" button to call addTask function on click
addTaskBtn.addEventListener('click', addTask);

// Optional: Allow adding task by pressing 'Enter' key in the input field
taskInput.addEventListener('keypress', (event) => {
    // KeyCode 13 is the 'Enter' key. 'key' property is often preferred.
    if (event.key === 'Enter') {
        addTask();
    }
});