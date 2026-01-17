'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Script from 'next/script';
import { Locale } from '@/lib/i18n';

// reCAPTCHA Enterprise Site Key
const RECAPTCHA_SITE_KEY = '6LdxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxX'; // Replace with your actual key

interface ContactClientProps {
  translations: any;
  locale: Locale;
}

export default function ContactClient({ translations, locale }: ContactClientProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '', // Honeypot
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    setTimestamp(Math.floor(Date.now() / 1000));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    // Honeypot check
    if (formData.website) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
      return;
    }

    // Time-based check (form submitted too quickly)
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp < 3) {
      setStatus('error');
      setErrorMessage('Please wait a moment before submitting.');
      return;
    }

    try {
      // Get reCAPTCHA token
      let recaptchaToken = '';
      if (recaptchaLoaded && (window as any).grecaptcha?.enterprise) {
        recaptchaToken = await (window as any).grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action: 'contact' });
      }

      // Development mode - just log
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('Contact Form Submission (Dev Mode):', {
          ...formData,
          recaptcha: recaptchaToken ? 'Token received' : 'No token',
        });
        
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
          website: formData.website,
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
            <h1 className="font-display text-5xl md:text-6xl text-charcoal mb-4">
              Get in touch with us
            </h1>
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
              {/* FIX 1: Hours BEFORE Address */}
              {/* Hours */}
              <div>
                <h2 className="font-display text-2xl text-charcoal mb-4">Opening hours</h2>
                <div className="space-y-2 text-stone">
                  <div className="flex justify-between max-w-xs text-terracotta">
                    <span>Monday</span>
                    <span>Closed</span>
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
                    <span>12:30 - 01:00</span>
                  </div>
                  <div className="flex justify-between max-w-xs">
                    <span>Saturday</span>
                    <span>12:30 - 01:00</span>
                  </div>
                  <div className="flex justify-between max-w-xs">
                    <span>Sunday</span>
                    <span>12:30 - 23:00</span>
                  </div>
                  <div className="text-stone/60 text-sm mt-3 space-y-1">
                    <p>Kitchen closes 22:30 (Wed, Thu, Sun)</p>
                    <p>Kitchen closes 23:30 (Fri, Sat)</p>
                  </div>
                </div>
              </div>

              {/* Address - Now AFTER hours */}
              <div>
                <h2 className="font-display text-2xl text-charcoal mb-4">Address</h2>
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
                  Directions
                </a>
              </div>

              {/* Group Booking Note */}
              <div className="p-4 bg-cream border-l-4 border-terracotta">
                <p className="text-stone text-sm">
                  For groups of 6 or more, please use our contact form or call us.
                </p>
              </div>

              {/* FIX 2: REMOVED Reserve Button */}
            </motion.div>

            {/* Right Column - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-sand/30 p-8 md:p-10">
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
                      Your name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-stone/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                      Email address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-stone/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
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
                      className="w-full px-4 py-3 bg-white border border-stone/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
                    >
                      <option value="">Select a topic</option>
                      <option value="General Inquiry">General inquiry</option>
                      <option value="Large Group Reservation">Large group reservation (6+)</option>
                      <option value="Private Event">Private event</option>
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
                      className="w-full px-4 py-3 bg-white border border-stone/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {/* Error Message */}
                  {status === 'error' && (
                    <p className="text-red-600 text-sm bg-red-50 p-3">
                      {errorMessage}
                    </p>
                  )}

                  {/* Success Message */}
                  {status === 'success' && (
                    <p className="text-green-700 text-sm bg-green-50 p-3">
                      Thank you! Your message has been sent. We&apos;ll get back to you soon.
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? 'Sending...' : 'Send message'}
                  </button>

                  {/* reCAPTCHA notice */}
                  <p className="text-xs text-stone/60 text-center">
                    Protected by reCAPTCHA.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Map Section */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-[2/1] bg-sand/30 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.4276289882!2d-9.145!3d38.706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDQyJzIxLjYiTiA5wrAwOCc0Mi4wIlc!5e0!3m2!1sen!2spt!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
