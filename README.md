# todoo-app — Todoo, a Basic To-Do List Web App

A beginner-friendly To-Do List with a pink-and-yellow theme, built with plain **HTML**, **CSS** and **vanilla JavaScript**.
No frameworks, no build tools, no external libraries. Tasks are stored in the browser's
**Local Storage**, so they are still there after you refresh the page.

## Features

- Add a new task (click **Add** or press **Enter**)
- Delete a task
- Mark a task as completed (tick the checkbox or click the task text) — completed tasks are shown with a line-through
- Tasks are saved in Local Storage and restored on page load
- Filter tasks: **All**, **Completed**, **Pending**
- Pink and yellow colour theme (pink card, borders and Delete button; yellow Add button, accents and hover states)

## Folder structure

```
todoo-app/
├── index.html   # the page structure (title, input, buttons, task list)
├── style.css    # all the styling (layout, colours, line-through)
├── script.js    # all the behaviour (add, delete, complete, save, filter)
└── README.md    # this file
```

Keeping the three languages in three files is the standard separation of concerns:
HTML = structure, CSS = appearance, JavaScript = behaviour.

## How to run the project

There is no server or install step needed.

**Option 1 — open the file directly**

Double-click `index.html`, or open it in your browser (`File > Open File...`).

**Option 2 — VS Code Live Server (recommended while learning)**

1. Install the "Live Server" extension in VS Code.
2. Right-click `index.html` → **Open with Live Server**.
3. The page reloads automatically every time you save a file.

**Option 3 — a tiny local server**

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## How the code works

### The task array is the source of truth

Everything the app knows lives in one array in `script.js`:

```js
var tasks = [
  { id: 1712345678901, text: "Buy milk", completed: false }
];
```

Every action (add / delete / complete) changes this array, then calls `saveTasks()`
and `showTasks()`. The screen is always a drawing of the array — never the other way round.

### Functions and why each one exists

| Function | Why it is needed |
| --- | --- |
| `showTasks()` | Clears the `<ul>` and rebuilds one `<li>` per visible task. Called after every change. |
| `addTask()` | Reads the input box, ignores empty text, pushes a new task object into the array. |
| `deleteTask(id)` | Removes one task using `filter()`, which returns a new array without that task. |
| `toggleTask(id)` | Flips `completed` between `true` and `false` with the `!` (not) operator. |
| `getVisibleTasks()` | Returns only the tasks the current filter allows. The full array is never modified. |
| `saveTasks()` | Writes the array into Local Storage. |
| `loadTasks()` | Reads the array back when the page opens. |
| `createDeleteHandler(id)` / `createToggleHandler(id)` | Build a click/change handler that remembers *which* task's button was pressed. |

### Where the DOM is manipulated

The DOM (Document Object Model) is the browser's live object version of your HTML.
All DOM work happens in `script.js`:

- `document.getElementById(...)` / `document.querySelectorAll(...)` — find elements (top of the file)
- `taskList.innerHTML = ""` — empty the list before redrawing (in `showTasks()`)
- `document.createElement(...)` — build the `<li>`, checkbox, `<span>` and Delete button
- `element.textContent = ...` — put text inside an element safely
- `listItem.appendChild(...)` / `taskList.appendChild(...)` — insert elements into the page
- `classList.add("completed")` / `classList.remove("hidden")` — switch CSS classes on and off
- `taskInput.value` — read and clear the input box

### How Local Storage works

`localStorage` is a small key/value store built into the browser. It is per website,
holds only **strings**, and the data survives refreshes and even closing the browser.

```js
localStorage.setItem("todoTasks", JSON.stringify(tasks)); // array -> string, save
var text = localStorage.getItem("todoTasks");             // read (null if nothing saved)
var tasks = JSON.parse(text);                             // string -> array
```

Because only strings can be stored, `JSON.stringify()` converts the array into text
and `JSON.parse()` converts it back. `loadTasks()` wraps `JSON.parse()` in `try/catch`
so a corrupted value cannot crash the app.

You can see the stored value yourself: **DevTools (F12) → Application → Local Storage**.

### Every event listener

| Element | Event | What happens |
| --- | --- | --- |
| `#add-button` | `click` | Runs `addTask()` |
| `#task-input` | `keydown` | If the pressed key is `Enter`, runs `addTask()` |
| Each row checkbox | `change` | Runs `toggleTask(id)` for that task |
| Each row task text | `click` | Runs `toggleTask(id)` for that task |
| Each row Delete button | `click` | Runs `deleteTask(id)` for that task |
| Each filter button | `click` | Sets `currentFilter` from `data-filter`, moves the `active` highlight, redraws |

An event listener means "when this event happens on this element, run this function".
Row listeners are attached inside `showTasks()`, because the rows are created there.

## JavaScript concepts used

- Variables (`var`) and objects (`{ id, text, completed }`)
- Arrays and array methods: `push()`, `filter()`, `forEach()`, `Array.isArray()`
- Functions, parameters and return values
- `for` loops, `if` statements, the `!` (not) operator, strict equality `===`
- Functions that return functions (**closures**) to remember a task's `id`
- DOM selection, creation and manipulation
- Events and event listeners
- JSON (`JSON.stringify`, `JSON.parse`) and the Local Storage API
- `try / catch` error handling
- `String.trim()` and `Date.now()`
- Data attributes (`data-filter`) read through `element.dataset`

## Possible future improvements

- Edit an existing task's text
- "Clear completed" button and a remaining-tasks counter
- Reorder tasks by drag and drop
- Due dates and priorities
- Dark mode
- Keyboard-only accessibility polish and ARIA labels
- Move storage from Local Storage to a real backend so tasks sync across devices
