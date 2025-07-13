import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from '../models/todo.model';

@Component({
  selector: 'app-todo-list',
  imports: [],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.css',
})
export class TodoList {
  @Input() pendingTodos: Todo[] = [];
  @Input() completedTodos: Todo[] = [];
  @Output() toggleTodo = new EventEmitter<Todo>();
  @Output() deleteTodo = new EventEmitter<Todo>();

  protected onToggleTodo(todo: Todo): void {
    this.toggleTodo.emit(todo);
  }

  protected onDeleteTodo(todo: Todo): void {
    this.deleteTodo.emit(todo);
  }
}
