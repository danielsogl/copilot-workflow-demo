import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { UserService } from "./user.service";
import { User } from "../../../shared/models/user.model";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("UserService", () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = "http://localhost:3000/users";

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should fetch all users", () => {
    const mockUsers: User[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
        createdAt: "2025-01-01",
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "developer",
        createdAt: "2025-01-02",
      },
    ];

    service.getUsers().subscribe((users) => {
      expect(users).toEqual(mockUsers);
      expect(users.length).toBe(2);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe("GET");
    req.flush(mockUsers);
  });

  it("should fetch user by id", () => {
    const mockUser: User = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      createdAt: "2025-01-01",
    };

    service.getUserById("1").subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe("GET");
    req.flush(mockUser);
  });

  it("should create a new user", () => {
    const newUserData = {
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "developer" as const,
    };

    const createdUser: User = {
      id: "3",
      ...newUserData,
      createdAt: "2025-01-03",
    };

    service.createUser(newUserData).subscribe((user) => {
      expect(user).toEqual(createdUser);
      expect(user.id).toBe("3");
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe("POST");
    expect(req.request.body.name).toBe(newUserData.name);
    expect(req.request.body.email).toBe(newUserData.email);
    expect(req.request.body.role).toBe(newUserData.role);
    expect(req.request.body.createdAt).toBeDefined();
    req.flush(createdUser);
  });

  it("should update a user", () => {
    const updates: Partial<User> = {
      name: "John Updated",
      role: "manager",
    };

    const updatedUser: User = {
      id: "1",
      name: "John Updated",
      email: "john@example.com",
      role: "manager",
      createdAt: "2025-01-01",
    };

    service.updateUser("1", updates).subscribe((user) => {
      expect(user).toEqual(updatedUser);
      expect(user.name).toBe("John Updated");
      expect(user.role).toBe("manager");
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual(updates);
    req.flush(updatedUser);
  });

  it("should delete a user", () => {
    service.deleteUser("1").subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe("DELETE");
    req.flush(null);
  });

  it("should handle error when fetching users", () => {
    service.getUsers().subscribe({
      next: () => {
        throw new Error("should have failed");
      },
      error: (error) => {
        expect(error).toBeDefined();
      },
    });

    const req = httpMock.expectOne(apiUrl);
    req.error(new ProgressEvent("error"));
  });

  it("should handle error when creating user", () => {
    const newUserData = {
      name: "Bob",
      email: "bob@example.com",
      role: "viewer" as const,
    };

    service.createUser(newUserData).subscribe({
      next: () => {
        throw new Error("should have failed");
      },
      error: (error) => {
        expect(error).toBeDefined();
      },
    });

    const req = httpMock.expectOne(apiUrl);
    req.error(new ProgressEvent("error"));
  });
});
