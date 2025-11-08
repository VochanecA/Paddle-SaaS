import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import PressClient from "@/components/PressClient";
import { notFound } from "next/navigation";

interface Blog {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string; // Raw Markdown content
}

interface BlogPageProps {
  params: Promise<{ slug: string }>; // Changed to Promise
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params; // Await the params
  const blogFilePath = path.join(process.cwd(), "src", "lib", "blogs", `${slug}.md`);
  let blog: Blog | null = null;

  try {
    // Ensure blog file exists
    await fs.access(blogFilePath);
    // Read markdown file
    const fileContent = await fs.readFile(blogFilePath, "utf-8");
    const { data, content } = matter(fileContent);

    // Build blog object
    blog = {
      slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString(),
      author: data.author || "Unknown Author",
      excerpt: data.excerpt || content.slice(0, 100) + "...",
      content, // Pass raw Markdown content
    };
  } catch (error) {
    console.error(`Error reading blog ${slug}:`, error);
    notFound(); // Show Next.js 404 page
  }

  return <PressClient blogs={[blog!]} isSingleBlog />;
}

export async function generateStaticParams() {
  const blogsDir = path.join(process.cwd(), "src", "lib", "blogs");
  
  try {
    const files = await fs.readdir(blogsDir);
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => ({
        slug: file.replace(".md", ""),
      }));
  } catch (error) {
    console.error("Error reading blogs directory for static params:", error);
    return [];
  }
}