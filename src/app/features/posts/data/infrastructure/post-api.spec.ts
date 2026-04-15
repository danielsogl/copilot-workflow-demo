import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { PostApi } from "./post-api";
import { CreatePostRequest, Post } from "../models/post.model";

describe("PostApi", () => {
  let service: PostApi;
  let httpTesting: HttpTestingController;

  const mockPost: Post = {
    id: 1,
    userId: 1,
    title:
      "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    body: "quia et suscipit suscipit recusandae consequuntur expedita et cum",
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PostApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it("should fetch all posts", () => {
    service.getPosts().subscribe((posts) => {
      expect(posts).toEqual([mockPost]);
    });

    const req = httpTesting.expectOne(
      "https://jsonplaceholder.typicode.com/posts",
    );
    expect(req.request.method).toBe("GET");
    req.flush([mockPost]);
  });

  it("should fetch a post by id", () => {
    service.getPostById(1).subscribe((post) => {
      expect(post).toEqual(mockPost);
    });

    const req = httpTesting.expectOne(
      "https://jsonplaceholder.typicode.com/posts/1",
    );
    expect(req.request.method).toBe("GET");
    req.flush(mockPost);
  });

  it("should create a post", () => {
    const payload: CreatePostRequest = {
      userId: 1,
      title: "new post",
      body: "new body",
    };

    service.createPost(payload).subscribe((post) => {
      expect(post.id).toBe(101);
      expect(post.title).toBe("new post");
    });

    const req = httpTesting.expectOne(
      "https://jsonplaceholder.typicode.com/posts",
    );
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush({ ...payload, id: 101 });
  });

  it("should update a post", () => {
    service.updatePost(1, { title: "updated title" }).subscribe((post) => {
      expect(post.title).toBe("updated title");
    });

    const req = httpTesting.expectOne(
      "https://jsonplaceholder.typicode.com/posts/1",
    );
    expect(req.request.method).toBe("PATCH");
    req.flush({ ...mockPost, title: "updated title" });
  });

  it("should delete a post", () => {
    service.deletePost(1).subscribe();

    const req = httpTesting.expectOne(
      "https://jsonplaceholder.typicode.com/posts/1",
    );
    expect(req.request.method).toBe("DELETE");
    req.flush(null);
  });
});
