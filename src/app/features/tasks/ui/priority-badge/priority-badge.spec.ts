import { describe, expect, it, beforeEach } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { PriorityBadge } from "./priority-badge";
import { ComponentRef } from "@angular/core";

describe("PriorityBadge", () => {
  let component: PriorityBadge;
  let componentRef: ComponentRef<PriorityBadge>;
  let fixture: ComponentFixture<PriorityBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriorityBadge],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PriorityBadge);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput("priority", "high");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should display the priority text", () => {
    const badge = fixture.nativeElement.querySelector(".badge");
    expect(badge.textContent.trim()).toBe("high");
  });

  it("should apply the correct CSS class", () => {
    const badge = fixture.nativeElement.querySelector(".badge");
    expect(badge.classList.contains("badge--high")).toBe(true);
  });
});
