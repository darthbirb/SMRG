import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './auth-form.html',
  styleUrls: ['./auth-form.css'],
})
export class AuthFormComponent {
  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  protected readonly isLogin = signal(true);
  protected readonly error = signal<string>('');
  protected readonly authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected toggleMode() {
    this.isLogin.update((v) => !v);
    this.error.set('');
  }

  protected onSubmit() {
    if (this.authForm.valid) {
      const email = this.authForm.value.email ?? '';
      const password = this.authForm.value.password ?? '';
      this.error.set('');
      const auth$ = this.isLogin()
        ? this.firebaseService.loginWithEmail(email, password)
        : this.firebaseService.signUpWithEmail(email, password);
      auth$.subscribe({
        next: () => {
          this.router.navigate(['/todos']);
        },
        error: (err) => {
          const msg =
            err && err.message ? String(err.message) : 'Authentication failed';
          this.error.set(msg || 'Authentication failed');
        },
      });
    }
  }
}
