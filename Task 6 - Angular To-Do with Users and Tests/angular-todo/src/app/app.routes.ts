import { Routes } from '@angular/router';
import { AuthFormComponent } from './components/auth-form/auth-form';
import { AuthContainer } from './components/auth-container/auth-container';

export const routes: Routes = [
  {
    path: '',
    component: AuthContainer,
    children: [
      {
        path: '',
        component: AuthFormComponent,
      },
    ],
  },
  {
    path: 'todos',
    loadComponent: () =>
      import('./components/todo-container/todo-container').then(
        (m) => m.TodoContainer
      ),
  },
];
