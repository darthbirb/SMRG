import { Component, signal, computed } from '@angular/core';
import { TodoForm } from '../todo-form/todo-form';
import { SearchBar } from '../search-bar/search-bar';
import { TodoList } from '../todo-list/todo-list';
import { Todo } from '../models/todo.model';

@Component({
  selector: 'app-todo-container',
  imports: [TodoForm, SearchBar, TodoList],
  templateUrl: './todo-container.html',
  styleUrl: './todo-container.css',
})
export class TodoContainer {
  // State management using signals
  protected readonly todos = signal<Todo[]>([]);
  protected readonly searchTerm = signal<string>('');

  // Computed values for filtered todos
  protected readonly pendingTodos = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.todos().filter(
      (todo) => !todo.completed && todo.text.toLowerCase().includes(search)
    );
  });

  protected readonly completedTodos = computed(() => {
    return this.todos().filter((todo) => todo.completed);
  });

  // Methods for todo operations
  protected addTodo(text: string): void {
    if (!text.trim()) return;

    const newTodo: Todo = {
      id: this.generateId(),
      text: text.trim(),
      completed: false,
    };

    this.todos.update((todos) => [...todos, newTodo]);
  }

  protected toggleTodo(todo: Todo): void {
    this.todos.update((todos) =>
      todos.map((t) =>
        t.id === todo.id ? { ...t, completed: !t.completed } : t
      )
    );
  }

  protected deleteTodo(todo: Todo): void {
    if (confirm('Delete this todo?')) {
      this.todos.update((todos) => todos.filter((t) => t.id !== todo.id));
    }
  }

  protected updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
