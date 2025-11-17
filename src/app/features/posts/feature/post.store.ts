import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  type,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap } from 'rxjs';
import { Post } from '../model/post.model';
import { CreatePostRequest, PostService } from '../data/post.service';

export interface PostState {
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

const initialPostState: PostState = {
  loading: false,
  error: null,
  selectedId: null,
};

const postEntityConfig = entityConfig({
  entity: type<Post>(),
  collection: 'posts',
  selectId: (post: Post) => post.id,
});

export const PostStore = signalStore(
  { providedIn: 'root' },
  withState(initialPostState),
  withEntities(postEntityConfig),
  withComputed(({ postsEntities, postsEntityMap, selectedId }) => ({
    selectedPost: computed(() => {
      const id = selectedId();
      return id ? postsEntityMap()[id] : undefined;
    }),
    totalPostCount: computed(() => postsEntities().length),
    hasData: computed(() => postsEntities().length > 0),
    isEmpty: computed(() => postsEntities().length === 0),
  })),
  withMethods((store, postService = inject(PostService)) => ({
    loadPosts: rxMethod<void>(
      pipe(
        switchMap(() => {
          patchState(store, { loading: true, error: null });
          return postService.getPosts().pipe(
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
          );
        }),
      ),
    ),

    loadPostById: rxMethod<string>(
      pipe(
        switchMap((id) => {
          patchState(store, { loading: true, error: null });
          return postService.getPostById(id).pipe(
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
          );
        }),
      ),
    ),

    createPost: rxMethod<CreatePostRequest>(
      pipe(
        switchMap((post) => {
          patchState(store, { loading: true, error: null });
          return postService.createPost(post).pipe(
            tapResponse({
              next: (createdPost) =>
                patchState(store, addEntity(createdPost, postEntityConfig), {
                  loading: false,
                }),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to create post: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    updatePost: rxMethod<{ id: string; updates: Partial<Post> }>(
      pipe(
        switchMap(({ id, updates }) => {
          patchState(store, { loading: true, error: null });
          return postService.updatePost(id, updates).pipe(
            tapResponse({
              next: (updatedPost) =>
                patchState(
                  store,
                  updateEntity(
                    { id, changes: updatedPost },
                    postEntityConfig,
                  ),
                  {
                    loading: false,
                  },
                ),
              error: (error: Error) =>
                patchState(store, {
                  loading: false,
                  error: `Failed to update post: ${error.message}`,
                }),
            }),
          );
        }),
      ),
    ),

    deletePost: rxMethod<string>(
      pipe(
        switchMap((id) => {
          patchState(store, { loading: true, error: null });
          return postService.deletePost(id).pipe(
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
          );
        }),
      ),
    ),

    selectPost(id: string | null): void {
      patchState(store, { selectedId: id });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  })),
);
