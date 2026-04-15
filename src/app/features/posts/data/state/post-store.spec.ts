import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { patchState } from "@ngrx/signals";
import { unprotected } from "@ngrx/signals/testing";
import { of, throwError } from "rxjs";
import { PostApi } from "../infrastructure/post-api";
import { CreatePostRequest, Post } from "../models/post.model";
import { PostStore } from "./post-store";

describe("PostStore", () => {
  const mockPosts: Post[] = [
    {
      id: 1,
      userId: 1,
      title: "first post",
      body: "first body",
    },
    {
      id: 2,
      userId: 1,
      title: "second post",
      body: "second body",
    },
  ];

  let store: InstanceType<typeof PostStore>;
  let postApi: {
    getPosts: ReturnType<typeof vi.fn>;
    getPostById: ReturnType<typeof vi.fn>;
    createPost: ReturnType<typeof vi.fn>;
    updatePost: ReturnType<typeof vi.fn>;
    deletePost: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    postApi = {
      getPosts: vi.fn().mockReturnValue(of(mockPosts)),
      getPostById: vi.fn().mockReturnValue(of(mockPosts[0])),
      createPost: vi
        .fn()
        .mockImplementation((payload: CreatePostRequest) =>
          of({ ...payload, id: 101 }),
        ),
      updatePost: vi
        .fn()
        .mockImplementation((id: number, updates: Partial<Post>) =>
          of({ ...mockPosts[0], id, ...updates }),
        ),
      deletePost: vi.fn().mockReturnValue(of(void 0)),
    };

    TestBed.configureTestingModule({
      providers: [
        PostStore,
        provideZonelessChangeDetection(),
        {
          provide: PostApi,
          useValue: postApi,
        },
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
    expect(store.selectedPost()).toBeUndefined();
  });

  it("should allow patchState with unprotected store in tests", () => {
    patchState(unprotected(store), { selectedId: 2 });
    expect(store.selectedId()).toBe(2);
  });

  it("should select a post", () => {
    store.selectPost(1);
    expect(store.selectedId()).toBe(1);

    store.selectPost(null);
    expect(store.selectedId()).toBeNull();
  });

  it("should load all posts", () => {
    store.loadPosts();
    TestBed.tick();

    expect(postApi.getPosts).toHaveBeenCalledOnce();
    expect(store.totalPostCount()).toBe(2);
    expect(store.hasData()).toBe(true);
    expect(store.isEmpty()).toBe(false);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it("should load post by id and set selection", () => {
    store.loadPostById(1);
    TestBed.tick();

    expect(postApi.getPostById).toHaveBeenCalledWith(1);
    expect(store.selectedId()).toBe(1);
    expect(store.selectedPost()?.title).toBe("first post");
  });

  it("should create a post", () => {
    const payload: CreatePostRequest = {
      userId: 10,
      title: "new post",
      body: "new body",
    };

    store.createPost(payload);
    TestBed.tick();

    expect(postApi.createPost).toHaveBeenCalledWith(payload);
    expect(store.totalPostCount()).toBe(1);
    expect(store.selectedId()).toBe(101);
    expect(store.selectedPost()?.title).toBe("new post");
  });

  it("should update a post", () => {
    store.loadPosts();
    TestBed.tick();

    store.updatePost({ id: 1, updates: { title: "updated title" } });
    TestBed.tick();

    expect(postApi.updatePost).toHaveBeenCalledWith(1, {
      title: "updated title",
    });
    expect(store.selectedId()).toBeNull();
  });

  it("should delete a post", () => {
    store.loadPosts();
    TestBed.tick();
    store.selectPost(1);

    store.deletePost(1);
    TestBed.tick();

    expect(postApi.deletePost).toHaveBeenCalledWith(1);
    expect(store.totalPostCount()).toBe(1);
    expect(store.selectedId()).toBeNull();
  });

  it("should set an error when loading posts fails", () => {
    postApi.getPosts.mockReturnValue(
      throwError(() => new Error("network unavailable")),
    );

    store.loadPosts();
    TestBed.tick();

    expect(store.loading()).toBe(false);
    expect(store.error()).toContain("Failed to load posts");
  });
});
