import { describe, expect, it, beforeEach } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection, ComponentRef } from "@angular/core";
import { DashboardStats } from "./dashboard-stats";

describe("DashboardStats", () => {
  let component: DashboardStats;
  let componentRef: ComponentRef<DashboardStats>;
  let fixture: ComponentFixture<DashboardStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardStats],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardStats);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput("total", 8);
    componentRef.setInput("todo", 3);
    componentRef.setInput("inProgress", 2);
    componentRef.setInput("completed", 3);
    componentRef.setInput("overdue", 1);
    componentRef.setInput("completionRate", 38);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should display all stat values", () => {
    const values = fixture.nativeElement.querySelectorAll(".stat-value");
    const texts = Array.from(values).map((v: unknown) =>
      (v as HTMLElement).textContent?.trim(),
    );
    expect(texts).toContain("8");
    expect(texts).toContain("3");
    expect(texts).toContain("2");
    expect(texts).toContain("38%");
  });
});
