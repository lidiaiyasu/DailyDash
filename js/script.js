// Filtering logic: tracks which filter is active (all, active, completed)
let currentFilter = 'all';

// --- Task Model & Persistence ---
// Retrieve tasks from localStorage, or return an empty array if none exist
function getTasksFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('todo-tasks') || '[]');
  } catch (e) {
    return [];
  }
}
// Save the current list of tasks to localStorage
function saveTasksToStorage(tasks) {
  localStorage.setItem('todo-tasks', JSON.stringify(tasks));
}

// --- Render & Utility ---
// Render all tasks to the DOM, applying the current filter and updating UI state
function renderTasks() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  const tasks = getTasksFromStorage();
  let visibleCount = 0;
  tasks.forEach((task, idx) => {
    // Filter logic: skip tasks that don't match the current filter
    if (
      currentFilter === 'active' && task.completed
      || currentFilter === 'completed' && !task.completed
    ) return;
    visibleCount++;
    const li = document.createElement('li');
    li.style.fontSize = '0.93em';
    li.style.lineHeight = '1.2';
    li.style.padding = '7px 8px';
    if (task.completed) li.classList.add('completed');

    // Completion checkbox (accessible, updates task state)
    const completeCheckbox = document.createElement('input');
    completeCheckbox.type = 'checkbox';
    completeCheckbox.className = 'complete-checkbox';
    completeCheckbox.title = 'Mark as Completed';
    completeCheckbox.checked = !!task.completed;
    completeCheckbox.tabIndex = 0;
    completeCheckbox.setAttribute('aria-label', 'Mark task as completed');
    completeCheckbox.onchange = () => {
      task.completed = completeCheckbox.checked;
      saveTasksToStorage(tasks);
      renderTasks();
    };
    li.appendChild(completeCheckbox);

    // Task text
    const taskSpan = document.createElement('span');
    taskSpan.textContent = task.text;
    taskSpan.style.flex = '1';
    li.appendChild(taskSpan);

    // Creation date
    const dateSpan = document.createElement('span');
    dateSpan.className = 'task-date';
    dateSpan.textContent = task.date || '';
    li.appendChild(dateSpan);

    // Edit button (inline editing of task text)
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.onclick = () => {
      // Replace task text with input for editing
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = task.text;
      editInput.style.flex = '1';
      // Save/cancel buttons for editing
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      saveBtn.style.background = '#2196f3'; // blue
      saveBtn.style.color = '#fff';
      saveBtn.style.border = 'none';
      saveBtn.style.borderRadius = '8px';
      saveBtn.style.marginRight = '8px';
      saveBtn.style.padding = '5px 12px';
      saveBtn.style.cursor = 'pointer';
      saveBtn.onclick = () => {
        if (editInput.value.trim()) {
          task.text = editInput.value.trim();
          saveTasksToStorage(tasks);
          renderTasks();
        }
      };
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.background = '#e74c3c'; // red
      cancelBtn.style.color = '#fff';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '8px';
      cancelBtn.style.padding = '5px 12px';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.onclick = renderTasks;
      li.innerHTML = '';
      li.appendChild(editInput);
      li.appendChild(saveBtn);
      li.appendChild(cancelBtn);
    };
    li.appendChild(editBtn);

    // Delete button (removes task from list)
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
      tasks.splice(idx, 1);
      saveTasksToStorage(tasks);
      renderTasks();
    };
    li.appendChild(deleteBtn);

    document.getElementById('todo-list').appendChild(li);
  });
  // Show/hide empty message depending on filter and visible tasks
  const emptyMsg = document.getElementById('empty-message');
  if (currentFilter === 'completed' && visibleCount === 0) {
    emptyMsg.textContent = 'No completed tasks.';
    emptyMsg.style.display = 'block';
  } else if (currentFilter === 'active' && visibleCount === 0) {
    emptyMsg.textContent = 'No active tasks.';
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.textContent = '';
    emptyMsg.style.display = 'none';
  }
  // Update filter button active state
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (currentFilter === 'all') document.getElementById('filter-all').classList.add('active');
  if (currentFilter === 'active') document.getElementById('filter-active').classList.add('active');
  if (currentFilter === 'completed') document.getElementById('filter-completed').classList.add('active');
}

// filterTasks is now handled by renderTasks

// Set up event listeners and initial render on page load
document.addEventListener('DOMContentLoaded', () => {
  // Dark mode toggle button
  const darkBtn = document.getElementById('toggle-dark');
  let dark = false;
  darkBtn.onclick = function() {
    dark = !dark;
    document.body.classList.toggle('dark-mode', dark);
    darkBtn.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
  };
  // Filter buttons
  document.getElementById('filter-all').onclick = function() {
    currentFilter = 'all';
    renderTasks();
  };
  document.getElementById('filter-active').onclick = function() {
    currentFilter = 'active';
    renderTasks();
  };
  document.getElementById('filter-completed').onclick = function() {
    currentFilter = 'completed';
    renderTasks();
  };
  renderTasks();
});

// Add a new task when user presses Enter in the input field
function addTask() {
  const input = document.getElementById('todo-input');
  const taskText = input.value.trim();
  if (!taskText) return;
  const now = new Date();
  const tasks = getTasksFromStorage();
  tasks.push({
    text: taskText,
    completed: false,
    date: now.toLocaleString()
  });
  saveTasksToStorage(tasks);
  renderTasks();
  input.value = '';
}

document.getElementById('todo-input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    addTask();
  }
});
