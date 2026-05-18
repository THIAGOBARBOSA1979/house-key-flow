
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UploadDocumentDialog } from '../components/Documents/UploadDocumentDialog';
import { documentService } from '../services/DocumentService';
import { Toaster } from '../components/ui/toaster';

// Mock documentService.createDocument
vi.mock('../services/DocumentService', async () => {
  const actual = await vi.importActual('../services/DocumentService');
  return {
    ...actual as any,
    documentService: {
      ... (actual as any).documentService,
      createDocument: vi.fn(),
      getCategories: vi.fn(() => [{ id: 'contrato', name: 'Contratos' }])
    },
  };
});

describe('Upload Flow', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error toast if title is missing', async () => {
    render(
      <>
        <Toaster />
        <UploadDocumentDialog isOpen={true} onClose={onClose} onSuccess={onSuccess} />
      </>
    );

    const saveBtn = screen.getByText(/Salvar Documento/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Campo obrigatório/i)).toBeDefined();
    });
    expect(documentService.createDocument).not.toHaveBeenCalled();
  });

  it('should call createDocument and close on valid input', async () => {
    render(
      <>
        <Toaster />
        <UploadDocumentDialog isOpen={true} onClose={onClose} onSuccess={onSuccess} />
      </>
    );

    const titleInput = screen.getByPlaceholderText(/Ex: Alvará de Construção/i);
    fireEvent.change(titleInput, { target: { value: 'Novo Contrato' } });

    const saveBtn = screen.getByText(/Salvar Documento/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(documentService.createDocument).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Novo Contrato',
        status: 'published'
      }));
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
