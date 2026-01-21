const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const startTimeInput = document.getElementById('startTimeInput');
const endTimeInput = document.getElementById('endTimeInput');
const addBtn = document.getElementById('addBtn');
const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
const tasksContainer = document.getElementById('tasksContainer');
const historyContainer = document.getElementById('historyContainer');
const errorMsg = document.getElementById('error-msg');

let showingHistory = false;
let notificationPermission = false;

async function requestNotificationPermission() {
  if (Notification.permission === 'granted') {
    notificationPermission = true;
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    notificationPermission = permission === 'granted';
  }
}

function showNotification(title, body) {
  if (notificationPermission) {
    new Notification(title, { body });
  }
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveDeletedTasks(deletedTasks) {
  localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
}

function getDeletedTasks() {
  return JSON.parse(localStorage.getItem('deletedTasks')) || [];
}

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/,/, '');
}

function renderTasks(container, tasks, isHistory = false, categoryOrder) {
  container.innerHTML = '';
  const grouped = {};

  tasks.forEach((task, index) => {
    const cat = task.category || 'Uncategorized';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ task, index });
  });

  categoryOrder.forEach(cat => {
    if (grouped[cat]) {
      createGroup(container, cat, grouped[cat], isHistory);
      delete grouped[cat];
    }
  });

  Object.keys(grouped).forEach(cat => {
    createGroup(container, cat, grouped[cat], isHistory);
  });
}

function createGroup(container, category, items, isHistory) {
  const group = document.createElement('div');
  group.className = 'category-group';

  const header = document.createElement('div');
  header.className = 'category-header';
  header.textContent = category;
  group.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'task-list';

  items.forEach(({ task, index }) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.index = index;

    if (!isHistory) {
      const check = document.createElement('div');
      check.className = `checkbox ${task.done ? 'checked' : ''}`;
      check.addEventListener('click', () => toggleDone(index));

      li.appendChild(check);
    }

    const content = document.createElement('div');
    content.className = 'task-content';

    const text = document.createElement('span');
    text.className = `task-text ${task.done ? 'done' : ''}`;
    text.textContent = task.text;

    const times = document.createElement('div');
    times.className = 'task-times';
    times.innerHTML = `
      <span class="time-label">Start:</span> ${formatTime(task.startTime)}
      <br><span class="time-label">End:</span> ${formatTime(task.endTime)}
    `;

    content.appendChild(text);
    content.appendChild(times);

    li.appendChild(content);

    if (isHistory) {
      const restoreBtn = document.createElement('button');
      restoreBtn.className = 'restore-btn';
      restoreBtn.textContent = 'Restore';
      restoreBtn.addEventListener('click', () => restoreTask(index));

      const permDelBtn = document.createElement('button');
      permDelBtn.className = 'perm-delete-btn';
      permDelBtn.textContent = 'Delete Permanently';
      permDelBtn.addEventListener('click', () => permDeleteTask(index));

      li.append(restoreBtn, permDelBtn);
    } else {
      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => deleteTask(index));

      li.appendChild(delBtn);
    }

    list.appendChild(li);
  });

  group.appendChild(list);
  container.appendChild(group);
}

function updateView() {
  if (showingHistory) {
    tasksContainer.style.display = 'none';
    historyContainer.style.display = 'block';
    toggleHistoryBtn.textContent = 'View Active Tasks';
    renderTasks(historyContainer, getDeletedTasks(), true, ['Work', 'Personal', 'Study']);
  } else {
    tasksContainer.style.display = 'block';
    historyContainer.style.display = 'none';
    toggleHistoryBtn.textContent = 'View History';
    renderTasks(tasksContainer, getTasks(), false, ['Work', 'Personal', 'Study']);
  }
}

function addTask() {
  const text = taskInput.value.trim();
  const category = categorySelect.value.trim();
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;

  if (!text || !category || !startTime || !endTime) {
    errorMsg.textContent = 'Please fill all fields';
    errorMsg.style.display = 'block';
    setTimeout(() => errorMsg.style.display = 'none', 3000);
    return;
  }

  if (new Date(startTime) >= new Date(endTime)) {
    errorMsg.textContent = 'Start time must be before end time';
    errorMsg.style.display = 'block';
    setTimeout(() => errorMsg.style.display = 'none', 3000);
    return;
  }

  const tasks = getTasks();
  tasks.push({
    text,
    category,
    done: false,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString()
  });
  saveTasks(tasks);

  taskInput.value = '';
  categorySelect.value = '';
  startTimeInput.value = '';
  endTimeInput.value = '';

  updateView();
}

function toggleDone(index) {
  const tasks = getTasks();
  tasks[index].done = !tasks[index].done;
  saveTasks(tasks);
  updateView();
}

function deleteTask(index) {
  const tasks = getTasks();
  const deleted = tasks.splice(index, 1)[0];
  saveTasks(tasks);

  const deletedTasks = getDeletedTasks();
  deletedTasks.push(deleted);
  saveDeletedTasks(deletedTasks);

  updateView();
}

function restoreTask(index) {
  const deletedTasks = getDeletedTasks();
  const restored = deletedTasks.splice(index, 1)[0];
  saveDeletedTasks(deletedTasks);

  const tasks = getTasks();
  tasks.push(restored);
  saveTasks(tasks);

  updateView();
}

function permDeleteTask(index) {
  const deletedTasks = getDeletedTasks();
  deletedTasks.splice(index, 1);
  saveDeletedTasks(deletedTasks);
  updateView();
}

function checkNotifications() {
  const tasks = getTasks();
  const now = new Date().getTime();

  tasks.forEach(task => {
    if (task.done) return;

    const end = new Date(task.endTime).getTime();
    const tenMinBefore = end - 10 * 60 * 1000;

    if (now >= tenMinBefore && now < end && !task.notifiedBefore) {
      showNotification('Task Reminder', `Task "${task.text}" is due in 10 minutes!`);
      task.notifiedBefore = true;
      saveTasks(tasks);
    }

    if (now >= end && !task.notifiedExact) {
      showNotification('Task Due', `Task "${task.text}" is due now!`);
      task.notifiedExact = true;
      saveTasks(tasks);
    }
  });
}

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTask();
  }
});

toggleHistoryBtn.addEventListener('click', () => {
  showingHistory = !showingHistory;
  updateView();
});

requestNotificationPermission();
updateView();
setInterval(checkNotifications, 60000); // Check every minute

// service-worker.js (add this new file in the same directory)

const firebaseConfig = {
    apiKey: "AIzaSyB63wXaLKqfb0KmAqes289YBd13UkBODb0",
  authDomain: "todo-list-9b237.firebaseapp.com",
  projectId: "todo-list-9b237",
  storageBucket: "todo-list-9b237.firebasestorage.app",
  messagingSenderId: "255725067990",
  appId: "1:255725067990:web:392b899c69f1b07bc27377"
  };
  
  importScripts('https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/10.7.2/firebase-messaging.js');
  
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  
  messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/icon.png' // Optional: add an icon
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
