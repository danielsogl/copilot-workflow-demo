import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { PostApi } from "./post-api";
import {
  CreatePostRequest,
  Post,
  UpdatePostRequest,
} from "../models/post.model";

describe("PostApi", () => {
  let service: PostApi;
  let httpTesting: HttpTestingController;

  const apiUrl = "https://jsonplaceholder.typicode.com/posts";

  const mockPosts: Post[] = [
    {
      userId: 1,
      id: 1,
      title: "Post title",
      body: "Post body",
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PostApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it("should fetch all posts", () => {
    service.getPosts().subscribe((posts) => {
      expect(posts).toEqual(mockPosts);
    });

    const req = httpTesting.expectOne(apiUrl);
    expect(req.request.method).toBe("GET");
    req.flush(mockPosts);
  });

  it("should fetch a post by id", () => {
    service.getPostById(1).subscribe((post) => {
      expect(post).toEqual(mockPosts[0]);
    });

    const req = httpTesting.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe("GET");
    req.flush(mockPosts[0]);
  });

  it("should create a post", () => {
    const request: CreatePostRequest = {
      userId: 1,
      title: "New post",
      body: "New body",
    };

    service.createPost(request).subscribe((post) => {
      expect(post.title).toBe("New post");
    });

    const req = httpTesting.expectOne(apiUrl);
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(request);
    req.flush({ ...request, id: 101 });
  });

  it("should update a post", () => {
    const updates: UpdatePostRequest = { title: "Updated title" };

    service.updatePost(1, updates).subscribe((post) => {
      expect(post.title).toBe("Updated title");
    });

    const req = httpTesting.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual(updates);
    req.flush({ ...mockPosts[0], ...updates });
  });

  it("should delete a post", () => {
    service.deletePost(1).subscribe();

    const req = httpTesting.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe("DELETE");
    req.flush(null);
  });
});
