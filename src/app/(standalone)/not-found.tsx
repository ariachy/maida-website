import type { Metadata } from 'next';
import NotFoundContent from '@/components/layout/NotFoundContent';

export const metadata: Metadata = {
  title: '404 | This page went to grab more hummus | Maída',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundContent />;
}