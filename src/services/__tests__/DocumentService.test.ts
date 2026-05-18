
import { describe, it, expect, beforeEach } from 'vitest';
import { documentService } from '../operations/DocumentService';

describe('DocumentService - Digital Signature Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    // Re-initialize service or clear items manually since it's a singleton
    (documentService as any).items = [];
  });

  it('should create a document and add a signer', () => {
    const doc = documentService.createDocument({
      title: 'Contrato de Teste',
      category: 'contrato'
    });

    expect(doc.id).toBeDefined();
    expect(doc.approvalStatus).toBe('pending');

    const signer = documentService.addSigner(doc.id, {
      name: 'João Signatário',
      email: 'joao@teste.com',
      role: 'Testemunha',
      confirmationMethod: 'email'
    });

    expect(signer).toBeDefined();
    expect(signer?.status).toBe('pending');
    
    const updatedDoc = documentService.getDocumentById(doc.id);
    expect(updatedDoc?.signatures).toHaveLength(1);
    expect(updatedDoc?.signatures?.[0].name).toBe('João Signatário');
  });

  it('should sign a document successfully', () => {
    const doc = documentService.createDocument({ title: 'Doc to Sign' });
    const signer = documentService.addSigner(doc.id, {
      name: 'Signer',
      email: 's@s.com',
      role: 'Owner',
      confirmationMethod: 'sms'
    });

    const success = documentService.signDocument(doc.id, signer!.id, 'sms', { ip: '127.0.0.1' });
    expect(success).toBe(true);

    const signedDoc = documentService.getDocumentById(doc.id);
    expect(signedDoc?.isSigned).toBe(true);
    expect(signedDoc?.signatures?.[0].status).toBe('signed');
    expect(signedDoc?.signatures?.[0].signedAt).toBeDefined();
  });

  it('should reject a signature with reason', () => {
    const doc = documentService.createDocument({ title: 'Doc to Reject' });
    const signer = documentService.addSigner(doc.id, {
      name: 'Signer',
      email: 's@s.com',
      role: 'Owner',
      confirmationMethod: 'email'
    });

    const success = documentService.rejectSignature(doc.id, signer!.id, 'Dados incorretos');
    expect(success).toBe(true);

    const rejectedDoc = documentService.getDocumentById(doc.id);
    expect(rejectedDoc?.signatures?.[0].status).toBe('rejected');
    expect((rejectedDoc?.signatures?.[0] as any).rejectionReason).toBe('Dados incorretos');
  });
});
