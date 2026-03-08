import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RedactionToolbar from '@/components/redaction/RedactionToolbar';
import type { DocumentFilters } from '@/lib/redactionTypes';

describe('RedactionToolbar', () => {
  const defaultFilters: DocumentFilters = {
    search: '',
    folderId: null,
    status: 'all',
    authorId: null,
    sortBy: 'updated_at',
    sortOrder: 'desc',
  };

  it('affiche le champ de recherche', () => {
    render(
      <RedactionToolbar
        filters={defaultFilters}
        onFiltersChange={() => {}}
        sidebarOpen={true}
        onToggleSidebar={() => {}}
        onRefresh={() => {}}
        loading={false}
      />
    );
    expect(screen.getByPlaceholderText('Rechercher un document...')).toBeInTheDocument();
  });

  it('affiche le sélecteur de statut avec les options', () => {
    render(
      <RedactionToolbar
        filters={defaultFilters}
        onFiltersChange={() => {}}
        sidebarOpen={true}
        onToggleSidebar={() => {}}
        onRefresh={() => {}}
        loading={false}
      />
    );
    expect(screen.getByText('Tous les statuts')).toBeInTheDocument();
  });

  it('appelle onFiltersChange quand on tape dans la recherche', async () => {
    const user = userEvent.setup();
    let lastFilters: DocumentFilters | null = null;
    render(
      <RedactionToolbar
        filters={defaultFilters}
        onFiltersChange={(f) => { lastFilters = f; }}
        sidebarOpen={true}
        onToggleSidebar={() => {}}
        onRefresh={() => {}}
        loading={false}
      />
    );
    const input = screen.getByPlaceholderText('Rechercher un document...');
    await user.type(input, 'p');
    expect(lastFilters).not.toBeNull();
    expect(lastFilters!.search).toBe('p');
  });

  it('appelle onToggleSidebar au clic sur le bouton sidebar', async () => {
    const user = userEvent.setup();
    let toggled = false;
    render(
      <RedactionToolbar
        filters={defaultFilters}
        onFiltersChange={() => {}}
        sidebarOpen={true}
        onToggleSidebar={() => { toggled = true; }}
        onRefresh={() => {}}
        loading={false}
      />
    );
    // Le bouton toggle est le premier bouton
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    expect(toggled).toBe(true);
  });

  it('ordre de tri bascule au clic', async () => {
    const user = userEvent.setup();
    let lastFilters: DocumentFilters | null = null;
    render(
      <RedactionToolbar
        filters={defaultFilters}
        onFiltersChange={(f) => { lastFilters = f; }}
        sidebarOpen={true}
        onToggleSidebar={() => {}}
        onRefresh={() => {}}
        loading={false}
      />
    );
    // Le bouton d'ordre de tri est l'avant-dernier bouton
    const buttons = screen.getAllByRole('button');
    // Trouver celui avec title "Décroissant"
    const sortBtn = buttons.find((b) => b.getAttribute('title')?.includes('croissant'));
    expect(sortBtn).toBeDefined();
    await user.click(sortBtn!);
    expect(lastFilters).not.toBeNull();
    expect(lastFilters!.sortOrder).toBe('asc');
  });
});
