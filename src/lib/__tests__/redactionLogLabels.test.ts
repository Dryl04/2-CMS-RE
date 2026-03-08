import { describe, it, expect } from 'vitest';
import { EVENT_LABELS, EVENT_ICONS, EVENT_COLORS } from '@/lib/redactionLogLabels';
import type { ActivityEventType } from '@/lib/redactionTypes';

// ===================================================================
// Tests unitaires : redactionLogLabels
// ===================================================================

const ALL_EVENT_TYPES: ActivityEventType[] = [
  'document_created',
  'document_updated',
  'document_content_updated',
  'document_renamed',
  'document_moved',
  'document_duplicated',
  'document_archived',
  'document_trashed',
  'document_restored',
  'document_deleted',
  'status_changed',
  'editor_mode_changed',
  'permission_granted',
  'permission_revoked',
  'ai_conversation_started',
  'ai_json_generated',
  'json_copied',
  'page_published',
  'folder_created',
  'folder_renamed',
  'folder_moved',
  'folder_deleted',
];

describe("EVENT_LABELS", () => {
  it("couvre tous les types d'événements", () => {
    for (const type of ALL_EVENT_TYPES) {
      expect(EVENT_LABELS[type]).toBeDefined();
      expect(typeof EVENT_LABELS[type]).toBe('string');
      expect(EVENT_LABELS[type].length).toBeGreaterThan(0);
    }
  });

  it("n'a pas de clés inattendues", () => {
    const keys = Object.keys(EVENT_LABELS);
    expect(keys).toHaveLength(ALL_EVENT_TYPES.length);
  });
});

describe('EVENT_ICONS', () => {
  it("couvre tous les types d'événements", () => {
    for (const type of ALL_EVENT_TYPES) {
      expect(EVENT_ICONS[type]).toBeDefined();
      expect(typeof EVENT_ICONS[type]).toBe('string');
    }
  });

  it("n'a pas de clés inattendues", () => {
    expect(Object.keys(EVENT_ICONS)).toHaveLength(ALL_EVENT_TYPES.length);
  });
});

describe('EVENT_COLORS', () => {
  it("couvre tous les types d'événements", () => {
    for (const type of ALL_EVENT_TYPES) {
      expect(EVENT_COLORS[type]).toBeDefined();
      expect(EVENT_COLORS[type]).toMatch(/^text-/);
    }
  });

  it("n'a pas de clés inattendues", () => {
    expect(Object.keys(EVENT_COLORS)).toHaveLength(ALL_EVENT_TYPES.length);
  });
});
