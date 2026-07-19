'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RebuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoStart?: boolean;
}

type RebuildStatus = 'idle' | 'starting' | 'building' | 'success' | 'error';

export default function RebuildModal({ isOpen, onClose, autoStart = true }: RebuildModalProps) {
  const [status, setStatus] = useState<RebuildStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [log, setLog] = useState('');

  // Auto-start rebuild when modal opens
  useEffect(() => {
    if (isOpen && autoStart && status === 'idle') {
      startRebuild();
    }
  }, [isOpen, autoStart]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
        setMessage('');
        setError('');
        setLog('');
      }, 300);
    }
  }, [isOpen]);

  // Poll rebuild status when building
  useEffect(() => {
    if (status !== 'building') return;

    let attempts = 0;
    const maxAttempts = 90; // 3 minutes max (2s intervals)
    
    const checkStatus = async () => {
      attempts++;
      
      // Update fake progress
      const fakeProgress = Math.min(85, 15 + (attempts * 1.2));
      setProgress(fakeProgress);
      
      try {
        const response = await fetch('/api/admin/rebuild', {
          cache: 'no-store',
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update log if available
          if (data.log) {
            setLog(data.log);
            
            // Parse log for status messages
            if (data.log.includes('Running build')) {
              setMessage('Building pages...');
            } else if (data.log.includes('Deleting .next')) {
              setMessage('Clearing cache...');
            } else if (data.log.includes('Waiting')) {
              setMessage('Preparing rebuild...');
            }
          }
          
          // Check if rebuild is complete
          if (!data.isRebuilding) {
            // Check if build was successful
            if (data.log && data.log.includes('✅')) {
              setStatus('success');
              setProgress(100);
              setMessage('Build completed successfully!');
            } else if (data.log && data.log.includes('❌')) {
              setStatus('error');
              setError('Build failed. Check server logs for details.');
              setMessage('Build failed');
            } else {
              // No maintenance flag = rebuild done
              setStatus('success');
              setProgress(100);
              setMessage('Build completed successfully!');
            }
            return;
          }
        }
      } catch (err) {
        // Network error might mean server is restarting - keep polling
        setMessage('Waiting for server...');
      }
      
      if (attempts >= maxAttempts) {
        setStatus('error');
        setError('Build is taking longer than expected. Check the server logs.');
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(checkStatus, 2000);
    
    // Initial check after a short delay
    const timeout = setTimeout(checkStatus, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [status]);

  const startRebuild = async () => {
    setStatus('starting');
    setProgress(5);
    setMessage('Starting rebuild process...');
    setError('');
    setLog('');

    try {
      const response = await fetch('/api/admin/rebuild', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setStatus('building');
        setProgress(10);
        setMessage('Maintenance mode enabled...');
      } else {
        setStatus('error');
        setError(data.details || data.error || 'Failed to start rebuild');
        setMessage('Rebuild failed to start');
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Network error');
      setMessage('Failed to connect to server');
    }
  };

  const handleClose = () => {
    if (status !== 'starting' && status !== 'building') {
      onClose();
    }
  };

  const handleDone = () => {
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E5E5]">
              <h2 className="text-xl font-serif text-[#2C2C2C]">
                {status === 'starting' || status === 'building' ? 'Publishing Changes...' : 
                 status === 'success' ? 'Published Successfully!' :
                 status === 'error' ? 'Publish Failed' : 'Publish Changes'}
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-3 bg-[#E5E5E5] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      status === 'error' ? 'bg-red-500' :
                      status === 'success' ? 'bg-green-500' : 'bg-[#C4A484]'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-sm text-[#6B6B6B] mt-2 text-center">
                  {progress}%
                </p>
              </div>

              {/* Status Icon */}
              <div className="flex justify-center mb-4">
                {(status === 'starting' || status === 'building') && (
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 border-4 border-[#E5E5E5] rounded-full" />
                    <div className="absolute inset-0 border-4 border-[#C4A484] rounded-full border-t-transparent animate-spin" />
                  </div>
                )}
                {status === 'success' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Message */}
              <p className="text-center text-[#2C2C2C] font-medium mb-2">
                {message}
              </p>

              {/* Error Details */}
              {status === 'error' && error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 break-all">
                    {error}
                  </p>
                </div>
              )}

              {/* Success Info */}
              {status === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    Your changes are now live! Click "Done" to refresh and see the updates.
                  </p>
                </div>
              )}

              {/* Building Info */}
              {(status === 'starting' || status === 'building') && (
                <p className="text-center text-sm text-[#9CA3AF] mt-2">
                  This usually takes 1-2 minutes. Please don't close this window.
                </p>
              )}

              {/* Build Log Preview */}
              {status === 'building' && log && (
                <div className="mt-4 p-2 bg-[#2C2C2C] rounded-lg max-h-24 overflow-auto">
                  <pre className="text-xs text-[#9CA3AF] font-mono whitespace-pre-wrap">
                    {log.split('\n').slice(-5).join('\n')}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#F9F9F9] border-t border-[#E5E5E5]">
              {(status === 'starting' || status === 'building') ? (
                <p className="text-center text-sm text-[#6B6B6B]">
                  Visitors see a maintenance page while building...
                </p>
              ) : status === 'success' ? (
                <button
                  onClick={handleDone}
                  className="w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  Done - Refresh Page
                </button>
              ) : status === 'error' ? (
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border border-[#D4C4B5] text-[#6B6B6B] rounded-lg font-medium hover:bg-[#F5F1EB] transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={startRebuild}
                    className="flex-1 px-4 py-2.5 bg-[#C4A484] hover:bg-[#B8956F] text-white rounded-lg font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRebuild}
                  className="w-full px-4 py-2.5 bg-[#C4A484] hover:bg-[#B8956F] text-white rounded-lg font-medium transition-colors"
                >
                  Start Publish
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
