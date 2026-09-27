import React from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '@/db';

export const DatabaseProvider = ({ children }: { children: React.ReactNode }) => (
  <SQLiteProvider databaseName="eduflow.db" onInit={migrateDbIfNeeded} useSuspense>
    {children}
  </SQLiteProvider>
);
