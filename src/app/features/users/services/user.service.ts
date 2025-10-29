import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError } from "rxjs";
import { User } from "../../../shared/models/user.model";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = "http://localhost:3000/users";

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error("Error fetching users:", error);
        throw error;
      }),
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error("Error fetching user:", error);
        throw error;
      }),
    );
  }

  createUser(userData: Omit<User, "id" | "createdAt">): Observable<User> {
    const newUser: Omit<User, "id"> = {
      ...userData,
      createdAt: new Date().toISOString(),
    };

    return this.http.post<User>(this.apiUrl, newUser).pipe(
      catchError((error) => {
        console.error("Error creating user:", error);
        throw error;
      }),
    );
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, updates).pipe(
      catchError((error) => {
        console.error("Error updating user:", error);
        throw error;
      }),
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error("Error deleting user:", error);
        throw error;
      }),
    );
  }
}
