// ---------------------------------------------------------------
// Grab the elements we need from the page (DOM = Document Object Model,
// the browser's live representation of the HTML).
// ---------------------------------------------------------------
var taskInput = document.getElementById("task-input");
var addButton = document.getElementById("add-button");
var taskList = document.getElementById("task-list");
var emptyMessage = document.getElementById("empty-message");

// querySelectorAll() returns a list of every element matching the CSS selector
var filterButtons = document.querySelectorAll(".filter-button");

// Which filter is selected right now: "all", "completed" or "pending"
var currentFilter = "all";

// The key (name) under which our tasks are stored in Local Storage
var STORAGE_KEY = "todoTasks";

// The single source of truth: an array of task objects.
// Each task looks like { id: 1712345678901, text: "Buy milk", completed: false }
var tasks = [];

// ---------------------------------------------------------------
// Local Storage keeps small pieces of text in the browser, per website,
// and it survives page refreshes and browser restarts.
// It can only store strings, so we convert:
//   array  -> string  with JSON.stringify()
//   string -> array   with JSON.parse()
// ---------------------------------------------------------------
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// loadTasks() runs once when the page opens and restores what was saved.
function loadTasks() {
  var savedText = localStorage.getItem(STORAGE_KEY);

  // getItem() returns null when nothing was ever saved
  if (savedText === null) {
    return;
  }

  // If the stored text is somehow broken, JSON.parse() throws an error.
  // try/catch lets the app keep working instead of crashing.
  try {
    var savedTasks = JSON.parse(savedText);
    if (Array.isArray(savedTasks)) {
      tasks = savedTasks;
    }
  } catch (error) {
    tasks = [];
  }
}

// ---------------------------------------------------------------
// getVisibleTasks() returns only the tasks the current filter allows.
// The full "tasks" array is never changed by filtering, so switching back
// to "All" always shows everything again.
// ---------------------------------------------------------------
function getVisibleTasks() {
  if (currentFilter === "completed") {
    return tasks.filter(function (task) {
      return task.completed === true;
    });
  }

  if (currentFilter === "pending") {
    return tasks.filter(function (task) {
      return task.completed === false;
    });
  }

  return tasks; // "all"
}

// ---------------------------------------------------------------
// showTasks() draws the list on the page.
// Instead of adding/removing single <li> elements by hand, we clear the
// list and rebuild it from the tasks the current filter allows. That keeps
// what you see on screen and what is in the array always in sync.
// ---------------------------------------------------------------
function showTasks() {
  // DOM manipulation: empty the <ul> before redrawing it
  taskList.innerHTML = "";

  var visibleTasks = getVisibleTasks();

  for (var i = 0; i < visibleTasks.length; i++) {
    var task = visibleTasks[i];

    // Create one <li> per task
    var listItem = document.createElement("li");
    listItem.className = "task";

    // Adding the "completed" class is what makes the CSS cross out the text
    if (task.completed) {
      listItem.classList.add("completed");
    }

    // The checkbox used to mark a task done / not done
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed; // stay ticked after a redraw
    checkbox.addEventListener("change", createToggleHandler(task.id));

    // The task text itself
    var textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = task.text; // textContent is safe: it never runs HTML

    // The Delete button for this task
    var deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    // Each row gets its own click listener. The id is remembered because the
    // function is created inside this loop step (a "closure").
    deleteButton.addEventListener("click", createDeleteHandler(task.id));

    listItem.appendChild(checkbox);
    listItem.appendChild(textSpan);
    listItem.appendChild(deleteButton);

    // DOM manipulation: put the finished <li> inside the <ul>
    taskList.appendChild(listItem);
  }

  // Show the "No tasks to show." message only when nothing is visible
  if (visibleTasks.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }
}

// createToggleHandler() works like createDeleteHandler: it remembers the id
// of the task whose checkbox was clicked.
function createToggleHandler(id) {
  return function () {
    toggleTask(id);
  };
}

// ---------------------------------------------------------------
// toggleTask() flips one task between completed and pending.
// The "!" operator turns true into false and false into true.
// ---------------------------------------------------------------
function toggleTask(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].completed = !tasks[i].completed;
    }
  }

  saveTasks();
  showTasks();
}

// createDeleteHandler() returns the function that runs on click.
// We use a helper function so every button keeps its own task id.
function createDeleteHandler(id) {
  return function () {
    deleteTask(id);
  };
}

// ---------------------------------------------------------------
// deleteTask() removes one task from the array, then redraws.
// filter() builds a new array containing only the tasks we want to keep.
// ---------------------------------------------------------------
function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });

  saveTasks();
  showTasks();
}

// ---------------------------------------------------------------
// addTask() reads the input box and adds a new task to the array.
// ---------------------------------------------------------------
function addTask() {
  var text = taskInput.value.trim(); // trim() removes accidental spaces

  // Ignore empty input so the list never gets blank rows
  if (text === "") {
    return;
  }

  tasks.push({
    id: Date.now(), // Date.now() gives a number we can use as a unique id
    text: text,
    completed: false,
  });

  taskInput.value = ""; // clear the box, ready for the next task
  saveTasks(); // remember the new task for next time
  showTasks(); // redraw so the new task appears
}

// ---------------------------------------------------------------
// Event listeners: "when this happens, run that function".
// ---------------------------------------------------------------

// Clicking the Add button adds the task
addButton.addEventListener("click", addTask);

// One click listener per filter button.
// forEach() runs the given function once for every button in the list.
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    // dataset reads the data-filter="..." attribute from the HTML
    currentFilter = button.dataset.filter;

    // Move the "active" highlight to the button that was just clicked
    filterButtons.forEach(function (otherButton) {
      otherButton.classList.remove("active");
    });
    button.classList.add("active");

    showTasks(); // redraw with the new filter applied
  });
});

// Pressing Enter inside the input box also adds the task
taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

// When the page loads: read the saved tasks, then draw them
loadTasks();
showTasks();
