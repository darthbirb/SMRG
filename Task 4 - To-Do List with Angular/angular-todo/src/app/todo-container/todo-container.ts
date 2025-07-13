import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { TodoForm } from '../todo-form/todo-form';
import { SearchBar } from '../search-bar/search-bar';
import { TodoList } from '../todo-list/todo-list';
import { Todo } from '../models/todo.model';
import { FirebaseService } from '../services/firebase.service';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-todo-container',
  imports: [TodoForm, SearchBar, TodoList],
  templateUrl: './todo-container.html',
  styleUrl: './todo-container.css',
})
export class TodoContainer implements OnInit {
  private readonly firebaseService = inject(FirebaseService);

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

  ngOnInit(): void {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    this.firebaseService
      .initializeFirebase()
      .pipe(
        switchMap(() => this.firebaseService.getTodos()),
        catchError((error) => {
          console.error('Failed to initialize Firebase:', error);
          return [];
        })
      )
      .subscribe((todos) => {
        this.todos.set(todos);
      });
  }

  // Methods for todo operations
  protected addTodo(text: string): void {
    if (!text.trim()) return;

    this.firebaseService
      .addTodo(text)
      .pipe(
        catchError((error) => {
          console.error('Could not add todo:', error);
          throw error;
        })
      )
      .subscribe((newTodo) => {
        this.todos.update((todos) => [...todos, newTodo]);
      });
  }

  protected toggleTodo(todo: Todo): void {
    this.firebaseService
      .toggleTodo(todo)
      .pipe(
        catchError((error) => {
          console.error('Could not update todo:', error);
          throw error;
        })
      )
      .subscribe((updatedTodo) => {
        this.todos.update((todos) =>
          todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
        );
      });
  }

  protected deleteTodo(todo: Todo): void {
    if (confirm('Delete this todo?')) {
      this.firebaseService
        .deleteTodo(todo)
        .pipe(
          catchError((error) => {
            console.error('Could not delete todo:', error);
            throw error;
          })
        )
        .subscribe(() => {
          this.todos.update((todos) => todos.filter((t) => t.id !== todo.id));
        });
    }
  }

  protected updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
  }
}
