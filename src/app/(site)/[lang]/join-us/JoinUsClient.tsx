'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';
import { Locale } from '@/lib/i18n';

const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
  '6LffXD0sAAAAACfEknWv1dMM2MTVwa3ScqsDP-2U';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const CV_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
const PHOTO_ACCEPT = '.jpg,.jpeg,.png,image/jpeg,image/png';

type Department = 'Kitchen' | 'Bar' | 'Floor';

interface JoinUsClientProps {
  locale: Locale;
}

export default function JoinUsClient({ locale }: JoinUsClientProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '' as Department | '',
    position: '',
    message: '',
    consent: false,
    website: '', // honeypot
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState('');
  const [photoError, setPhotoError] = useState('');

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));

  // Loading overlay state
  const [loadingPhase, setLoadingPhase] = useState<'sending' | 'uploading' | 'finalizing'>('sending');

  const cvInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimestamp(Math.floor(Date.now() / 1000));
  }, []);

  // Cycle the reassurance text while sending so users know it's still working
  useEffect(() => {
    if (status !== 'sending') {
      setLoadingPhase('sending');
      return;
    }
    const t1 = setTimeout(() => setLoadingPhase('uploading'), 2500);
    const t2 = setTimeout(() => setLoadingPhase('finalizing'), 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [status]);

  const loadingMessage = {
    sending: 'Sending your application...',
    uploading: 'Uploading your files, this may take a moment...',
    finalizing: 'Almost there, finalizing your application...',
  }[loadingPhase];

  // ============================================
  // FILE VALIDATION (client-side, belt & braces)
  // ============================================
  const validateFile = (
    file: File,
    allowedTypes: string[],
    label: string
  ): string => {
    if (file.size > MAX_FILE_SIZE) {
      return `${label} is too large (max 3MB). Try compressing the file.`;
    }
    if (!allowedTypes.includes(file.type)) {
      return `${label}: file type not allowed. Please use ${
        label === 'CV' ? 'PDF, JPG, or PNG' : 'JPG or PNG'
      }.`;
    }
    return '';
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCvError('');
    if (!file) {
      setCvFile(null);
      return;
    }
    const err = validateFile(
      file,
      ['application/pdf', 'image/jpeg', 'image/png'],
      'CV'
    );
    if (err) {
      setCvError(err);
      setCvFile(null);
      if (cvInputRef.current) cvInputRef.current.value = '';
      return;
    }
    setCvFile(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError('');
    if (!file) {
      setPhotoFile(null);
      return;
    }
    const err = validateFile(file, ['image/jpeg', 'image/png'], 'Photo');
    if (err) {
      setPhotoError(err);
      setPhotoFile(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }
    setPhotoFile(file);
  };

  const removeCv = () => {
    setCvFile(null);
    setCvError('');
    if (cvInputRef.current) cvInputRef.current.value = '';
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoError('');
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    // Honeypot
    if (formData.website) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
      return;
    }

    // Time check
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp < 3) {
      setStatus('error');
      setErrorMessage('Please wait a moment before submitting.');
      return;
    }

    // Required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.department) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (!cvFile) {
      setStatus('error');
      setErrorMessage('Please upload your CV or resume.');
      return;
    }

    if (!formData.consent) {
      setStatus('error');
      setErrorMessage('Please accept the data processing consent to apply.');
      return;
    }

    try {
      // reCAPTCHA token — check window.grecaptcha directly (no state guard).
      // The script may already be cached from another page, so onLoad doesn't always fire.
      let recaptchaToken = '';
      if ((window as any).grecaptcha?.enterprise) {
        try {
          recaptchaToken = await (window as any).grecaptcha.enterprise.execute(
            RECAPTCHA_SITE_KEY,
            { action: 'JOB_APPLICATION' }
          );
        } catch (err) {
          console.error('reCAPTCHA execute failed:', err);
        }
      }

      // Dev mode — just log
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.log('Job Application (Dev Mode):', {
          ...formData,
          cv: cvFile?.name,
          photo: photoFile?.name,
          recaptcha: recaptchaToken ? 'Token received' : 'No token',
        });
        await new Promise((r) => setTimeout(r, 2000));
        setStatus('success');
        resetForm();
        return;
      }

      // Build multipart form data
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('department', formData.department);
      fd.append('position', formData.position);
      fd.append('message', formData.message);
      fd.append('consent', formData.consent ? '1' : '');
      fd.append('website', formData.website);
      fd.append('_timestamp', String(timestamp));
      fd.append('_recaptcha', recaptchaToken);
      fd.append('cv', cvFile);
      if (photoFile) {
        fd.append('photo', photoFile);
      }

      const response = await fetch('/backend/join-us.php', {
        method: 'POST',
        body: fd,
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        resetForm();
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        'Failed to send application. Please email us directly at recruitment@maida.pt'
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      message: '',
      consent: false,
      website: '',
    });
    setCvFile(null);
    setPhotoFile(null);
    if (cvInputRef.current) cvInputRef.current.value = '';
    if (photoInputRef.current) photoInputRef.current.value = '';
    setTimestamp(Math.floor(Date.now() / 1000));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isSending = status === 'sending';

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-warm-white pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal mb-4">
              Join Us
            </h1>
            <p className="text-charcoal/70 max-w-xl mx-auto text-base md:text-lg">
              We are always looking for warm, talented people to join our team in the
              kitchen, behind the bar, and on the floor. Tell us a bit about yourself
              and we&apos;ll be in touch.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative bg-sand/30 p-6 md:p-10">
              {/* Loading overlay */}
              <AnimatePresence>
                {isSending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-sand/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center px-6"
                  >
                    {/* Spinner */}
                    <div className="relative w-14 h-14 mb-6">
                      <div className="absolute inset-0 border-4 border-terracotta/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
                    </div>

                    {/* Reassurance text — changes over time */}
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingPhase}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3 }}
                        className="text-charcoal text-base md:text-lg text-center mb-4"
                      >
                        {loadingMessage}
                      </motion.p>
                    </AnimatePresence>

                    {/* Indeterminate progress bar */}
                    <div className="w-48 h-1 bg-terracotta/15 overflow-hidden rounded-full">
                      <motion.div
                        className="h-full bg-terracotta rounded-full"
                        initial={{ x: '-100%', width: '40%' }}
                        animate={{ x: '250%' }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </div>

                    <p className="text-xs text-charcoal/50 mt-6 text-center max-w-xs">
                      Please don&apos;t close this page.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-10"
                  >
                    <div className="text-5xl mb-4">✓</div>
                    <h2 className="font-display text-2xl text-charcoal mb-3">
                      Thank you!
                    </h2>
                    <p className="text-charcoal/70 max-w-md mx-auto">
                      Your application has been received. We review every application
                      personally and will get back to you if there&apos;s a good fit.
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-6 text-terracotta hover:text-terracotta/80 text-sm underline"
                    >
                      Submit another application
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    noValidate
                  >
                    <fieldset disabled={isSending} className="space-y-6 disabled:opacity-100">
                      {/* Honeypot */}
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

                      {/* Name + Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-charcoal mb-2"
                          >
                            Full name *
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
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-charcoal mb-2"
                          >
                            Email *
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
                      </div>

                      {/* Phone */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-charcoal mb-2"
                        >
                          Phone *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-stone/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
                          placeholder="+351 912 345 678"
                        />
                      </div>

                      {/* Department — radio buttons */}
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-3">
                          Where would you like to work? *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {(['Kitchen', 'Bar', 'Floor'] as Department[]).map((dept) => (
                            <label
                              key={dept}
                              className={`flex items-center justify-center px-4 py-3 bg-white border cursor-pointer transition-all ${
                                formData.department === dept
                                  ? 'border-terracotta ring-2 ring-terracotta/30 text-terracotta font-medium'
                                  : 'border-stone/20 text-charcoal hover:border-terracotta/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="department"
                                value={dept}
                                checked={formData.department === dept}
                                onChange={handleChange}
                                className="sr-only"
                                required
                              />
                              {dept}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Position (optional) */}
                      <div>
                        <label
                          htmlFor="position"
                          className="block text-sm font-medium text-charcoal mb-2"
                        >
                          Position{' '}
                          <span className="text-stone/60 font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          id="position"
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-stone/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
                          placeholder="e.g. Line cook, Bartender, Server"
                        />
                      </div>

                      {/* Message (optional) */}
                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-charcoal mb-2"
                        >
                          Tell us about yourself{' '}
                          <span className="text-stone/60 font-normal">(optional)</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white border border-stone/20 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors resize-none"
                          placeholder="Your experience, what you're looking for, when you can start..."
                        />
                      </div>

                      {/* CV Upload — required */}
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                          CV / Resume *
                        </label>
                        <p className="text-xs text-charcoal/60 mb-2">
                          PDF, JPG, or PNG. Max 3MB.
                        </p>
                        {!cvFile ? (
                          <label className="flex flex-col items-center justify-center w-full px-4 py-6 bg-white border-2 border-dashed border-stone/30 cursor-pointer hover:border-terracotta/60 transition-colors">
                            <svg
                              className="w-8 h-8 text-stone/50 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                            <span className="text-sm text-charcoal">
                              Click to upload your CV
                            </span>
                            <input
                              ref={cvInputRef}
                              type="file"
                              accept={CV_ACCEPT}
                              onChange={handleCvChange}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-between bg-white border border-stone/20 px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <svg
                                className="w-5 h-5 text-terracotta flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <div className="min-w-0">
                                <p className="text-sm text-charcoal truncate">
                                  {cvFile.name}
                                </p>
                                <p className="text-xs text-charcoal/50">
                                  {formatFileSize(cvFile.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeCv}
                              className="text-xs text-stone hover:text-terracotta ml-3 flex-shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        {cvError && (
                          <p className="text-red-600 text-xs mt-2">{cvError}</p>
                        )}
                      </div>

                      {/* Photo Upload — optional */}
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                          Your photo{' '}
                          <span className="text-stone/60 font-normal">(optional)</span>
                        </label>
                        <p className="text-xs text-charcoal/60 mb-2">
                          A recent photo of yourself. JPG or PNG. Max 3MB.
                        </p>
                        {!photoFile ? (
                          <label className="flex flex-col items-center justify-center w-full px-4 py-5 bg-white border-2 border-dashed border-stone/30 cursor-pointer hover:border-terracotta/60 transition-colors">
                            <svg
                              className="w-7 h-7 text-stone/50 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="text-sm text-charcoal">
                              Click to upload a photo
                            </span>
                            <input
                              ref={photoInputRef}
                              type="file"
                              accept={PHOTO_ACCEPT}
                              onChange={handlePhotoChange}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-between bg-white border border-stone/20 px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <svg
                                className="w-5 h-5 text-terracotta flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <div className="min-w-0">
                                <p className="text-sm text-charcoal truncate">
                                  {photoFile.name}
                                </p>
                                <p className="text-xs text-charcoal/50">
                                  {formatFileSize(photoFile.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="text-xs text-stone hover:text-terracotta ml-3 flex-shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        {photoError && (
                          <p className="text-red-600 text-xs mt-2">{photoError}</p>
                        )}
                      </div>

                      {/* GDPR consent */}
                      <div className="flex items-start gap-3 pt-2">
                        <input
                          type="checkbox"
                          id="consent"
                          name="consent"
                          checked={formData.consent}
                          onChange={handleChange}
                          required
                          className="mt-1 w-4 h-4 accent-terracotta cursor-pointer flex-shrink-0"
                        />
                        <label
                          htmlFor="consent"
                          className="text-xs text-charcoal/70 leading-relaxed cursor-pointer"
                        >
                          I agree that Maída may store and process the information and
                          files I&apos;ve provided for the purpose of evaluating my job
                          application. I can contact{' '}
                          <a
                            href="mailto:recruitment@maida.pt"
                            className="text-terracotta hover:underline"
                          >
                            recruitment@maida.pt
                          </a>{' '}
                          at any time to request deletion of my data.
                        </label>
                      </div>

                      {/* Error */}
                      {status === 'error' && errorMessage && (
                        <p className="text-red-600 text-sm bg-red-50 p-3">
                          {errorMessage}
                        </p>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSending}
                        className="w-full bg-terracotta text-warm-white px-6 py-3 font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? 'Sending...' : 'Send application'}
                      </button>

                      <p className="text-xs text-stone/60 text-center">
                        Protected by reCAPTCHA. The Google{' '}
                        <a
                          href="https://policies.google.com/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-terracotta"
                        >
                          Privacy Policy
                        </a>{' '}
                        and{' '}
                        <a
                          href="https://policies.google.com/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-terracotta"
                        >
                          Terms of Service
                        </a>{' '}
                        apply.
                      </p>
                    </fieldset>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
