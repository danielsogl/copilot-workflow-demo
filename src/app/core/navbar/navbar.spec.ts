import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection, signal } from "@angular/core";
import { provideRouter } from "@angular/router";
import { MockProvider } from "ng-mocks";
import { ColorModeService } from "../color-mode/color-mode-service";
import { Navbar } from "./navbar";

describe("Navbar", () => {
  let fixture: ComponentFixture<Navbar>;
  let cycleColorMode: ReturnType<typeof vi.fn>;

  function setup(effectiveColorMode: "light" | "dark") {
    cycleColorMode = vi.fn();

    TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        MockProvider(ColorModeService, {
          effectiveColorMode: signal(effectiveColorMode),
          effectiveColorModeIcon: signal(
            effectiveColorMode === "dark" ? "dark_mode" : "light_mode",
          ),
          toggleLabel: signal(`Color mode: ${effectiveColorMode}`),
          cycleColorMode,
        } as Partial<InstanceType<typeof ColorModeService>>),
      ],
    });

    fixture = TestBed.createComponent(Navbar);
    fixture.detectChanges();
  }

  it("should call cycleColorMode when the color mode toggle is clicked", () => {
    setup("light");

    const button = fixture.nativeElement.querySelector(".color-mode-toggle");
    button.click();

    expect(cycleColorMode).toHaveBeenCalledOnce();
  });

  it("should show the dark_mode icon when the effective color mode is dark", () => {
    setup("dark");

    const icon = fixture.nativeElement.querySelector(
      ".color-mode-toggle mat-icon",
    );
    expect(icon.textContent.trim()).toBe("dark_mode");
  });

  it("should show the light_mode icon when the effective color mode is light", () => {
    setup("light");

    const icon = fixture.nativeElement.querySelector(
      ".color-mode-toggle mat-icon",
    );
    expect(icon.textContent.trim()).toBe("light_mode");
  });
});
