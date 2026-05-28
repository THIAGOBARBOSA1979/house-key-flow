import { SupabaseBaseService } from "../SupabaseBaseService";

export interface ClientInvoice {
  id: string;
  company_id: string;
  client_id: string;
  property_id?: string;
  unit_number?: string;
  title: string;
  description?: string;
  amount: number;
  due_date: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoice_url?: string;
  barcode?: string;
  pix_code?: string;
  paid_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

class FinancialService extends SupabaseBaseService<ClientInvoice> {
  constructor() {
    super({
      storageKey: "a2_client_invoices",
      supabaseTable: "client_invoices",
      auditEntityType: "invoice",
      shouldSyncWithSupabase: true,
      fieldMapping: {
        amount: 'amount',
        dueDate: 'due_date',
        paidAt: 'paid_at',
        invoiceUrl: 'invoice_url',
        pixCode: 'pix_code'
      }
    });
  }

  async getClientInvoices(clientId: string): Promise<ClientInvoice[]> {
    return await this.getAllFiltered({ client_id: clientId });
  }

  async payInvoice(invoiceId: string): Promise<ClientInvoice | undefined> {
    return await this.update(invoiceId, { 
      status: 'paid', 
      paid_at: new Date() 
    });
  }
}

export const financialService = new FinancialService();
