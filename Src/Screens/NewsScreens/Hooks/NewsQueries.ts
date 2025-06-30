import {gql} from '@apollo/client';

export const LIST_BLOGS = gql`
  query listBlogs {
    listBlogs {
      items {
        id
        title
        author_name
        image_url
        tags
      }
    }
  }
`;

export const GET_BLOG_BY_ID = gql`
  query GetBlogById($id: String!) {
    getBlogs(id: $id) {
      id
      title
      content
      author_name
      image_url
      tags
    }
  }
`;
