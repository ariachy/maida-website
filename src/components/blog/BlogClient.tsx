'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

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
}

interface BlogClientProps {
  translations: any;
  locale: Locale;
  posts: BlogPost[];
}

export default function BlogClient({ translations, locale, posts }: BlogClientProps) {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
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

  // Get featured post (first one)
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 px-6 bg-charcoal text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-terracotta blur-[150px]" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-sage blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.p
            className="inline-flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-terracotta-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="w-8 h-px bg-terracotta-light" />
            From Our Kitchen
            <span className="w-8 h-px bg-terracotta-light" />
          </motion.p>

          <h1 className="font-display text-5xl md:text-7xl font-light mb-6">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
              >
                Stories from <span className="text-terracotta-light italic">Maída</span>
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="text-lg md:text-xl text-sand/80 max-w-xl mx-auto font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            The traditions, flavors, and moments behind everything we do
          </motion.p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Link 
                href={`/${locale}/blog/${featuredPost.slug}`}
                className="group block"
              >
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  {/* Image */}
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
                    
                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {featuredPost.tags.slice(0, 2).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-white/90 text-charcoal text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <p className="text-xs tracking-[0.2em] uppercase text-terracotta mb-4">
                      Featured
                    </p>
                    
                    <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-4 group-hover:text-terracotta transition-colors">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="text-lg text-terracotta italic mb-4">
                      {featuredPost.subtitle}
                    </p>
                    
                    <p className="text-stone mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-stone mb-6">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredPost.date)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-2 text-terracotta font-medium group-hover:gap-4 transition-all">
                      Read Article
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Other Posts Grid */}
      {otherPosts.length > 0 && (
        <section className="py-16 md:py-24 px-6 bg-sand/30">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="font-display text-3xl text-charcoal mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              More Stories
            </motion.h2>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={staggerContainer}
            >
              {otherPosts.map((post) => (
                <motion.div key={post.id} variants={fadeInUp}>
                  <Link 
                    href={`/${locale}/blog/${post.slug}`}
                    className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Tags */}
                      <div className="flex gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 bg-sand/50 text-stone text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-display text-xl text-charcoal mb-2 group-hover:text-terracotta transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-sm text-stone mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-stone">
                        <span>{formatDate(post.date)}</span>
                        <span>·</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Coming Soon */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="font-display text-3xl md:text-4xl text-charcoal mb-4"
              variants={fadeInUp}
            >
              More stories coming soon
            </motion.h2>

            <motion.p 
              className="text-stone mb-8"
              variants={fadeInUp}
            >
              Follow us for the latest from Maída
            </motion.p>

            <motion.div className="flex justify-center gap-4" variants={fadeInUp}>
              <a
                href="https://instagram.com/maida.lisboa"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-charcoal text-white rounded hover:bg-terracotta transition-colors"
              >
                Follow on Instagram
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
