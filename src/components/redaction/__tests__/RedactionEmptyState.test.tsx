import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RedactionEmptyState from '@/components/redaction/RedactionEmptyState';

describe('RedactionEmptyState', () => {
  it('affiche létat vide de bienvenue quand pas de filtres', () => {
    render(
      <RedactionEmptyState
        hasFilters={false}
        currentFolderName="Tous les documents"
        onCreateDocument={() => {}}
        onClearFilters={() => {}}
      />
    );
    expect(screen.getByText('Bienvenue dans la Rédaction')).toBeInTheDocument();
    expect(screen.getByText('Créer mon premier document')).toBeInTheDocument();
  });

  it('affiche létat « aucun résultat » quand il y a des filtres', () => {
    render(
      <RedactionEmptyState
        hasFilters={true}
        currentFolderName="Services"
        onCreateDocument={() => {}}
        onClearFilters={() => {}}
      />
    );
    expect(screen.getByText('Aucun résultat')).toBeInTheDocument();
    expect(screen.getByText('Réinitialiser les filtres')).toBeInTheDocument();
  });

  it('appelle onCreateDocument au clic sur le bouton de création', async () => {
    const user = userEvent.setup();
    let called = false;
    render(
      <RedactionEmptyState
        hasFilters={false}
        currentFolderName="Tous"
        onCreateDocument={() => { called = true; }}
        onClearFilters={() => {}}
      />
    );
    await user.click(screen.getByText('Créer mon premier document'));
    expect(called).toBe(true);
  });

  it('appelle onClearFilters au clic sur réinitialiser', async () => {
    const user = userEvent.setup();
    let called = false;
    render(
      <RedactionEmptyState
        hasFilters={true}
        currentFolderName="Blog"
        onCreateDocument={() => {}}
        onClearFilters={() => { called = true; }}
      />
    );
    await user.click(screen.getByText('Réinitialiser les filtres'));
    expect(called).toBe(true);
  });
});
