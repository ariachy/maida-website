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
      {/* Hero Section - matching other pages */}
      <section className="relative min-h-[calc(100svh-100px)] md:min-h-[calc(100svh-120px)] flex items-center justify-center px-6 bg-charcoal text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-terracotta blur-[150px]" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-sage blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center pt-16 md:pt-20">
          {/* UPDATED: Changed from "From Our Kitchen" to "Traditions, flavours, moments" */}
          <motion.p
            className="inline-flex items-center gap-4 text-xs tracking-[0.3em] uppercase text-terracotta-light mb-4 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="w-8 h-px bg-terracotta-light" />
            Traditions, flavours, moments
            <span className="w-8 h-px bg-terracotta-light" />
          </motion.p>

          {/* UPDATED: Header now says "Discover" instead of "Blog" */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-4 md:mb-6 leading-[1.1]">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
              >
                Discover
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="text-base md:text-xl text-sand/90 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Stories from our kitchen, our roots, and the table
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
              <Link href={`/${locale}/blog/${featuredPost.slug}`} className="group block">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-terracotta text-white text-xs uppercase tracking-wider">
                        Featured
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    {/* Tags */}
                    <div className="flex gap-2 mb-4">
                      {featuredPost.tags.slice(0, 2).map((tag, index) => (
                        <span 
                          key={index}
                          className="text-xs text-terracotta uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h2 className="font-display text-3xl md:text-4xl text-charcoal group-hover:text-terracotta transition-colors mb-4">
                      {featuredPost.title}
                    </h2>

                    <p className="text-lg text-terracotta-light italic mb-4">
                      {featuredPost.subtitle}
                    </p>

                    <p className="text-stone mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-6 text-sm text-stone">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredPost.date)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Divider with emblem */}
      <div className="max-w-xs mx-auto flex items-center gap-4 px-6">
        <span className="flex-1 h-px bg-stone/20" />
        <Image
          src="/images/brand/emblem.svg"
          alt=""
          width={24}
          height={24}
          className="opacity-60"
        />
        <span className="flex-1 h-px bg-stone/20" />
      </div>

      {/* Other Posts - UPDATED: Single column layout instead of grid */}
      {otherPosts.length > 0 && (
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-2xl text-charcoal">More stories</h2>
            </motion.div>

            {/* UPDATED: Changed from grid to single column (flex-col) */}
            <motion.div
              className="flex flex-col gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {otherPosts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={fadeInUp}
                  className="group"
                >
                  {/* UPDATED: Horizontal card layout for single column */}
                  <Link 
                    href={`/${locale}/blog/${post.slug}`}
                    className="flex flex-col md:flex-row gap-6 p-6 bg-warm-white hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative w-full md:w-1/3 aspect-[16/9] md:aspect-square overflow-hidden flex-shrink-0">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      {/* Tags */}
                      <div className="flex gap-2 mb-2">
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <span 
                            key={index}
                            className="text-xs text-terracotta uppercase tracking-wider"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-display text-xl md:text-2xl text-charcoal group-hover:text-terracotta transition-colors mb-2">
                        {post.title}
                      </h3>

                      <p className="text-stone text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-stone">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center">
                      <ArrowRight className="w-5 h-5 text-stone group-hover:text-terracotta group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-6 bg-charcoal text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Taste the stories
          </h2>
          <p className="text-sand/70 mb-8">
            #MeetMeAt<span className="italic text-terracotta-light">Maída</span>
          </p>
          <Link href={`/${locale}/menu`} className="btn btn-light">
            View our menu
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
