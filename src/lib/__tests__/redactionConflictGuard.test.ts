import { describe, it, expect } from 'vitest';
import { isLockedByOther } from '@/lib/redactionConflictGuard';

// ===================================================================
// Tests unitaires : redactionConflictGuard (logique locale)
// Les fonctions async (acquireEditLock, etc.) appellent Supabase
// et sont testées en intégration. Ici on teste la logique pure.
// ===================================================================

describe("isLockedByOther", () => {
  const userId = 'user-123';

  it("retourne false si pas de verrou", () => {
    const doc = { edit_lock_user_id: null, edit_lock_at: null };
    expect(isLockedByOther(doc, userId)).toBe(false);
  });

  it("retourne false si verrouillé par le même utilisateur", () => {
    const doc = {
      edit_lock_user_id: userId,
      edit_lock_at: new Date().toISOString(),
    };
    expect(isLockedByOther(doc, userId)).toBe(false);
  });

  it("retourne true si verrouillé par un autre utilisateur (récent)", () => {
    const doc = {
      edit_lock_user_id: 'other-user',
      edit_lock_at: new Date().toISOString(),
    };
    expect(isLockedByOther(doc, userId)).toBe(true);
  });

  it("retourne false si le verrou d'un autre est périmé (> 5 min)", () => {
    const staleDate = new Date(Date.now() - 6 * 60 * 1000).toISOString();
    const doc = {
      edit_lock_user_id: 'other-user',
      edit_lock_at: staleDate,
    };
    expect(isLockedByOther(doc, userId)).toBe(false);
  });

  it("retourne true si le verrou d'un autre est tout juste en dessous du seuil", () => {
    const recentDate = new Date(Date.now() - 4 * 60 * 1000).toISOString();
    const doc = {
      edit_lock_user_id: 'other-user',
      edit_lock_at: recentDate,
    };
    expect(isLockedByOther(doc, userId)).toBe(true);
  });

  it("retourne false si edit_lock_at est null (aucun timestamp)", () => {
    const doc = {
      edit_lock_user_id: 'other-user',
      edit_lock_at: null,
    };
    // Date(null) → epoch → age > 5 min → périmé
    expect(isLockedByOther(doc, userId)).toBe(false);
  });
});
