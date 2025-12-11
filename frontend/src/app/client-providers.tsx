"use client";

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/react-query';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ 
  children 
}: ClientProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}