let TaskArray = [];

if (localStorage.getItem("tasks")) {
    TaskArray = JSON.parse(localStorage.getItem("tasks"));
} else {
    localStorage.setItem("tasks", JSON.stringify(TaskArray));
}

console.log(TaskArray);

TaskArray.sort((a, b) => new Date(a.lastDate) - new Date(b.lastDate));

const listButtons = document.querySelectorAll(".list");
const overlay = document.getElementById("overlay");

function activeLink() {
    listButtons.forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");
    if (this.id !== "addButton") {
        overlay.classList.remove("active");
    } else {
        overlay.classList.add("active");
    }
}
listButtons.forEach((btn) => btn.addEventListener("click", activeLink));

const date = new Date();
const hour = date.getHours();
console.log(hour);
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0");
const day = String(date.getDate()).padStart(2, "0");
const today = year + "-" + month + "-" + day;
console.log(today);

const greeting = document.getElementById("greeting");

if (hour > 0 && hour < 12) {
    greeting.innerHTML = "Good Morning";
} else if (hour > 12 && hour < 18) {
    greeting.innerHTML = "Good Afternoon";
} else {
    greeting.innerHTML = "Good Evening";
}

function todayTask(task, today) {
    if (task.lastDate === today) {
        return true;
    } else {
        return false;
    }
}

const todays_tasks = document.getElementById("todays_tasks");
const upcoming_tasks = document.getElementById("upcoming_tasks");

for (let i = 0; i < TaskArray.length; i++) {
    let task = TaskArray[i];
    let newDiv = document.createElement('div');
    newDiv.classList.add('task', task.priority);

    let dateLabel = todayTask(task, today) ? "Today" : task.lastDate;

    newDiv.innerHTML = `
        <div class="task-row">
            <span class="task-title">${task.name}</span>
            <span class="task-priority">${task.priority}</span>
        </div>
        <div class="task-row">
            <span class="task-date"> ${dateLabel}</span>
            <span class="task-time"> ${task.lastTime}</span>
        </div>
    `;

    if (todayTask(task, today)) {
        todays_tasks.appendChild(newDiv);
    } else {
        upcoming_tasks.appendChild(newDiv);
    }
}

    const closeOverlay = document.getElementById("closeOverlay");
    const addBtn = document.getElementById("addTask");
    const btns = document.querySelectorAll(".list");

    addBtn.addEventListener("click", (e) => {
        overlay.classList.add("active");
    });
    closeOverlay.addEventListener("click", (e) => {
        overlay.classList.remove("active");
    });

    const form = document.getElementById("addTaskForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const dict = Object.fromEntries(data.entries());
        console.log(dict);
        TaskArray.push(dict);
        localStorage.setItem("tasks", JSON.stringify(TaskArray));
        window.location.reload();
    });

    const pfp = localStorage.getItem("taskflow_pfp");
    const name = localStorage.getItem("taskflow_name");

    const overlay1 = document.getElementById("overlay1");
    const loginForm = document.getElementById("loginForm");
    const profileDiv = document.getElementById("profile");
    const avatarSelect = document.getElementById("avatarSelect");
    const greetings_img = document.getElementById("greetings_img");
    const greetings_name = document.getElementById("greetings_name");

    if (!pfp || !name) {
        overlay1.classList.add("active");
    }

    // Avatar selection sync with hidden select
    document.querySelectorAll(".avatar-options img").forEach((img) => {
        img.addEventListener("click", () => {
            document
                .querySelectorAll(".avatar-options img")
                .forEach((i) => i.classList.remove("selected"));
            img.classList.add("selected");
            avatarSelect.value = img.dataset.value;
        });
    });

    // Save profile
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("username").value;
        const fileInput = document.getElementById("pfpUpload");
        let pfp = avatarSelect.value;

        if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function (event) {
                pfp = event.target.result;
                saveProfile(name, pfp);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveProfile(name, pfp);
        }
    });

    function saveProfile(name, pfp) {
        localStorage.setItem("taskflow_name", name);
        if (pfp) localStorage.setItem("taskflow_pfp", pfp);
        overlay1.classList.remove("active");
        displayProfile();
    }

    function displayProfile() {
        const name = localStorage.getItem("taskflow_name");
        const pfp = localStorage.getItem("taskflow_pfp");
        if (name) {
            greetings_name.innerHTML = `Hi ${name}`;
        }
        if (pfp) {
            greetings_img.src = pfp;
        }
    }

    window.onload = displayProfile;




function TasksSearched(value) {
    const newData = [];

    for (let i = 0; i < TaskArray.length; i++) {
        let name = TaskArray[i].name.toLowerCase();
        let search = value.toLowerCase();

        if (name.includes(search)) {
            newData.push(TaskArray[i]);
        }
    }
    return newData;
}

const tasks_container = document.getElementById("tasks_display");
const search_input = document.getElementById("search_input");

search_input.addEventListener('input', e => {
    const search = e.target.value.trim().toLowerCase();
    tasks_container.innerHTML = "";
    if (search.length === 0) {
        window.location.reload()
        return; 
    }
    const newDataSearched = TasksSearched(search);
    if (newDataSearched.length === 0) {
        tasks_container.innerHTML = `<p class="no-results">No tasks found</p>`;
    } else {
        for (let i = 0; i < newDataSearched.length; i++) {
            let task = newDataSearched[i];
            let newDiv = document.createElement('div');
            newDiv.classList.add('task', task.priority);

            let dateLabel = todayTask(task, today) ? "Today" : task.lastDate;

            newDiv.innerHTML = `
                <div class="task-row">
                    <span class="task-title">${task.name}</span>
                    <span class="task-priority">${task.priority}</span>
                </div>
                <div class="task-row">
                    <span class="task-date">${dateLabel}</span>
                    <span class="task-time">${task.lastTime}</span>
                </div>
            `;
            tasks_container.appendChild(newDiv);
        }
    }
});

