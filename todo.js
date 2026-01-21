const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const addBtn = document.getElementById("addBtn");
const tasksContainer = document.getElementById("tasksContainer");
const errorMsg = document.getElementById("error-msg");

function saveTasks(tasks) {
  localStorage.setItem("myTasks", JSON.stringify(tasks));
}

function getTasks() {
  return JSON.parse(localStorage.getItem("myTasks")) || [];
}

function formatTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/,/, '');
}

function renderTasks() {
  tasksContainer.innerHTML = "";
  const tasks = getTasks();

  const categories = ["Work", "Personal", "Study"];
  const grouped = {};

  tasks.forEach((task, index) => {
    const cat = task.category || "Uncategorized";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ task, index });
  });

  categories.forEach(cat => {
    if (grouped[cat]) {
      createGroup(cat, grouped[cat]);
      delete grouped[cat];
    }
  });

  Object.keys(grouped).forEach(cat => createGroup(cat, grouped[cat]));
}

function createGroup(category, items) {
  const group = document.createElement("div");
  group.className = "category-group";

  const header = document.createElement("div");
  header.className = "category-header";
  header.textContent = category;
  group.appendChild(header);

  const list = document.createElement("ul");
  list.className = "task-list";

  items.forEach(({ task, index }) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.index = index;

    const check = document.createElement("div");
    check.className = `checkbox ${task.done ? "checked" : ""}`;
    check.addEventListener("click", () => toggleDone(index));

    const content = document.createElement("div");
    content.className = "task-content";

    const text = document.createElement("span");
    text.className = `task-text ${task.done ? "done" : ""}`;
    text.textContent = task.text;

    const times = document.createElement("div");
    times.className = "task-times";
    times.innerHTML = `
      <span class="time-label">Started:</span> ${formatTime(task.startTime)}
      ${task.endTime ? `<br><span class="time-label">Ended:</span> ${formatTime(task.endTime)}` : ""}
    `;

    content.appendChild(text);
    content.appendChild(times);

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "×";
    delBtn.addEventListener("click", () => deleteTask(index));

    li.append(check, content, delBtn);
    list.appendChild(li);
  });

  group.appendChild(list);
  tasksContainer.appendChild(group);
}

function addTask() {
  const text = taskInput.value.trim();
  const category = categorySelect.value.trim();

  if (!text || !category) {
    errorMsg.textContent = !text ? "Enter a task" : "Select a category";
    errorMsg.style.display = "block";
    setTimeout(() => errorMsg.style.display = "none", 3000);
    return;
  }

  const now = new Date().toISOString();

  const tasks = getTasks();
  tasks.push({
    text,
    category,
    done: false,
    startTime: now,
    endTime: null
  });

  saveTasks(tasks);

  taskInput.value = "";
  categorySelect.value = "";

  renderTasks();
}

function toggleDone(index) {
  const tasks = getTasks();
  const task = tasks[index];

  if (!task.done) {
    task.endTime = new Date().toISOString();
  } else {
    task.endTime = null; // optional: keep historical end time if you prefer
  }

  task.done = !task.done;
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    addTask();
  }
});

// Initial render
renderTasks();