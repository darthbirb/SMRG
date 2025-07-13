import { Component } from '@angular/core';
import { TodoForm } from "../todo-form/todo-form";
import { SearchBar } from "../search-bar/search-bar";
import { TodoList } from "../todo-list/todo-list";

@Component({
  selector: 'app-todo-container',
  imports: [TodoForm, SearchBar, TodoList],
  templateUrl: './todo-container.html',
  styleUrl: './todo-container.css'
})
export class TodoContainer {

}
