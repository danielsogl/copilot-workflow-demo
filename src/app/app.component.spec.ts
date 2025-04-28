import { MockBuilder, MockRender, ngMocks } from "ng-mocks";
import { AppComponent } from "./app.component";

describe("AppComponent", () => {
  beforeEach(async () => {
    await MockBuilder(AppComponent);
  });

  it("should create the app", () => {
    MockRender(AppComponent);
    const app = ngMocks.findInstance(AppComponent);
    expect(app).toBeTruthy();
  });
});
