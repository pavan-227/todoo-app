---
name: testing-static-todo-app
description: How to run and end-to-end test the static todoo-app To-Do List (plain HTML/CSS/vanilla JS, no build step) in a browser, including localStorage and console-error verification.
---

# Testing the static To-Do List app (todoo-app)

## Serving the app
There is no build step and no dependencies. Serve over HTTP (never `file://`, or `localStorage`
behaves inconsistently across browsers):

```bash
nohup python3 -m http.server 8000 --directory /path/to/todoo-app > /tmp/http.log 2>&1 &
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000   # expect 200
```

Open `http://localhost:8000/`. When typing into the Chrome omnibox with a keyboard driver, type the
full `http://localhost:8000/` — typing `localhost:8000` alone may lose the colon and turn into a
Google search.

## Devin Secrets Needed
None. The app is fully static and requires no credentials or network access.

## Test preconditions
Always clear persisted state before a run, otherwise leftover tasks make row-count assertions
ambiguous:

```js
localStorage.clear(); location.reload();
```

## Key selectors / DOM contract (as of the initial implementation)
- Input: `#task-input`; Add button: `#add-button`
- Filters: `.filter-button[data-filter="all"|"completed"|"pending"]`; the selected one gets class `active`
- List: `#task-list > li.task`, each with `input[type=checkbox]`, `span.task-text`, `button.delete-button`
- `span.task-text` is also clickable and toggles completion, exactly like the checkbox
- Completed rows get class `completed` on the `<li>`; CSS applies `line-through` + `#9b8791` to `.task.completed .task-text`
- Empty state: `#empty-message` ("No tasks to show.") toggled via the `hidden` class
- Persistence: `localStorage` key `todoTasks`, a JSON array of `{id, text, completed}`

## Objective assertions worth reusing
Row/style state in one eval (avoids judging line-through from a screenshot):

```js
[...document.querySelectorAll('#task-list li')].map(li => {
  const s = li.querySelector('.task-text'), c = getComputedStyle(s);
  return {text: s.textContent, cls: li.className,
          checked: li.querySelector('input').checked,
          deco: c.textDecorationLine, color: c.color};
});
```
Expected: pending → `deco:"none"`, `color:"rgb(61, 36, 48)"`; completed → `deco:"line-through"`,
`color:"rgb(155, 135, 145)"`. Active filter button → background `rgb(255, 105, 180)`, color `rgb(255, 255, 255)`.

Stored state: `JSON.parse(localStorage.getItem('todoTasks'))`.

## Adversarial checks that matter for this app
- **Delete the middle row of 3+** — deleting the last row would pass even with a broken id match.
- **Task ids come from `Date.now()`**, so two tasks added within the same millisecond would share an
  id and one Delete could remove both. This was not reproducible via keyboard-driven adds (ids landed
  ~40 ms apart), but if you ever see two rows vanish on one Delete, check for duplicate ids first;
  a counter or `crypto.randomUUID()` would be the fix.
- **Filter that matches nothing** must show "No tasks to show." — easy thing for a rebuild-the-list
  implementation to get wrong.
- **Filter is intentionally not persisted**: after reload it resets to All. Do not report that as a bug
  unless the requirements say otherwise.

## Console-error verification
Open DevTools (F12) → Console, and check the **Issues** panel counters (red = errors, yellow =
warnings, blue = informational). Chrome reports one *informational* "A form field element should have
an id or name attribute" issue per dynamically created checkbox — that is not a JS error or warning,
so assert on the red/yellow counters being 0 rather than on the total issue count. Enable
"Preserve log" if you need messages to survive a reload.
