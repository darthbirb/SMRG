const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const searchInput = document.getElementById('search-input');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const resetSearch = document.getElementById('reset-search');

let todos = [];

todoForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (text) {
    todos.push({ text, completed: false });
    todoInput.value = '';
    renderTodos();
  }
});

searchInput.addEventListener('input', renderTodos);

resetSearch.addEventListener("click", clearSearch);

function clearSearch() {
  searchInput.value = '';
  renderTodos();
}

function renderTodos() {
  const searchTerm = searchInput.value.toLowerCase();

  const pending = todos.filter(t => !t.completed && t.text.toLowerCase().includes(searchTerm));
  const completed = todos.filter(t => t.completed);

  pendingList.innerHTML = '';
  completedList.innerHTML = '';

  pending.forEach(todo => {
    const li = createTodoElement(todo);
    pendingList.appendChild(li);
  });

  completed.forEach(todo => {
    const li = createTodoElement(todo);
    completedList.appendChild(li);
  });
}

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = 'list-group-item bg-dark-subtle';

  const wrapper = document.createElement('div');
  wrapper.className = 'todo-item';

  const span = document.createElement('span');
  span.textContent = todo.text;

  const button = document.createElement('button');
  button.className = 'btn btn-sm btn-success';
  button.textContent = todo.completed ? 'Undo' : 'Complete';

  button.onclick = () => {
    todo.completed = !todo.completed;
    renderTodos();
  };

  wrapper.appendChild(span);
  wrapper.appendChild(button);
  li.appendChild(wrapper);

  return li;
}

renderTodos();
