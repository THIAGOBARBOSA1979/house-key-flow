
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { documentService } from '@/services/operations/DocumentService';

describe('Digital Signature Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    documentService.clearAllData();
    vi.clearAllMocks();
  });

  it('should create a document and add signers', async () => {
    const doc = await documentService.createDocument({
      title: 'Termo de Entrega de Chaves',
      category: 'contrato',
      associatedTo: { client: 'Ana Clara', property: 'Vila Park', unit: '12' }
    });

    expect(doc.status).toBe('draft');
    
    const signer = await documentService.addSigner(doc.id, {
      name: 'Ana Clara',
      email: 'ana@email.com',
      role: 'Client',
      confirmationMethod: 'email'
    });

    expect(signer).not.toBeNull();
    const updatedDoc = documentService.getById(doc.id);
    expect(updatedDoc?.signatures).toHaveLength(1);
  });


  it('should update document status when signed', async () => {
    const doc = await documentService.createDocument({ title: 'Test Sign' });
    const signer = await documentService.addSigner(doc.id, {
      name: 'S1',
      email: 's1@e.com',
      role: 'R',
      confirmationMethod: 'email'
    });

    if (signer) {
      const result = await documentService.signDocument(doc.id, signer.id);
      expect(result).toBe(true);
      
      const signedDoc = documentService.getById(doc.id);
      expect(signedDoc?.isSigned).toBe(true);
      expect(signedDoc?.signatures?.[0].status).toBe('signed');
      expect(signedDoc?.signatures?.[0].signedAt).toBeDefined();
    }
  });


  it('should record rejection with reason', async () => {
    const doc = await documentService.createDocument({ title: 'Test Reject' });
    const signer = await documentService.addSigner(doc.id, {
      name: 'S2',
      email: 's2@e.com',
      role: 'R',
      confirmationMethod: 'email'
    });

    if (signer) {
      await documentService.rejectSignature(doc.id, signer.id, 'Dados incorretos no termo');
      
      const rejectedDoc = documentService.getById(doc.id);
      expect(rejectedDoc?.signatures?.[0].status).toBe('rejected');
      // @ts-expect-error - rejectionReason may not be in base type
      expect(rejectedDoc?.signatures?.[0].rejectionReason).toBe('Dados incorretos no termo');
    }
  });

});
