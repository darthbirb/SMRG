import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  // get secret.txt
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const todosCollection = collection(db, "todos");

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const searchInput = document.getElementById('search-input');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const resetSearch = document.getElementById('reset-search');

let todos = [];

todoForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  const newTodo = { text, completed: false };

  try {
    const docRef = await addDoc(todosCollection, newTodo);
    todos.push({ id: docRef.id, ...newTodo });
    todoInput.value = '';
    renderTodos();
  } catch (error) {
    console.error("Error adding todo: ", error);
    alert("Could not save todo. Try again.");
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
  wrapper.className = 'd-flex justify-content-between align-items-center';

  const span = document.createElement('span');
  span.textContent = todo.text;

  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'btn-group';

  const completeBtn = document.createElement('button');
  completeBtn.className = 'btn btn-sm btn-success';
  completeBtn.textContent = todo.completed ? 'Undo' : 'Complete';

  completeBtn.onclick = async () => {
    todo.completed = !todo.completed;
    try {
      await updateDoc(doc(db, "todos", todo.id), { completed: todo.completed });
      renderTodos();
    } catch (err) {
      console.error("Failed to update todo status:", err);
      alert("Could not update todo. Try again.");
    }
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-sm btn-danger';
  deleteBtn.textContent = 'Delete';

  deleteBtn.onclick = async () => {
    if (!confirm("Delete this todo?")) return;
    try {
      await deleteDoc(doc(db, "todos", todo.id));
      todos = todos.filter(t => t.id !== todo.id);
      renderTodos();
    } catch (err) {
      console.error("Failed to delete todo:", err);
      alert("Could not delete todo.");
    }
  };

  buttonGroup.appendChild(completeBtn);
  buttonGroup.appendChild(deleteBtn);

  wrapper.appendChild(span);
  wrapper.appendChild(buttonGroup);
  li.appendChild(wrapper);

  return li;
}

async function fetchTodos() {
  try {
    const querySnapshot = await getDocs(todosCollection);
    todos = [];
    querySnapshot.forEach(docSnap => {
      todos.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderTodos();
  } catch (error) {
    console.error("Error fetching to-dos", error);
    alert("Could not load to-dos. Refresh!");
  }
}

fetchTodos();
