import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, of } from "rxjs";
import { Person } from "../../../shared/models/person.model";

@Injectable({
  providedIn: "root",
})
export class PersonApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = "http://localhost:3000/persons";

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error("Error fetching persons:", error);
        return of([]);
      }),
    );
  }

  getPersonById(id: string): Observable<Person | null> {
    return this.http.get<Person>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error("Error fetching person:", error);
        return of(null);
      }),
    );
  }

  createPerson(
    personData: Omit<Person, "id" | "createdAt" | "updatedAt">,
  ): Observable<Person> {
    const newPerson: Omit<Person, "id"> = {
      ...personData,
      createdAt: new Date().toISOString(),
    };

    return this.http.post<Person>(this.apiUrl, newPerson).pipe(
      catchError((error) => {
        console.error("Error creating person:", error);
        throw error;
      }),
    );
  }

  updatePerson(id: string, updates: Partial<Person>): Observable<Person> {
    const updatedPerson = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.http.patch<Person>(`${this.apiUrl}/${id}`, updatedPerson).pipe(
      catchError((error) => {
        console.error("Error updating person:", error);
        throw error;
      }),
    );
  }

  deletePerson(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error("Error deleting person:", error);
        throw error;
      }),
    );
  }
}
