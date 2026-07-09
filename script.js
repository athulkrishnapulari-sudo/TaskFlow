// TaskFlow - navigation, tasks, overlay, search

let TaskArray = [];
if (localStorage.getItem("tasks")) TaskArray = JSON.parse(localStorage.getItem("tasks"));
else localStorage.setItem("tasks", JSON.stringify(TaskArray));

TaskArray.sort((a, b) => new Date(a.lastDate) - new Date(b.lastDate));

// DOM refs
const listButtons = document.querySelectorAll('.list');
const overlay = document.getElementById('overlay');
const closeOverlay = document.getElementById('closeOverlay');
const form = document.getElementById('addTaskForm');
const tasksDisplay = document.getElementById('main_display');
const todays_tasks = document.getElementById('todays_tasks');
const upcoming_tasks = document.getElementById('upcoming_tasks');
const search_input = document.getElementById('search_input');
const greetings_img = document.getElementById('greetings_img');
const greetings_name = document.getElementById('greetings_name');
const overlay1 = document.getElementById('overlay1');
const loginForm = document.getElementById('loginForm');
const avatarSelect = document.getElementById('avatarSelect');
const tasksPage = document.getElementById('tasks_page');
const homePage = document.getElementById('home_page');
const settingsPage = document.getElementById('settings_page');
const profilePage = document.getElementById('profile_page');

// time & greeting
const now = new Date();
const hour = now.getHours();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const today = `${yyyy}-${mm}-${dd}`;
const greeting = document.getElementById('greeting');
if (greeting) {
  if (hour > 0 && hour < 12) greeting.textContent = 'Good Morning';
  else if (hour >= 12 && hour < 18) greeting.textContent = 'Good Afternoon';
  else greeting.textContent = 'Good Evening';
}


function updateProgress(completed, total) {
  const progress = document.getElementById('progress_width');
  const progressText = document.getElementById('progress_percent');
  if (!progress) return;
  let percentage = total > 0 ? (completed / total) * 100 : 0;
  if (percentage > 100) percentage = 100;
  progress.style.width = percentage + '%';
  progress.style.transition = 'all 0.5s ease-in-out';
  progressText.textContent = Math.round(percentage) + '%';
}
const progress = document.getElementById('progress_width');

function homepage() {
  const validTasks = TaskArray.filter(task => task);
  const completedTasks = validTasks.filter(task => task.Done === true).length;
  const totalTasks = validTasks.length;
  updateProgress(completedTasks, totalTasks);
  
  const todayDate = new Date().toISOString().split('T')[0];
  const todayTasks = validTasks.filter(task => task.lastDate === todayDate);
  const todayCountEl = document.getElementById('today_count');
  if (todayCountEl) todayCountEl.textContent = todayTasks.length;
  
  const upcomingTasks = validTasks.filter(task => new Date(task.lastDate) > new Date());
  const upcomingCountEl = document.getElementById('upcoming_count');
  if (upcomingCountEl) upcomingCountEl.textContent = upcomingTasks.length;
}


function todayTask(task) {
  return task && task.lastDate === today;
}
function renderTasks(targetTodays = todays_tasks, targetUpcoming = upcoming_tasks) {
  if (!targetTodays || !targetUpcoming) return;

  // Clear old tasks before re-rendering
  targetTodays.innerHTML = '';
  targetUpcoming.innerHTML = '';
  targetTodays.innerHTML = '<h6>Today</h6>';
  targetUpcoming.innerHTML = '<h6>Upcoming</h6>';

  // Reload TaskArray from localStorage to stay in sync
  TaskArray = JSON.parse(localStorage.getItem('tasks')) || [];

  TaskArray.forEach((task, i) => {
    if (!task) return; // skip deleted/null tasks

    const card = document.createElement('div');
    card.className = 'task ' + (task.priority || '');
    const dateLabel = todayTask(task) ? 'Today' : (task.lastDate || '');
    if (task.Done) card.classList.add('done');
    card.innerHTML = `
      <div class="task-row1">
        <span class="task-title">${task.name || ''}</span>
        <span class="task-priority">${task.priority || ''}</span>
      </div>
      <div class="task-row2">
        <span class="task-date">${dateLabel}</span>
        <span class="task-time">${task.lastTime || ''}</span>
        <div>
          <button class="mark-done" data-index="${i}">Mark Done</button>
          <button class="delete-task" data-index="${i}">Delete</button>
        </div>
      </div>
    `;

    // Delete handler
    card.querySelector('.delete-task').addEventListener('click', () => {
      const deletepopup = document.getElementById('overlay3');
      deletepopup.classList.add('active');
      const yesBtn = document.getElementById('confirmDelete');
      const noBtn = document.getElementById('cancelDelete');
      yesBtn.onclick = () => {
        TaskArray.splice(i, 1);
        localStorage.setItem('tasks', JSON.stringify(TaskArray));
        renderTasks(targetTodays, targetUpcoming);
        deletepopup.classList.remove('active');
        homepage();
      }
      noBtn.onclick = () => {
        deletepopup.classList.remove('active');
      }
    });

    // markDone handler
    const markDoneBtn = card.querySelector('.mark-done');
    markDoneBtn.addEventListener('click', () => {
      const markDonePopup = document.getElementById('overlay4');
      markDonePopup.classList.add('active');

      const confirmBtn = document.getElementById('confirmMarkDone');
      const cancelBtn = document.getElementById('cancelMarkDone');
      confirmBtn.onclick = () => {
        TaskArray[i].Done = true;
        localStorage.setItem('tasks', JSON.stringify(TaskArray));
        renderTasks(targetTodays, targetUpcoming);
        markDonePopup.classList.remove('active');
        homepage();
      }

      cancelBtn.onclick = () => {
        markDonePopup.classList.remove('active');
      }
      
    })

    if (todayTask(task)) targetTodays.appendChild(card);
    else targetUpcoming.appendChild(card);
  });
}

function setActiveNav(li) {
  listButtons.forEach(b => b.classList.remove('active'));
  if (li) li.classList.add('active');
}

function switchPage() {
  const active = document.querySelector('.list.active') || listButtons[0];
  const idx = Array.from(listButtons).indexOf(active);
  if (idx === 0) {
    tasksDisplay.innerHTML = homePage.innerHTML;
    const todays_tasks = document.getElementById('todays_tasks');
    const upcoming_tasks = document.getElementById('upcoming_tasks');
    renderTasks(todays_tasks, upcoming_tasks);
  }
  else if (idx === 1) {
    tasksDisplay.innerHTML = tasksPage.innerHTML;
    const todays_tasks = document.getElementById('todays_tasks');
    const upcoming_tasks = document.getElementById('upcoming_tasks');
    renderTasks(todays_tasks, upcoming_tasks);
  }
  else if (idx === 3) {
    tasksDisplay.innerHTML = settingsPage.innerHTML;
  }
  else if (idx === 4) {
    tasksDisplay.innerHTML = profilePage.innerHTML;
  }
  homepage()


}
function activeLink(e) {
  e.preventDefault();
  const li = e.currentTarget;
  setActiveNav(li);
  if (li.id === 'addTask') overlay.classList.add('active');
  else overlay.classList.remove('active');
  switchPage();
}

listButtons.forEach(btn => {
  btn.tabIndex = 0;
  btn.addEventListener('click', activeLink);
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
  });
});

if (closeOverlay) closeOverlay.addEventListener('click', () => {
  overlay.classList.remove('active');
  setActiveNav(listButtons[0]);
  switchPage();
});

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const dict = Object.fromEntries(data.entries());
    dict.Done=false;
    console.log(dict);
    TaskArray.push(dict);
    localStorage.setItem('tasks', JSON.stringify(TaskArray));
    overlay.classList.remove('active');
    setActiveNav(listButtons[1] || null);
    switchPage();
  });
}

// Profile handling
const storedPfp = localStorage.getItem('taskflow_pfp');
const storedName = localStorage.getItem('taskflow_name');
if ((!storedPfp || !storedName) && overlay1) overlay1.classList.add('active');

document.querySelectorAll('.avatar-options img').forEach(img => {
  img.addEventListener('click', () => {
    document.querySelectorAll('.avatar-options img').forEach(i => i.classList.remove('selected'));
    img.classList.add('selected');
    if (avatarSelect) avatarSelect.value = img.dataset.value;
  });
});

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('username').value;
    const fileInput = document.getElementById('pfpUpload');
    let pfp = avatarSelect ? avatarSelect.value : null;
    if (fileInput && fileInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = ev => saveProfile(name, ev.target.result);
      reader.readAsDataURL(fileInput.files[0]);
    } else saveProfile(name, pfp);
    homepage();
  });
}

function saveProfile(name, pfp) {
  localStorage.setItem('taskflow_name', name);
  if (pfp) localStorage.setItem('taskflow_pfp', pfp);
  if (overlay1) overlay1.classList.remove('active');
  displayProfile();
  homepage();
}

function displayProfile() {
  const n = localStorage.getItem('taskflow_name');
  const p = localStorage.getItem('taskflow_pfp');
  if (n && greetings_name) greetings_name.textContent = `Hi ${n}`;
  if (p && greetings_img) greetings_img.src = p;
  homepage();
}

window.addEventListener('load', () => {
  displayProfile();
  if (listButtons[0]) setActiveNav(listButtons[0]);
  switchPage();
  homepage();
  progress.style.transition = 'all 0.5s ease-in-out';
});

function TasksSearched(value) {
  const res = [];
  if (!value) return res;
  for (let i = 0; i < TaskArray.length; i++) {
    const n = (TaskArray[i].name || '').toLowerCase();
    if (n.includes(value.toLowerCase())) res.push(TaskArray[i]);
  }
  return res;
}

if (search_input) {
  search_input.addEventListener('input', e => {
    const q = e.target.value.trim();
    
    // If search is empty, restore normal view
    if (q === '') { 
      // Switch to Tasks page and render normally
      setActiveNav(listButtons[1]);
      switchPage();
      return; 
    }
    
    // Get search results
    const results = TasksSearched(q);
    
    // Switch to Tasks page to display results
    setActiveNav(listButtons[1]);
    switchPage();
    
    // Get the target containers after switchPage
    const todays_container = document.getElementById('todays_tasks');
    const upcoming_container = document.getElementById('upcoming_tasks');
    
    if (todays_container) todays_container.innerHTML = '';
    if (upcoming_container) upcoming_container.innerHTML = '';
    
    // Show no results message
    if (results.length === 0) {
      if (tasksDisplay) tasksDisplay.innerHTML = `<p class="no-results">No tasks found for "${q}"</p>`;
      return;
    }
    
    // Display search results
    for (let i = 0; i < results.length; i++) {
      const task = results[i];
      const newDiv = document.createElement('div');
      newDiv.className = 'task ' + (task.priority || '');
      const dateLabel = todayTask(task) ? 'Today' : (task.lastDate || '');
      newDiv.innerHTML = `
        <div class="task-row">
          <span class="task-title">${task.name || ''}</span>
          <span class="task-priority">${task.priority || ''}</span>
        </div>
        <div class="task-row">
          <span class="task-date">${dateLabel}</span>
          <span class="task-time">${task.lastTime || ''}</span>
          <button class="delete-task" data-index="${TaskArray.indexOf(task)}">Delete</button>
        </div>
      `;
      if (todayTask(task) && todays_container) todays_container.appendChild(newDiv);
      else if (upcoming_container) upcoming_container.appendChild(newDiv);
    }
  });
}

// Clear search button
const searchClearBtn = document.getElementById('search_clear');
if (search_input && searchClearBtn) {
  // Show/hide clear button based on input value
  search_input.addEventListener('input', () => {
    if (search_input.value.trim()) {
      searchClearBtn.classList.add('visible');
    } else {
      searchClearBtn.classList.remove('visible');
    }
  });

  // Clear search on button click
  searchClearBtn.addEventListener('click', () => {
    search_input.value = '';
    searchClearBtn.classList.remove('visible');
    // Trigger input event to update display
    search_input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}





console.log(TaskArray);