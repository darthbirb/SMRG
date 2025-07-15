import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-todo-form',
  imports: [],
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.css',
})
export class TodoForm {
  @Output() addTodo = new EventEmitter<string>();

  protected readonly todoText = signal<string>('');

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const text = this.todoText();
    if (text.trim()) {
      this.addTodo.emit(text);
      this.todoText.set('');
    }
  }

  protected onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.todoText.set(target.value);
  }
}
