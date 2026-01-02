'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Script from 'next/script';

interface ContactClientProps {
  translations: any;
  locale: string;
}

// reCAPTCHA Enterprise Site Key
const RECAPTCHA_SITE_KEY = '6LffXD0sAAAAACfEknWv1dMM2MTVwa3ScqsDP-2U';

// Declare grecaptcha types
declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

export default function ContactClient({ translations, locale }: ContactClientProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '', // Honeypot field
  });
  const [timestamp, setTimestamp] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  // Set timestamp when component mounts
  useEffect(() => {
    setTimestamp(Math.floor(Date.now() / 1000));
  }, []);

  const getRecaptchaToken = async (): Promise<string> => {
    if (!recaptchaLoaded || !window.grecaptcha?.enterprise) {
      console.warn('reCAPTCHA not loaded');
      return '';
    }

    return new Promise((resolve) => {
      window.grecaptcha.enterprise.ready(async () => {
        try {
          const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {
            action: 'CONTACT_FORM'
          });
          resolve(token);
        } catch (error) {
          console.error('reCAPTCHA error:', error);
          resolve('');
        }
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();

      // Check if we're in development mode (localhost)
      const isDev = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      if (isDev) {
        // Development mode - simulate success without calling PHP
        console.log('📧 DEV MODE - Form data:', {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          recaptchaToken: recaptchaToken ? 'Token received' : 'No token',
        });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '', website: '' });
        setTimestamp(Math.floor(Date.now() / 1000));
        return;
      }

      // Production mode - call PHP backend
      const response = await fetch('/backend/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'General Inquiry',
          message: formData.message,
          website: formData.website, // Honeypot
          _timestamp: timestamp,
          _recaptcha: recaptchaToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '', website: '' });
        setTimestamp(Math.floor(Date.now() / 1000));
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to send message. Please email us directly at info@maida.pt');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const openReservation = () => {
    if (typeof window !== 'undefined' && (window as any).umaiWidget) {
      (window as any).umaiWidget.config({
        apiKey: 'd541f212-d5ca-4839-ab2b-7f9c99e1c96c',
        widgetType: 'reservation',
      });
      (window as any).umaiWidget.openWidget();
    }
  };

  return (
    <>
      {/* Load reCAPTCHA Enterprise Script */}
      <Script
        src={`https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`}
        onLoad={() => setRecaptchaLoaded(true)}
      />

      <div className="min-h-screen bg-warm-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm tracking-[0.2em] uppercase text-terracotta mb-4">
              Find Us
            </p>
            <h1 className="font-display text-5xl md:text-6xl text-charcoal mb-4">
              Get in Touch
            </h1>
            <p className="text-stone text-lg max-w-md mx-auto">
              Your spot in Cais do Sodré
            </p>
          </motion.div>

          {/* Main Content - Two Columns */}
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Column - Info */}
            <motion.div
              className="space-y-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Location */}
              <div>
                <h2 className="font-display text-2xl text-charcoal mb-4">Location</h2>
                <p className="text-stone leading-relaxed">
                  Rua da Boavista 66<br />
                  Cais do Sodré<br />
                  1200-066 Lisboa, Portugal
                </p>
                <a
                  href="https://maps.google.com/?q=Rua+da+Boavista+66+Lisboa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-terracotta hover:text-terracotta/80 mt-3 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Get Directions
                </a>
              </div>

              {/* Hours */}
              <div>
                <h2 className="font-display text-2xl text-charcoal mb-4">Hours</h2>
                <div className="space-y-2 text-stone">
                  <div className="flex justify-between max-w-xs">
                    <span>Monday</span>
                    <span>12:30 - 23:00</span>
                  </div>
                  <div className="flex justify-between max-w-xs text-terracotta">
                    <span>Tuesday</span>
                    <span>Closed</span>
                  </div>
                  <div className="flex justify-between max-w-xs">
                    <span>Wednesday</span>
                    <span>12:30 - 23:00</span>
                  </div>
                  <div className="flex justify-between max-w-xs">
                    <span>Thursday</span>
                    <span>12:30 - 23:00</span>
                  </div>
                  <div className="flex justify-between max-w-xs">
                    <span>Friday</span>
                    <span>12:30 - 00:00</span>
                  </div>
                  <div className="flex justify-between max-w-xs">
                    <span>Saturday</span>
                    <span>12:30 - 00:00+</span>
                  </div>
                  <div className="flex justify-between max-w-xs">
                    <span>Sunday</span>
                    <span>12:30 - 23:00</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h2 className="font-display text-2xl text-charcoal mb-4">Contact</h2>
                <div className="space-y-2 text-stone">
                  <a href="mailto:info@maida.pt" className="block hover:text-terracotta transition-colors">
                    info@maida.pt
                  </a>
                  <a href="tel:+351912345678" className="block hover:text-terracotta transition-colors">
                    +351 912 345 678
                  </a>
                </div>
              </div>

              {/* Reserve Button */}
              <div>
                <button
                  onClick={openReservation}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-terracotta text-white rounded-full font-medium hover:bg-terracotta/90 transition-colors"
                >
                  Reserve a Table
                </button>
                <p className="text-sm text-stone mt-3">
                  For groups of 6 or more, please email us directly.
                </p>
              </div>
            </motion.div>

            {/* Right Column - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-sand/30 rounded-2xl p-8 md:p-10">
                <h2 className="font-display text-2xl text-charcoal mb-6">Send us a message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Honeypot field - hidden from users */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="absolute -left-[9999px] opacity-0 pointer-events-none"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-charcoal mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
                    >
                      <option value="">Select a topic</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Large Group Reservation">Large Group Reservation (6+)</option>
                      <option value="Private Event">Private Event</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {/* Error Message */}
                  {status === 'error' && (
                    <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      {errorMessage}
                    </p>
                  )}

                  {/* Success Message */}
                  {status === 'success' && (
                    <p className="text-green-700 text-sm bg-green-50 p-3 rounded-lg">
                      Thank you! Your message has been sent. We&apos;ll get back to you soon.
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full px-6 py-4 bg-charcoal text-white rounded-full font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>

                  {/* reCAPTCHA notice */}
                  <p className="text-xs text-stone/60 text-center">
                    Protected by reCAPTCHA. 
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline ml-1">Privacy</a>
                    <span className="mx-1">·</span>
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms</a>
                  </p>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Map Section */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-stone/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.9!2d-9.1448!3d38.7068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd19347fdf6d3c9b%3A0x0!2sRua%20da%20Boavista%2066%2C%20Lisboa!5e0!3m2!1sen!2spt!4v1704067200000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
                title="Maída Location"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
