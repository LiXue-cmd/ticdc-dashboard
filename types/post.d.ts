// types/post.d.ts
export interface Post {
  id: string | number;
  title: string;
  content: string;
  authorId: string | number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  status?: 'draft' | 'published' | 'archived';
}