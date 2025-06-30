export interface Blog {
  id: string;
  title: string;
  content: string;
  author_name: string;
  tags: string[];
  status: string;
  image_url: string;
}

export interface ListBlogsData {
  listBlogs: {
    items: Blog[];
  };
}
