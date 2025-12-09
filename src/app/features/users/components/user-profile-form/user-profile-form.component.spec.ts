import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { UserProfileFormComponent } from "./user-profile-form.component";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { of, throwError } from "rxjs";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("UserProfileFormComponent", () => {
  let component: UserProfileFormComponent;
  let fixture: ComponentFixture<UserProfileFormComponent>;
  let userService: UserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileFormComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize form with empty values", () => {
    expect(component.userForm.get("name")?.value).toBe("");
    expect(component.userForm.get("email")?.value).toBe("");
    expect(component.userForm.get("role")?.value).toBe("developer");
  });

  it("should render form fields", () => {
    const nameInput = fixture.debugElement.query(
      By.css('input[formControlName="name"]'),
    );
    const emailInput = fixture.debugElement.query(
      By.css('input[formControlName="email"]'),
    );
    const roleSelect = fixture.debugElement.query(
      By.css('mat-select[formControlName="role"]'),
    );

    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(roleSelect).toBeTruthy();
  });

  it("should validate required fields", () => {
    const nameControl = component.userForm.get("name");
    const emailControl = component.userForm.get("email");
    const roleControl = component.userForm.get("role");

    expect(nameControl?.valid).toBe(false);
    expect(emailControl?.valid).toBe(false);
    expect(roleControl?.valid).toBe(true);

    nameControl?.setValue("John Doe");
    emailControl?.setValue("john@example.com");

    expect(nameControl?.valid).toBe(true);
    expect(emailControl?.valid).toBe(true);
  });

  it("should validate email format", () => {
    const emailControl = component.userForm.get("email");

    emailControl?.setValue("invalid-email");
    expect(emailControl?.valid).toBe(false);
    expect(emailControl?.hasError("email")).toBe(true);

    emailControl?.setValue("valid@example.com");
    expect(emailControl?.valid).toBe(true);
  });

  it("should validate name minimum length", () => {
    const nameControl = component.userForm.get("name");

    nameControl?.setValue("A");
    expect(nameControl?.valid).toBe(false);
    expect(nameControl?.hasError("minlength")).toBe(true);

    nameControl?.setValue("AB");
    expect(nameControl?.valid).toBe(true);
  });

  it("should display error messages when fields are touched", () => {
    const nameControl = component.userForm.get("name");
    nameControl?.markAsTouched();
    fixture.detectChanges();

    const errorMessage = component.getFieldError("name");
    expect(errorMessage).toBe("Name is required");
  });

  it("should create user on valid form submission", () => {
    const createUserSpy = vi.spyOn(userService, "createUser").mockReturnValue(
      of({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "developer",
        createdAt: "2025-01-01",
      }),
    );

    component.userForm.patchValue({
      name: "John Doe",
      email: "john@example.com",
      role: "developer",
    });

    component.onSubmit();

    expect(createUserSpy).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      role: "developer",
    });
  });

  it("should handle error on form submission", () => {
    const createUserSpy = vi
      .spyOn(userService, "createUser")
      .mockReturnValue(throwError(() => new Error("API Error")));

    component.userForm.patchValue({
      name: "John Doe",
      email: "john@example.com",
      role: "developer",
    });

    component.onSubmit();

    expect(createUserSpy).toHaveBeenCalled();
    expect(component.error()).toBe(
      "Failed to create user profile. Please try again.",
    );
    expect(component.isLoading()).toBe(false);
  });

  it("should not submit invalid form", () => {
    const createUserSpy = vi.spyOn(userService, "createUser");

    component.onSubmit();

    expect(createUserSpy).not.toHaveBeenCalled();
    expect(component.userForm.get("name")?.touched).toBe(true);
    expect(component.userForm.get("email")?.touched).toBe(true);
  });

  it("should navigate to dashboard on cancel", () => {
    const routerSpy = vi.spyOn(router, "navigate");

    component.onCancel();

    expect(routerSpy).toHaveBeenCalledWith(["/dashboard"]);
  });

  it("should display loading state during submission", () => {
    vi.spyOn(userService, "createUser").mockReturnValue(
      of({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "developer",
        createdAt: "2025-01-01",
      }),
    );

    component.userForm.patchValue({
      name: "John Doe",
      email: "john@example.com",
      role: "developer",
    });

    component.isLoading.set(true);
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(
      By.css('button[color="primary"]'),
    );
    expect(submitButton.nativeElement.disabled).toBe(true);

    component.isLoading.set(false);
  });

  it("should have all role options", () => {
    expect(component.roles).toEqual([
      { value: "admin", label: "Admin" },
      { value: "developer", label: "Developer" },
      { value: "manager", label: "Manager" },
      { value: "viewer", label: "Viewer" },
    ]);
  });
});
