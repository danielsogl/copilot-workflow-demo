
// a function that accepts a title as a string

import { Post } from "../model/post.model";

// returns a new post with random id and content
export function generatePost(title: string): Post {
  const id = Math.random().toString(36).substring(2, 15);
  const content = "This is a generated post content.";
  const authorId = "author-" + Math.random().toString(36).substring(2, 10);
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - 1);

  return {
    id,
    title,
    content,
    authorId,
    createdAt,
  };
}
