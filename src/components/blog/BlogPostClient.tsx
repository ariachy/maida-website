'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'callout' | 'highlight' | 'cta';
  text?: string;
  items?: string[];
}

interface RelatedPost {
  title: string;
  subtitle: string;
  slug: string | null;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  image: string;
  date: string;
  readTime: string;
  tags: string[];
  content: ContentBlock[];
  relatedPosts?: RelatedPost[];
}

interface BlogPostClientProps {
  translations: any;
  locale: Locale;
  post: BlogPost;
}

export default function BlogPostClient({ translations, locale, post }: BlogPostClientProps) {
  const handleReserveClick = () => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config({
        apiKey: 'd541f212-d5ca-4839-ab2b-7f9c99e1c96c',
        widgetType: 'reservation',
      });
      (window as any).umaiWidget.openWidget();
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  // Render content block
  const renderContent = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'paragraph':
        // Handle italic text marked with *text*
        const text = block.text?.replace(/\*([^*]+)\*/g, '<em>$1</em>') || '';
        return (
          <p 
            key={index} 
            className="text-stone text-lg leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      
      case 'heading':
        return (
          <h2 key={index} className="font-display text-2xl md:text-3xl text-charcoal mt-12 mb-6">
            {block.text}
          </h2>
        );
      
      case 'list':
        return (
          <ul key={index} className="space-y-3 mb-6 ml-4">
            {block.items?.map((item, i) => {
              const itemText = item.replace(/\*([^*]+)\*/g, '<em>$1</em>');
              return (
                <li 
                  key={i} 
                  className="text-stone text-lg leading-relaxed flex items-start gap-3"
                >
                  <span className="text-terracotta mt-2">•</span>
                  <span dangerouslySetInnerHTML={{ __html: itemText }} />
                </li>
              );
            })}
          </ul>
        );
      
      case 'callout':
        return (
          <div key={index} className="bg-sand/30 border-l-4 border-terracotta px-6 py-4 my-8 italic text-stone">
            {block.text}
          </div>
        );
      
      case 'highlight':
        return (
          <p key={index} className="text-xl md:text-2xl font-display text-terracotta text-center my-10">
            {block.text}
          </p>
        );
      
      case 'cta':
        return (
          <p key={index} className="text-lg text-charcoal font-medium mt-8">
            {block.text}
          </p>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-12 md:pb-16">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 text-sand/80 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </motion.div>

          {/* Tags */}
          <motion.div 
            className="flex gap-2 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {post.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
              >
                {post.title}
              </motion.span>
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-terracotta-light italic mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {post.subtitle}
          </motion.p>

          {/* Meta */}
          <motion.div 
            className="flex items-center gap-6 text-sand/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12 md:py-20 px-6">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
        >
          {post.content.map((block, index) => renderContent(block, index))}
        </motion.div>
      </article>

      {/* Location CTA */}
      <section className="py-8 px-6 bg-sand/30">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-stone">
            📍 Rua da Boavista 66, Cais do Sodré, Lisboa
          </p>
        </div>
      </section>

      {/* Related Posts */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl text-charcoal mb-8">Keep Reading</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {post.relatedPosts.map((related, index) => (
                <div 
                  key={index}
                  className={`p-6 rounded-2xl ${related.slug ? 'bg-white hover:shadow-md transition-shadow' : 'bg-sand/30'}`}
                >
                  {related.slug ? (
                    <Link href={`/${locale}/blog/${related.slug}`} className="block">
                      <p className="text-xs text-terracotta uppercase tracking-wide mb-2">
                        {related.subtitle}
                      </p>
                      <h3 className="font-display text-xl text-charcoal hover:text-terracotta transition-colors">
                        {related.title}
                      </h3>
                    </Link>
                  ) : (
                    <>
                      <p className="text-xs text-stone uppercase tracking-wide mb-2">
                        {related.subtitle}
                      </p>
                      <h3 className="font-display text-xl text-stone">
                        {related.title}
                      </h3>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-12 md:py-16 px-6 bg-terracotta">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
            Taste it for yourself
          </h2>
          <p className="text-white/80 mb-8">
            #MeetMeAtMaída
          </p>
          <button
            onClick={handleReserveClick}
            className="px-8 py-3 bg-white text-charcoal rounded hover:bg-sand transition-colors"
          >
            Reserve a Table
          </button>
        </div>
      </section>
    </div>
  );
}
