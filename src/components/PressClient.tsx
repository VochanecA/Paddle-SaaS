'use client';

import { useState, useEffect, ReactNode, ImgHTMLAttributes } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Calendar, User, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown, { Components } from 'react-markdown';

interface Blog {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
}

interface PressClientProps {
  blogs: Blog[];
  isSingleBlog?: boolean;
}

export default function PressClient({ blogs, isSingleBlog = false }: PressClientProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isLight = resolvedTheme === 'light';
  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const otherBlogs = isSingleBlog ? [] : blogs.slice(1);

  const resolveImagePath = (imgPath: string): string => {
    let cleanPath = imgPath
      .replace(/^\.?\//, '') // Remove ./ or /
      .replace(/^public\//, '') // Remove public/ if present
      .replace(/^blogs\//, 'blogs/'); // Ensure it starts with blogs/

    if (!cleanPath.startsWith('blogs/')) {
      cleanPath = `blogs/${cleanPath}`;
    }

    return `/${cleanPath}`;
  };

  const getFirstImage = (content: string): string => {
    const markdownMatch = content.match(/!\[.*?\]\((.*?)\)/);
    if (markdownMatch?.[1]) {
      return resolveImagePath(markdownMatch[1]);
    }

    const htmlMatch = content.match(/<img[^>]+src=["'](.*?)["']/i);
    if (htmlMatch?.[1]) {
      return resolveImagePath(htmlMatch[1]);
    }

    return '/blogs/images/placeholder.jpg';
  };

  interface MarkdownImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    alt?: string;
  }

  const MarkdownImage = ({ src, alt }: MarkdownImageProps): JSX.Element => {
    const [imageSrc, setImageSrc] = useState<string>(src ?? '/blogs/images/placeholder.jpg');
    const [hasError, setHasError] = useState<boolean>(false);

    return (
      <div className="relative w-full h-64 sm:h-80 md:h-96 my-6">
        <Image
          src={hasError ? '/blogs/images/placeholder.jpg' : imageSrc}
          alt={alt ?? 'Blog image'}
          fill
          className="object-contain rounded-lg"
          onError={() => setHasError(true)}
          unoptimized={false} // explicitly note this if needed
        />
      </div>
    );
  };

  const markdownComponents: Components = {
    img: ({ node, ...props }) => <MarkdownImage {...props} />,
    p: ({ node, ...props }) => <p className="mb-4" {...props} />,
    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 mt-6" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-3 mt-5" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-xl font-bold mb-2 mt-4" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4" {...props} />,
  };

  if (isSingleBlog && featuredBlog) {
    return (
      <div
        className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
          isLight ? 'bg-gray-50' : 'bg-gradient-to-b from-gray-900 to-gray-950'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/press"
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
              }`}
              aria-label="Back to Press"
            >
              <ArrowLeft size={16} />
              Back to Press
            </Link>
          </motion.div>

          {/* Single Blog View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-3xl overflow-hidden shadow-xl transition-all duration-300 ${
              isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
            }`}
          >
            {/* Featured Image */}
            <div className="relative w-full h-64 sm:h-80 md:h-96">
              <Image
                src={getFirstImage(featuredBlog.content)}
                alt={featuredBlog.title}
                fill
                className="object-cover"
                priority
                onError={({ currentTarget }) => {
                  currentTarget.src = '/blogs/images/placeholder.jpg';
                }}
              />
            </div>

            <div className="p-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                {featuredBlog.title}
              </h1>

              <div
                className={`flex items-center gap-4 mb-6 text-sm transition-colors duration-300 ${
                  isLight ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(featuredBlog.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <User size={16} />
                  {featuredBlog.author}
                </span>
              </div>

              <ReactMarkdown
                className={`prose prose-sm sm:prose-base max-w-none transition-colors duration-300 ${
                  isLight ? 'prose-gray' : 'prose-invert'
                }`}
                components={markdownComponents}
              >
                {featuredBlog.content}
              </ReactMarkdown>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isLight ? 'bg-gray-50' : 'bg-gradient-to-b from-gray-900 to-gray-950'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4 shadow-lg"
          >
            <Newspaper className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Press & News
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-lg sm:text-xl max-w-3xl mx-auto transition-colors duration-300 ${
              isLight ? 'text-gray-700' : 'text-gray-300'
            }`}
          >
            Stay updated with the latest news, announcements, and insights from our team.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`text-sm mt-2 transition-colors duration-300 ${
              isLight ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            Last updated: {new Date().toLocaleDateString()}
          </motion.p>
        </div>

        {/* Featured Blog Section */}
        {featuredBlog && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mb-16 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 ${
              isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
            }`}
          >
            <div className="flex flex-col lg:flex-row">
              <div className="relative w-full lg:w-1/2 h-64 sm:h-80 lg:h-96">
                <Image
                  src={getFirstImage(featuredBlog.content)}
                  alt={featuredBlog.title}
                  fill
                  className="object-cover rounded-t-3xl lg:rounded-l-3xl lg:rounded-t-none"
                  priority
                  onError={({ currentTarget }) => {
                    currentTarget.src = '/blogs/images/placeholder.jpg';
                  }}
                />
              </div>

              <div className="p-8 lg:w-1/2">
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${
                    isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/50 text-blue-400'
                  }`}
                >
                  Featured
                </span>

                <h2
                  className={`text-2xl sm:text-3xl font-bold mb-4 transition-colors duration-300 ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  {featuredBlog.title}
                </h2>

                <div
                  className={`flex items-center gap-4 mb-4 text-sm transition-colors duration-300 ${
                    isLight ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(featuredBlog.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={16} />
                    {featuredBlog.author}
                  </span>
                </div>

                <p className={`mb-6 transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                  {featuredBlog.excerpt}
                </p>

                <Link
                  href={`/press/${featuredBlog.slug}`}
                  className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                    isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
                  }`}
                  aria-label={`Read more about ${featuredBlog.title}`}
                >
                  Read More <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other Blogs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <AnimatePresence>
            {otherBlogs.map((blog, index) => (
              <motion.div
                key={blog.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                  isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'
                } hover:scale-105`}
              >
                <div className="relative w-full h-48">
                  <Image
                    src={getFirstImage(blog.content)}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    onError={({ currentTarget }) => {
                      currentTarget.src = '/blogs/images/placeholder.jpg';
                    }}
                  />
                </div>

                <div className="p-6">
                  <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {blog.title}
                  </h3>

                  <div
                    className={`flex items-center gap-4 mb-3 text-sm transition-colors duration-300 ${
                      isLight ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(blog.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {blog.author}
                    </span>
                  </div>

                  <p className={`text-sm mb-4 transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                    {blog.excerpt}
                  </p>

                  <Link
                    href={`/press/${blog.slug}`}
                    className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                      isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
                    }`}
                    aria-label={`Read more about ${blog.title}`}
                  >
                    Read More <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl p-8 text-center transition-colors duration-300 ${
            isLight ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gradient-to-r from-blue-900/50 to-purple-900/50'
          }`}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Want to Stay in the Loop?
          </h2>

          <p className={`mb-6 max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Subscribe to our newsletter for the latest updates or contact our press team for media inquiries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/newsletter"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              aria-label="Subscribe to Newsletter"
            >
              Subscribe to Newsletter
            </Link>

            <Link
              href="/support"
              className={`px-6 py-3 rounded-lg font-medium border transition-colors ${
                isLight ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-600 text-gray-300 hover:bg-gray-800'
              } shadow-md hover:shadow-lg`}
              aria-label="Contact Press Team"
            >
              Contact Press Team
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
