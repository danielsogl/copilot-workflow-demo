import { TestBed } from "@angular/core/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { patchState } from "@ngrx/signals";
import { unprotected } from "@ngrx/signals/testing";
import { Observable, of, throwError } from "rxjs";
import { MockProvider } from "ng-mocks";
import { PostApi } from "../infrastructure/post-api";
import {
  CreatePostRequest,
  Post,
  UpdatePostRequest,
} from "../models/post.model";
import { PostStore } from "./post-store";

describe("PostStore", () => {
  let store: InstanceType<typeof PostStore>;
  let postApi: {
    getPosts: ReturnType<typeof vi.fn<() => Observable<Post[]>>>;
    getPostById: ReturnType<typeof vi.fn<(id: number) => Observable<Post>>>;
    createPost: ReturnType<
      typeof vi.fn<(post: CreatePostRequest) => Observable<Post>>
    >;
    updatePost: ReturnType<
      typeof vi.fn<(id: number, updates: UpdatePostRequest) => Observable<Post>>
    >;
    deletePost: ReturnType<typeof vi.fn<(id: number) => Observable<void>>>;
  };

  const mockPosts: Post[] = [
    {
      userId: 1,
      id: 1,
      title: "Post 1",
      body: "Body 1",
    },
    {
      userId: 2,
      id: 2,
      title: "Post 2",
      body: "Body 2",
    },
  ];

  beforeEach(() => {
    postApi = {
      getPosts: vi.fn(() => of(mockPosts)),
      getPostById: vi.fn((id: number) =>
        of(mockPosts.find((post) => post.id === id) ?? mockPosts[0]),
      ),
      createPost: vi.fn((post) => of({ ...post, id: 101 })),
      updatePost: vi.fn((id, updates) =>
        of({
          ...(mockPosts.find((post) => post.id === id) ?? mockPosts[0]),
          ...updates,
        }),
      ),
      deletePost: vi.fn(() => of(void 0)),
    };

    TestBed.configureTestingModule({
      providers: [
        PostStore,
        provideZonelessChangeDetection(),
        MockProvider(PostApi, postApi as Partial<PostApi>),
      ],
    });

    store = TestBed.inject(PostStore);
  });

  it("should initialize with default state", () => {
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.selectedId()).toBeNull();
    expect(store.totalPostCount()).toBe(0);
    expect(store.hasData()).toBe(false);
    expect(store.isEmpty()).toBe(true);
    expect(store.selectedPost()).toBeNull();
  });

  it("should load posts", () => {
    store.loadPosts();
    TestBed.tick();

    expect(postApi.getPosts).toHaveBeenCalledOnce();
    expect(store.totalPostCount()).toBe(2);
    expect(store.hasData()).toBe(true);
    expect(store.isEmpty()).toBe(false);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it("should select a post", () => {
    store.loadPosts();
    TestBed.tick();

    store.selectPost(2);

    expect(store.selectedId()).toBe(2);
    expect(store.selectedPost()?.title).toBe("Post 2");
  });

  it("should create a post", () => {
    const newPost = {
      userId: 3,
      title: "Created",
      body: "Created Body",
    };

    store.createPost(newPost);
    TestBed.tick();

    expect(postApi.createPost).toHaveBeenCalledWith(newPost);
    expect(store.totalPostCount()).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it("should update a post", () => {
    store.loadPosts();
    TestBed.tick();

    store.updatePost({ id: 1, updates: { title: "Updated" } });
    TestBed.tick();

    expect(postApi.updatePost).toHaveBeenCalledWith(1, { title: "Updated" });
  });

  it("should delete a post", () => {
    store.loadPosts();
    TestBed.tick();

    store.deletePost(1);
    TestBed.tick();

    expect(postApi.deletePost).toHaveBeenCalledWith(1);
    expect(store.totalPostCount()).toBe(1);
  });

  it("should handle load errors", () => {
    postApi.getPosts.mockReturnValueOnce(
      throwError(() => new Error("network error")),
    );

    store.loadPosts();
    TestBed.tick();

    expect(store.loading()).toBe(false);
    expect(store.error()).toContain("Failed to load posts");
  });

  it("should allow direct test state mutation via unprotected", () => {
    patchState(unprotected(store), { selectedId: 1 });

    expect(store.selectedId()).toBe(1);
  });
});
