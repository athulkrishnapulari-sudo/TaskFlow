// TaskFlow - navigation, tasks, overlay, search

let TaskArray = [];
if (localStorage.getItem("tasks")) TaskArray = JSON.parse(localStorage.getItem("tasks"));
else localStorage.setItem("tasks", JSON.stringify(TaskArray));
let fetchdata=null
TaskArray.sort((a, b) => new Date(a.lastDate) - new Date(b.lastDate));
const form2 = document.getElementById('hiddenForm')
let flag=1;
localStorage.setItem('flag',flag);
let fetchedData = null;
const scriptURL = "https://script.google.com/macros/s/AKfycbwNJPp5ONf8NVkBXwZU4H-oZ4shVU-eNX8O8Z2ATSw0-kmYO47UCSToC5n-VLMTI6OajA/exec";

form2.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form2);
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }
  const plainObject = {};
  for (const [key, value] of formData.entries()) {
    plainObject[key] = value;
  }
  fetch(scriptURL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: JSON.stringify(plainObject)
  })
    .then(res => res.text())
    .then(data => console.log("Server response:", data))
    .catch(err => console.error("Error:", err));
  form2.reset();
});


function formSubmit(){
  form2.requestSubmit();
}

function fetchDataByPhone(phoneNo) {
  fetch(`${scriptURL}?phoneNo=` + encodeURIComponent(phoneNo))
    .then(res => res.json())
    .then(data => {
      console.log("Response:", data);
      const newTaskArray = data.taskArray;
      localStorage.setItem('tasks',newTaskArray);
      console.log("New Task Array : ",newTaskArray);
      flag=1;
      localStorage.setItem('flag',flag);
    })
    
    .catch(err => console.error(err));
}

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
const greetings_img2 = document.getElementById('greetings_img2');
const greetings_name = document.getElementById('greetings_name');
const name2 = document.getElementById('name2');
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
  // Separate tasks into today and upcoming lists (preserve original indexes)
  const todaysList = [];
  const upcomingList = [];
  TaskArray.forEach((task, i) => {
    if (!task) return;
    if (todayTask(task)) todaysList.push({ task, i });
    else upcomingList.push({ task, i });
  });

  // Helper to create a card element with handlers
  const createCard = ({ task, i }) => {
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
    const deleteBtn = card.querySelector('.delete-task');
    deleteBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
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
        update();
      location.reload(true);
      }
      noBtn.onclick = () => {
        deletepopup.classList.remove('active');
      }
    });

    // markDone handler
    const markDoneBtn = card.querySelector('.mark-done');
    markDoneBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
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
        update();
        location.reload(true);
        formSubmit()
      }

      cancelBtn.onclick = () => {
        markDonePopup.classList.remove('active');
      }

    });

    // Show details when clicking the card (avoid clicks on buttons)
    card.addEventListener('click', (ev) => {
      if (ev.target.closest('button')) return;
      showTaskDetails(task, i);
    });

    return card;
  };

  // Render limited list with overflow + more control
  const renderLimited = (list, container) => {
    const limit = 5;
    const show = list.slice(0, limit);
    show.forEach(item => container.appendChild(createCard(item)));
    if (list.length > limit) {
      const moreDiv = document.createElement('div');
      moreDiv.className = 'task more';
      moreDiv.style.cursor = 'pointer';
      moreDiv.style.textAlign = 'center';
      moreDiv.innerHTML = `<div class="task-row1"><span class="task-title">+${list.length - limit} more</span><span></span></div>`;
      moreDiv.addEventListener('click', () => {
        const overlay5 = document.getElementById('overlay5');
        const taskContainer = document.getElementById('taskContainer');
        taskContainer.innerHTML = '';
        list.forEach(item => {
          const it = document.createElement('div');
          it.className = 'taskItem';
          it.innerHTML = `
            <span class="taskTitle">${item.task.name || ''}</span>
            <span class="taskInfo">${item.task.notes || ''}</span>
            <span class="taskTimestamp">${item.task.lastDate || ''} ${item.task.lastTime || ''}</span>
          `;
          it.addEventListener('click', () => showTaskDetails(item.task, item.i));
          taskContainer.appendChild(it);
        });
        overlay5.classList.add('active');
      });
      container.appendChild(moreDiv);
    }
  };

  renderLimited(todaysList, targetTodays);
  renderLimited(upcomingList, targetUpcoming);
}

function handleSortChange(select) {
  const value = select.value;
  console.log("Selected:", value);
  localStorage.setItem("sort", value);
  renderTasks1(); // make sure this exists
  update();
  location.reload(true);
  formSubmit()
}

function renderTasks1() {
  const tasksPage = document.getElementById("tasksAll");
  tasksPage.innerHTML = ""; // clear before re-render

  TaskArray = JSON.parse(localStorage.getItem('tasks')) || [];

  // Get selected sort option
  const sortOption = localStorage.getItem("sort");

  // Sort based on option
  TaskArray.sort((a, b) => {
    // First, push done tasks to the bottom
    if (a.Done && !b.Done) return 1;
    if (!a.Done && b.Done) return -1;

    // Then apply the selected sort option
    if (sortOption === "name") {
      return (a.name || "").localeCompare(b.name || "");
    } else if (sortOption === "priority") {
      return (a.priority || "").localeCompare(b.priority || "");
    } else {
      // default: sort by date
      return new Date(a.lastDate || 0) - new Date(b.lastDate || 0);
    }
  });

  // Render tasks
  TaskArray.forEach((task, i) => {
    if (!task) return;

    const card = document.createElement("div");
    card.className = "task " + (task.priority || "");
    const dateLabel = todayTask(task) ? "Today" : (task.lastDate || "");
    if (task.Done) card.classList.add("done");

    card.innerHTML = `
      <div class="task-row1">
        <span class="task-title">${task.name || ""}</span>
        <span class="task-priority">${task.priority || ""}</span>
      </div>
      <div class="task-row2">
        <span class="task-date">${dateLabel}</span>
        <span class="task-time">${task.lastTime || ""}</span>
        <div>
          <button class="mark-done" data-index="${i}">Mark Done</button>
          <button class="delete-task" data-index="${i}">Delete</button>
        </div>
      </div>
    `;
    card.querySelector('.delete-task').addEventListener('click', () => {
      const deletepopup = document.getElementById('overlay3');
      deletepopup.classList.add('active');
      const yesBtn = document.getElementById('confirmDelete');
      const noBtn = document.getElementById('cancelDelete');
      yesBtn.onclick = () => {
        TaskArray.splice(i, 1);
        localStorage.setItem('tasks', JSON.stringify(TaskArray));
        renderTasks1(); deletepopup.classList.remove('active');
        homepage();
        update();
        location.reload(true);
        formSubmit()
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
        renderTasks1();
        markDonePopup.classList.remove('active');
        homepage();
        update();
        location.reload(true);
        formSubmit()
      }

      cancelBtn.onclick = () => {
        markDonePopup.classList.remove('active');
      }

    })
    // attach handlers (delete + mark done) and show details on card click
    card.addEventListener('click', (ev) => {
      if (ev.target.closest('button')) return;
      showTaskDetails(task, i);
    });
    tasksPage.appendChild(card);
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
    renderTasks1();
  }
  else if (idx === 3) {
    tasksDisplay.innerHTML = settingsPage.innerHTML;
  }
  else if (idx === 4) {
    tasksDisplay.innerHTML = profilePage.innerHTML;
    name2.value = localStorage.getItem('taskflow_name');
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
    dict.Done = false;
    console.log(dict);
    TaskArray.push(dict);
    localStorage.setItem('tasks', JSON.stringify(TaskArray));
    form.reset();
    overlay.classList.remove('active');
    setActiveNav(listButtons[1] || null);
    switchPage();
    formSubmit();
    update();
      location.reload(true);
  });
}

// Profile handling
const storedPfp = localStorage.getItem('taskflow_pfp');
const storedName = localStorage.getItem('taskflow_name');
const storedPhoneNo = localStorage.getItem('taskflow_phone_no')
if ((!storedPfp || !storedName || !storedPhoneNo) && overlay1) {overlay1.classList.add('active');
  localStorage.setItem('flag',0);
};

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
    const phoneno = document.getElementById('phoneno').value;
    const fileInput = document.getElementById('pfpUpload');
    let pfp = avatarSelect ? avatarSelect.value : null;
    if (fileInput && fileInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = ev => saveProfile(name, ev.target.result);
      reader.readAsDataURL(fileInput.files[0]);
    } else saveProfile(name, pfp, phoneno);
    fetchDataByPhone(phoneno);
    console.log("Response outside:", fetchedData);
    homepage();
  });
}

function saveProfile(name, pfp, phoneno) {
  localStorage.setItem('taskflow_name', name);
  localStorage.setItem('taskflow_phone_no', phoneno);
  if (pfp) localStorage.setItem('taskflow_pfp', pfp);
  if (overlay1) overlay1.classList.remove('active');
  displayProfile();
  homepage();
}

function displayProfile() {
  const n = localStorage.getItem('taskflow_name');
  const p = localStorage.getItem('taskflow_pfp');
  if (n && greetings_name) {
    greetings_name.textContent = `Hi ${n}`;
  };
  if (p && greetings_img) {
    greetings_img.src = p;
    greetings_img2.src = p
  };
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

// Show task details in overlay5
function showTaskDetails(task, index) {
  const overlay5 = document.getElementById('overlay5');
  const taskContainer = document.getElementById('taskContainer');
  if (!overlay5 || !taskContainer) return;
  // build details view
  taskContainer.innerHTML = '';
  const item = document.createElement('div');
  item.className = 'taskItem';
  item.innerHTML = `
    <div style="width:100%">
      <h3 class="taskTitle">${task.name || ''}</h3>
      <p class="taskInfo">${task.notes || ''}</p>
      <p class="taskTimestamp">${task.lastDate || ''} ${task.lastTime || ''} • ${task.priority || ''}</p>
      <div style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end">
        <button id="detailMarkDone" class="mark-done">Mark Done</button>
        <button id="detailDelete" class="delete-task">Delete</button>
      </div>
    </div>
  `;
  taskContainer.appendChild(item);
  overlay5.classList.add('active');

  // Attach detail buttons
  const del = document.getElementById('detailDelete');
  const md = document.getElementById('detailMarkDone');
  if (del) {
    del.addEventListener('click', () => {
      const deletepopup = document.getElementById('overlay3');
      deletepopup.classList.add('active');
      const yesBtn = document.getElementById('confirmDelete');
      const noBtn = document.getElementById('cancelDelete');
      yesBtn.onclick = () => {
        TaskArray.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(TaskArray));
        overlay5.classList.remove('active');
        renderTasks(); renderTasks1(); homepage();
        deletepopup.classList.remove('active');
        update();
      location.reload(true);
      }
      noBtn.onclick = () => deletepopup.classList.remove('active');
    });
  }
  if (md) {
    md.addEventListener('click', () => {
      TaskArray[index].Done = true;
      localStorage.setItem('tasks', JSON.stringify(TaskArray));
      overlay5.classList.remove('active');
      renderTasks(); renderTasks1(); homepage();
      update();
      location.reload(true);
    });
  }
}

// Close overlay5 when clicking outside the container
const overlay5El = document.getElementById('overlay5');
if (overlay5El) {
  overlay5El.addEventListener('click', (e) => {
    if (e.target === overlay5El) overlay5El.classList.remove('active');
  });
}


function update() {
  const localName = localStorage.getItem('taskflow_name');
  const localPhoneNo = localStorage.getItem('taskflow_phone_no')
  const JsonObject = { "name": localName, "phoneNo": localPhoneNo, "taskArray": JSON.stringify(TaskArray) }
  console.log("Json Object", JsonObject)
  const formname = document.getElementById("name");
  const formphoneno = document.getElementById('phoneNo');
  const formtaskArray = document.getElementById('taskArray')
  formname.value = JsonObject.name;
  formphoneno.value = JsonObject.phoneNo;
  formtaskArray.value = JsonObject.taskArray;
}
update();


setInterval(() => {
   if(localStorage.getItem('flag')==1){
      formSubmit();
   }
}, 2500);


