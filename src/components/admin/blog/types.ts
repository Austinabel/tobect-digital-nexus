
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image_url?: string;
}

export interface BlogPostFormData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image_url?: string;
}
