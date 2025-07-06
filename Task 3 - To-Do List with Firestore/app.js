import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { firebaseConfig, projectId } from './secrets.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/todos`;

let idToken = null;
let todos = [];

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const searchInput = document.getElementById('search-input');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const resetSearch = document.getElementById('reset-search');

signInAnonymously(auth)
  .then(async (userCredential) => {
    const user = userCredential.user;
    idToken = await user.getIdToken();
    fetchTodos();
  })
  .catch((error) => {
    console.error("Auth failed:", error);
    alert("Could not sign in.");
  });

todoForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  try {
    await addTodo(text);
    todoInput.value = '';
  } catch (error) {
    console.error("Add failed:", error);
    alert("Could not save todo.");
  }
});

searchInput.addEventListener('input', renderTodos);
resetSearch.addEventListener("click", () => {
  searchInput.value = '';
  renderTodos();
});

async function addTodo(text) {
  const body = {
    fields: {
      text: { stringValue: text },
      completed: { booleanValue: false }
    }
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error("Failed to add todo");

  const data = await response.json();
  const id = data.name.split("/").pop();
  todos.push({ id, text, completed: false });
  renderTodos();
}

async function fetchTodos() {
  const response = await fetch(baseUrl, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!response.ok) {
    console.error("Fetch error:", await response.text());
    alert("Failed to fetch todos.");
    return;
  }

  const data = await response.json();
  todos = (data.documents || []).map(doc => {
    const id = doc.name.split("/").pop();
    return {
      id,
      text: doc.fields.text.stringValue,
      completed: doc.fields.completed.booleanValue
    };
  });

  renderTodos();
}

async function toggleTodoCompleted(todo) {
  const url = `${baseUrl}/${todo.id}`;
  const body = {
    fields: {
      completed: { booleanValue: !todo.completed }
    }
  };

  const response = await fetch(`${url}?updateMask.fieldPaths=completed`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error("Failed to update");

  todo.completed = !todo.completed;
  renderTodos();
}

async function deleteTodo(todo) {
  const url = `${baseUrl}/${todo.id}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!response.ok) throw new Error("Failed to delete");

  todos = todos.filter(t => t.id !== todo.id);
  renderTodos();
}

function renderTodos() {
  const searchTerm = searchInput.value.toLowerCase();
  const pending = todos.filter(t => !t.completed && t.text.toLowerCase().includes(searchTerm));
  const completed = todos.filter(t => t.completed);

  pendingList.innerHTML = '';
  completedList.innerHTML = '';

  pending.forEach(todo => {
    pendingList.appendChild(createTodoElement(todo));
  });

  completed.forEach(todo => {
    completedList.appendChild(createTodoElement(todo));
  });
}

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = 'list-group-item bg-dark-subtle';

  const wrapper = document.createElement('div');
  wrapper.className = 'd-flex justify-content-between align-items-center';

  const span = document.createElement('span');
  span.textContent = todo.text;

  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'btn-group';

  const completeBtn = document.createElement('button');
  completeBtn.className = 'btn btn-sm btn-success';
  completeBtn.textContent = todo.completed ? 'Undo' : 'Complete';

  completeBtn.onclick = () => toggleTodoCompleted(todo);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-sm btn-danger';
  deleteBtn.textContent = 'Delete';

  deleteBtn.onclick = () => {
    if (confirm("Delete this todo?")) {
      deleteTodo(todo);
    }
  };

  buttonGroup.appendChild(completeBtn);
  buttonGroup.appendChild(deleteBtn);

  wrapper.appendChild(span);
  wrapper.appendChild(buttonGroup);
  li.appendChild(wrapper);

  return li;
}
