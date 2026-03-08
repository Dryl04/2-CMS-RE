import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StructuredSeoEditor from '@/components/redaction/editors/StructuredSeoEditor';
import { STRUCTURED_FIELDS } from '@/lib/redactionTypes';

describe('StructuredSeoEditor', () => {
  it('affiche tous les champs définis dans STRUCTURED_FIELDS', () => {
    render(
      <StructuredSeoEditor
        value={{}}
        onChange={() => {}}
      />
    );
    for (const field of STRUCTURED_FIELDS) {
      expect(screen.getByText(field.label)).toBeInTheDocument();
    }
  });

  it('affiche les compteurs SEO pour seo_title et meta_description', () => {
    render(
      <StructuredSeoEditor
        value={{ seo_title: 'Mon titre', meta_description: 'Ma description' }}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('9 / 60')).toBeInTheDocument();
    expect(screen.getByText('14 / 160')).toBeInTheDocument();
  });

  it('appelle onChange quand on modifie un champ', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <StructuredSeoEditor
        value={{ seo_title: '' }}
        onChange={onChange}
      />
    );
    const seoTitleInput = screen.getByPlaceholderText('Entrez titre seo…');
    await user.type(seoTitleInput, 'T');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ seo_title: 'T' })
    );
  });

  it('désactive tous les champs quand disabled=true', () => {
    render(
      <StructuredSeoEditor
        value={{}}
        onChange={() => {}}
        disabled
      />
    );
    const inputs = screen.getAllByRole('textbox');
    for (const input of inputs) {
      expect(input).toBeDisabled();
    }
  });
});
