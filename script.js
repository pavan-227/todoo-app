// ---------------------------------------------------------------
// Grab the elements we need from the page (DOM = Document Object Model,
// the browser's live representation of the HTML).
// ---------------------------------------------------------------
var taskInput = document.getElementById("task-input");
var addButton = document.getElementById("add-button");
var taskList = document.getElementById("task-list");
var emptyMessage = document.getElementById("empty-message");

// The single source of truth: an array of task objects.
// Each task looks like { id: 1712345678901, text: "Buy milk", completed: false }
var tasks = [];

// ---------------------------------------------------------------
// showTasks() draws the whole list on the page.
// Instead of adding/removing single <li> elements by hand, we clear the
// list and rebuild it from the "tasks" array. That keeps what you see on
// screen and what is in the array always in sync.
// ---------------------------------------------------------------
function showTasks() {
  // DOM manipulation: empty the <ul> before redrawing it
  taskList.innerHTML = "";

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

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

  // Show the "No tasks to show." message only when the list is empty
  if (tasks.length === 0) {
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
  showTasks(); // redraw so the new task appears
}

// ---------------------------------------------------------------
// Event listeners: "when this happens, run that function".
// ---------------------------------------------------------------

// Clicking the Add button adds the task
addButton.addEventListener("click", addTask);

// Pressing Enter inside the input box also adds the task
taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

// Draw the (currently empty) list once when the page loads
showTasks();
