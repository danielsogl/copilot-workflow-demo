import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { ColorModeService } from "./color-mode-service";

describe("ColorModeService", () => {
  let changeListeners: ((event: { matches: boolean }) => void)[];
  let systemPrefersDark: boolean;

  function setup(): InstanceType<typeof ColorModeService> {
    TestBed.configureTestingModule({
      providers: [ColorModeService, provideZonelessChangeDetection()],
    });
    return TestBed.inject(ColorModeService);
  }

  beforeEach(() => {
    changeListeners = [];
    systemPrefersDark = false;
    localStorage.clear();

    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: systemPrefersDark,
        media: query,
        addEventListener: (
          _event: string,
          listener: (event: { matches: boolean }) => void,
        ) => {
          changeListeners.push(listener);
        },
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should default to system color mode", () => {
    const service = setup();

    expect(service.colorMode()).toBe("system");
  });

  it("should cycle system -> light -> dark -> system", () => {
    const service = setup();

    expect(service.colorMode()).toBe("system");

    service.cycleColorMode();
    expect(service.colorMode()).toBe("light");

    service.cycleColorMode();
    expect(service.colorMode()).toBe("dark");

    service.cycleColorMode();
    expect(service.colorMode()).toBe("system");
  });

  it("should derive effective color mode from the OS preference when in system mode", () => {
    systemPrefersDark = true;
    const service = setup();

    expect(service.effectiveColorMode()).toBe("dark");
  });

  it("should derive effective color mode as light when the OS prefers light and mode is system", () => {
    systemPrefersDark = false;
    const service = setup();

    expect(service.effectiveColorMode()).toBe("light");
  });

  it("should use the explicit color mode as the effective color mode when not system", () => {
    const service = setup();

    service.cycleColorMode();
    expect(service.colorMode()).toBe("light");
    expect(service.effectiveColorMode()).toBe("light");

    service.cycleColorMode();
    expect(service.colorMode()).toBe("dark");
    expect(service.effectiveColorMode()).toBe("dark");
  });

  it("should update effective color mode live when the OS preference changes while in system mode", () => {
    const service = setup();

    expect(service.effectiveColorMode()).toBe("light");

    changeListeners.forEach((listener) => listener({ matches: true }));

    expect(service.effectiveColorMode()).toBe("dark");
  });

  it("should not update effective color mode when the OS preference changes after an explicit choice", () => {
    const service = setup();

    service.cycleColorMode();
    expect(service.colorMode()).toBe("light");

    changeListeners.forEach((listener) => listener({ matches: true }));

    expect(service.colorMode()).toBe("light");
    expect(service.effectiveColorMode()).toBe("light");
  });

  it("should default to a light effective color mode when matchMedia is unavailable", () => {
    vi.unstubAllGlobals();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).matchMedia;

    const service = setup();

    expect(() => service.effectiveColorMode()).not.toThrow();
    expect(service.effectiveColorMode()).toBe("light");
  });

  it("should apply the effective color mode to the document", () => {
    systemPrefersDark = true;
    const service = setup();
    TestBed.tick();

    expect(document.documentElement.style.colorScheme).toBe("dark");

    service.cycleColorMode();
    TestBed.tick();
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("should expose an icon name matching the effective color mode", () => {
    const service = setup();

    expect(service.effectiveColorModeIcon()).toBe("light_mode");

    service.cycleColorMode();
    service.cycleColorMode();
    expect(service.effectiveColorModeIcon()).toBe("dark_mode");
  });

  describe("localStorage persistence", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should default to system color mode when localStorage has no stored value", () => {
      const service = setup();

      expect(service.colorMode()).toBe("system");
    });

    it("should read a stored color mode on start and use it", () => {
      localStorage.setItem("color-mode", "dark");

      const service = setup();

      expect(service.colorMode()).toBe("dark");
    });

    it("should ignore an invalid stored value and default to system", () => {
      localStorage.setItem("color-mode", "not-a-real-mode");

      const service = setup();

      expect(service.colorMode()).toBe("system");
    });

    it("should write every color mode change immediately to localStorage", () => {
      const service = setup();
      TestBed.tick();

      service.cycleColorMode();
      TestBed.tick();
      expect(localStorage.getItem("color-mode")).toBe("light");

      service.cycleColorMode();
      TestBed.tick();
      expect(localStorage.getItem("color-mode")).toBe("dark");

      service.cycleColorMode();
      TestBed.tick();
      expect(localStorage.getItem("color-mode")).toBe("system");
    });

    it("should not throw and should fall back to system when reading from localStorage throws", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("localStorage disabled");
      });

      let service!: InstanceType<typeof ColorModeService>;
      expect(() => {
        service = setup();
      }).not.toThrow();

      expect(service.colorMode()).toBe("system");
    });

    it("should not throw and should keep working when writing to localStorage throws", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("localStorage disabled");
      });

      const service = setup();

      expect(() => {
        service.cycleColorMode();
        TestBed.tick();
      }).not.toThrow();

      expect(service.colorMode()).toBe("light");
    });
  });
});
