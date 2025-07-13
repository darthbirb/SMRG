import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoContainer } from "./todo-container/todo-container";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TodoContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular-todo');
}
