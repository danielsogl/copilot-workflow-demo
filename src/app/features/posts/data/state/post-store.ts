import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  type,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import {
  addEntity,
  entityConfig,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { pipe, switchMap, tap } from "rxjs";
import { PostApi } from "../infrastructure/post-api";
import { CreatePostRequest, Post } from "../models/post.model";

export interface PostState {
  loading: boolean;
  error: string | null;
  selectedId: number | null;
}

const initialPostState: PostState = {
  loading: false,
  error: null,
  selectedId: null,
};

const postEntityConfig = entityConfig({
  entity: type<Post>(),
  collection: "posts",
  selectId: (post: Post) => post.id,
});

export const PostStore = signalStore(
  { providedIn: "root" },
  withState(initialPostState),
  withEntities(postEntityConfig),
  withComputed(({ postsEntityMap, postsEntities, selectedId }) => ({
    selectedPost: computed(() => {
      const id = selectedId();
      if (id === null) return undefined;
      return postsEntityMap()[id];
    }),
    totalPostCount: computed(() => postsEntities().length),
    hasData: computed(() => postsEntities().length > 0),
    isEmpty: computed(() => postsEntities().length === 0),
  })),
  withMethods((store, postApi = inject(PostApi)) => ({
    loadPosts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          postApi.getPosts().pipe(
            tapResponse({
              next: (posts) =>
                patchState(store, setAllEntities(posts, postEntityConfig), {
                  loading: false,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to load posts: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    loadPostById: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          postApi.getPostById(id).pipe(
            tapResponse({
              next: (post) =>
                patchState(store, addEntity(post, postEntityConfig), {
                  loading: false,
                  selectedId: post.id,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to load post: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    createPost: rxMethod<CreatePostRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((post) =>
          postApi.createPost(post).pipe(
            tapResponse({
              next: (createdPost) =>
                patchState(store, addEntity(createdPost, postEntityConfig), {
                  loading: false,
                  selectedId: createdPost.id,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to create post: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    updatePost: rxMethod<{ id: number; updates: Partial<Post> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, updates }) =>
          postApi.updatePost(id, updates).pipe(
            tapResponse({
              next: (updatedPost) =>
                patchState(
                  store,
                  updateEntity(
                    { id: updatedPost.id, changes: updatedPost },
                    postEntityConfig,
                  ),
                  { loading: false },
                ),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to update post: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    deletePost: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          postApi.deletePost(id).pipe(
            tapResponse({
              next: () =>
                patchState(store, removeEntity(id, postEntityConfig), {
                  loading: false,
                  selectedId:
                    store.selectedId() === id ? null : store.selectedId(),
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to delete post: ${error.message}`,
                }),
            }),
          ),
        ),
      ),
    ),

    selectPost(id: number | null): void {
      patchState(store, { selectedId: id });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
