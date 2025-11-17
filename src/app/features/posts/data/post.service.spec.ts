import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CreatePostRequest, PostService } from './post.service';
import { Post } from '../model/post.model';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/posts';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPosts', () => {
    it('should fetch all posts', () => {
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'Test Post',
          content: 'Test content',
          authorId: 'author1',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: '2',
          title: 'Another Post',
          content: 'More content',
          authorId: 'author2',
          createdAt: new Date('2025-01-02'),
        },
      ];

      service.getPosts().subscribe((posts) => {
        expect(posts).toEqual(mockPosts);
        expect(posts.length).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPosts);
    });
  });

  describe('getPostById', () => {
    it('should fetch a single post by id', () => {
      const mockPost: Post = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        authorId: 'author1',
        createdAt: new Date('2025-01-01'),
      };

      service.getPostById('1').subscribe((post) => {
        expect(post).toEqual(mockPost);
        expect(post.id).toBe('1');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPost);
    });
  });

  describe('createPost', () => {
    it('should create a new post', () => {
      const createRequest: CreatePostRequest = {
        title: 'New Post',
        content: 'New content',
        authorId: 'author1',
      };

      service.createPost(createRequest).subscribe((post) => {
        expect(post.title).toBe(createRequest.title);
        expect(post.content).toBe(createRequest.content);
        expect(post.authorId).toBe(createRequest.authorId);
        expect(post.id).toBeDefined();
        expect(post.createdAt).toBeDefined();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.title).toBe(createRequest.title);
      expect(req.request.body.content).toBe(createRequest.content);
      expect(req.request.body.authorId).toBe(createRequest.authorId);
      expect(req.request.body.id).toBeDefined();
      expect(req.request.body.createdAt).toBeDefined();

      req.flush({
        ...createRequest,
        id: 'generated-id',
        createdAt: new Date(),
      });
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', () => {
      const updates: Partial<Post> = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const updatedPost: Post = {
        id: '1',
        title: 'Updated Title',
        content: 'Updated content',
        authorId: 'author1',
        createdAt: new Date('2025-01-01'),
      };

      service.updatePost('1', updates).subscribe((post) => {
        expect(post).toEqual(updatedPost);
        expect(post.title).toBe(updates.title);
        expect(post.content).toBe(updates.content);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(updatedPost);
    });
  });

  describe('deletePost', () => {
    it('should delete a post', () => {
      service.deletePost('1').subscribe((result) => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
