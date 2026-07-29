import { ApplicationInitStatus } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { appConfig } from "./app.config";
import { ColorModeService } from "./core/color-mode/color-mode-service";

describe("appConfig", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    document.documentElement.style.colorScheme = "";
  });

  it("applies the stored color mode to the document before the app initializes", async () => {
    localStorage.setItem("color-mode", "dark");

    TestBed.configureTestingModule({ providers: appConfig.providers });

    await TestBed.inject(ApplicationInitStatus).donePromise;

    // No TestBed.tick() here on purpose: the color mode must already be
    // applied synchronously once the app initializer resolves, not only
    // after a later change-detection flush of the service's effect.
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("reuses the existing ColorModeService instead of a second init path", async () => {
    localStorage.setItem("color-mode", "light");

    TestBed.configureTestingModule({ providers: appConfig.providers });

    await TestBed.inject(ApplicationInitStatus).donePromise;

    const service = TestBed.inject(ColorModeService);
    expect(service.colorMode()).toBe("light");
  });
});
