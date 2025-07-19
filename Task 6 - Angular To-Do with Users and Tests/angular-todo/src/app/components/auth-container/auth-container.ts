import { Component } from '@angular/core';
import { AuthFormComponent } from '../auth-form/auth-form';

@Component({
  selector: 'app-auth-container',
  imports: [AuthFormComponent],
  templateUrl: './auth-container.html',
  styleUrl: './auth-container.css',
})
export class AuthContainer {}
