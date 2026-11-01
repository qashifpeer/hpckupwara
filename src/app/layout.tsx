import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HPC Kupwara - School Monitoring Portal',
  description: 'Holistic Progress Card School Monitoring & Registration Portal for District Kupwara',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#070b14] text-slate-100 antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}