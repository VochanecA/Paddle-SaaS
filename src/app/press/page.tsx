import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import PressClient from '@/components/PressClient';

interface Blog {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string; // Raw Markdown content
}

export default async function PressPage() {
  const blogsDir = path.join(process.cwd(), 'src', 'lib', 'blogs');
  let blogs: Blog[] = [];

  try {
    await fs.access(blogsDir);
    const files = await fs.readdir(blogsDir);
    blogs = await Promise.all(
      files
        .filter((file) => file.endsWith('.md'))
        .map(async (file) => {
          const filePath = path.join(blogsDir, file);
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const { data, content } = matter(fileContent);
          return {
            slug: file.replace('.md', ''),
            title: data.title || 'Untitled',
            date: data.date || new Date().toISOString(),
            author: data.author || 'Unknown Author',
            excerpt: data.excerpt || content.slice(0, 100) + '...',
            content, // Pass raw Markdown
          };
        })
    );
    // Sort blogs by date, newest first
    blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error reading blogs directory:', error);
    blogs = [];
  }

  return <PressClient blogs={blogs} />;
}