import React from 'react';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Math Quest - Begin Your Quest',
  description: 'An interactive fantasy mathematics adventure game for practicing algebra and operations with step-by-step wizard guidance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Material Symbols */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&family=Nunito+Sans:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#f8f9ff]">
        {children}

         <Analytics />
      </body>
    </html>
  );
}
