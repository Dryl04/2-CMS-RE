import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RedactionEditorModeSwitcher from '@/components/redaction/RedactionEditorModeSwitcher';

describe('RedactionEditorModeSwitcher', () => {
  it('affiche les 3 modes', () => {
    render(
      <RedactionEditorModeSwitcher
        currentMode="plain"
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Texte brut')).toBeInTheDocument();
    expect(screen.getByText('Éditeur riche')).toBeInTheDocument();
    expect(screen.getByText('Structuré SEO')).toBeInTheDocument();
  });

  it('le mode actif est désactivé (prevent double-click)', () => {
    render(
      <RedactionEditorModeSwitcher
        currentMode="rich"
        onChange={() => {}}
      />
    );
    const richButton = screen.getByText('Éditeur riche').closest('button')!;
    expect(richButton).toBeDisabled();
  });

  it('appelle onChange avec le bon mode au clic', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RedactionEditorModeSwitcher
        currentMode="plain"
        onChange={onChange}
      />
    );
    await user.click(screen.getByText('Structuré SEO'));
    expect(onChange).toHaveBeenCalledWith('structured');
  });

  it('désactive tous les boutons quand disabled=true', () => {
    render(
      <RedactionEditorModeSwitcher
        currentMode="plain"
        onChange={() => {}}
        disabled
      />
    );
    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
  });
});
