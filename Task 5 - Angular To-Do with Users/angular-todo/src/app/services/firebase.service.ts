import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap, map, catchError, of } from 'rxjs';
import { Todo } from '../models/todo.model';
import { firebaseConfig, projectId } from '../secrets';

interface AuthResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

interface FirestoreDocument {
  name: string;
  fields: {
    text: { stringValue: string };
    completed: { booleanValue: boolean };
  };
}

interface FirestoreResponse {
  documents?: FirestoreDocument[];
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private readonly firebaseConfig = firebaseConfig;
  private readonly projectId = projectId;
  private readonly baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/todos`;
  private idToken: string | null = null;

  constructor(private http: HttpClient) {}

  // Initialize Firebase with anonymous authentication
  initializeFirebase(): Observable<void> {
    return this.authenticateAnonymously().pipe(map(() => void 0));
  }

  // Anonymous authentication
  private authenticateAnonymously(): Observable<string> {
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.firebaseConfig.apiKey}`;
    const body = { returnSecureToken: true };

    return this.http.post<AuthResponse>(authUrl, body).pipe(
      map((response) => {
        this.idToken = response.idToken;
        return response.idToken;
      }),
      catchError((error) => {
        console.error('Authentication failed:', error);
        throw new Error('Could not authenticate with Firebase');
      })
    );
  }

  // Get authorization headers
  private getAuthHeaders(): HttpHeaders {
    if (!this.idToken) {
      throw new Error('Not authenticated');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${this.idToken}`,
      'Content-Type': 'application/json',
    });
  }

  // Fetch all todos
  getTodos(): Observable<Todo[]> {
    return this.http
      .get<FirestoreResponse>(this.baseUrl, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => {
          return (response.documents || []).map((doc) => {
            const id = doc.name.split('/').pop() || '';
            return {
              id,
              text: doc.fields.text.stringValue,
              completed: doc.fields.completed.booleanValue,
            };
          });
        }),
        catchError((error) => {
          console.error('Failed to fetch todos:', error);
          return of([]);
        })
      );
  }

  // Add a new todo
  addTodo(text: string): Observable<Todo> {
    const body = {
      fields: {
        text: { stringValue: text },
        completed: { booleanValue: false },
      },
    };

    return this.http
      .post<{ name: string }>(this.baseUrl, body, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => {
          const id = response.name.split('/').pop() || '';
          return {
            id,
            text,
            completed: false,
          };
        }),
        catchError((error) => {
          console.error('Failed to add todo:', error);
          throw new Error('Could not add todo');
        })
      );
  }

  // Toggle todo completion status
  toggleTodo(todo: Todo): Observable<Todo> {
    const url = `${this.baseUrl}/${todo.id}`;
    const body = {
      fields: {
        completed: { booleanValue: !todo.completed },
      },
    };

    return this.http
      .patch<{ name: string }>(`${url}?updateMask.fieldPaths=completed`, body, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map(() => ({
          ...todo,
          completed: !todo.completed,
        })),
        catchError((error) => {
          console.error('Failed to toggle todo:', error);
          throw new Error('Could not update todo');
        })
      );
  }

  // Delete a todo
  deleteTodo(todo: Todo): Observable<void> {
    const url = `${this.baseUrl}/${todo.id}`;

    return this.http
      .delete(url, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map(() => void 0),
        catchError((error) => {
          console.error('Failed to delete todo:', error);
          throw new Error('Could not delete todo');
        })
      );
  }
}
