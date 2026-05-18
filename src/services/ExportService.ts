
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

class ExportService {
  /**
   * Generates a CSV file with enhanced formatting and support for nested objects
   */
  exportToCSV(data: Record<string, unknown>[], filename: string) {
    if (!data || !data.length) return;
    
    const flatData = data.map(item => this.flattenObject(item));
    const headers = Object.keys(flatData[0]);
    
    const csvRows = [
      headers.join(','),
      ...flatData.map(row => 
        headers.map(header => {
          let value = row[header];
          
          if (value instanceof Date) {
            value = format(value, 'dd/MM/yyyy HH:mm:ss');
          } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            try {
              value = format(new Date(value), 'dd/MM/yyyy HH:mm:ss');
            } catch (e) {
              // keep as is
            }
          }
          
          const stringValue = value === null || value === undefined ? '' : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
  }

  private flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    return Object.keys(obj).reduce((acc: Record<string, unknown>, k: string) => {
      const pre = prefix.length ? prefix + '_' : '';
      const value = obj[k];

      if (value && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
        Object.assign(acc, this.flattenObject(value as Record<string, unknown>, pre + k));
      } else if (Array.isArray(value)) {
        acc[pre + k] = value.map((v: unknown) => 
          (v && typeof v === 'object') ? JSON.stringify(v) : String(v)
        ).join('; ');
      } else {
        acc[pre + k] = value;
      }
      return acc;
    }, {});
  }

  exportToJSON(data: unknown[], filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `${filename}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.json`);
  }

}

export const exportService = new ExportService();
