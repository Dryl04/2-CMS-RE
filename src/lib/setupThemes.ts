export async function createThemesTable(): Promise<{
  success: boolean;
  message: string;
}> {
  return {
    success: false,
    message:
      "The legacy theme table bootstrap is deprecated in the PostgreSQL migration. Use the active page theme and DaisyUI theme managers instead.",
  };
}

export async function insertDefaultThemes(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  return {
    success: false,
    message:
      "The legacy default-theme SQL bootstrap is deprecated in the PostgreSQL migration.",
    count: 0,
  };
}

export function getSQLScript(): string {
  return `-- Legacy theme bootstrap retired
-- This UI path is no longer backed by Supabase.
-- Use the PostgreSQL-backed page theme manager and DaisyUI theme manager instead.`;
}
