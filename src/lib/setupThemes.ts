import { api } from './api';
import { defaultThemes } from './defaultThemes';

export async function createThemesTable(): Promise<{ success: boolean; message: string }> {
  // No longer needed - the backend handles table creation via Prisma migrations
  return {
    success: true,
    message: 'Table creation is handled by the backend via Prisma migrations.',
  };
}

export async function insertDefaultThemes(): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const { data, error } = await api.themes.classic.initialize();

    if (error) throw error;

    return {
      success: true,
      message: data?.message || 'Themes initialized',
      count: data?.count || 0,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getSQLScript(): string {
  return '-- Table creation is now handled by Prisma migrations.\n-- Run: cd backend && npx prisma migrate deploy';
}
