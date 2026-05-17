
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

class ExportService {
  /**
   * Generates a CSV file with enhanced formatting and support for nested objects
   */
  exportToCSV(data: any[], filename: string) {
    if (!data || !data.length) return;
    
    // Flatten nested objects for better spreadsheet compatibility
    const flatData = data.map(item => this.flattenObject(item));
    const headers = Object.keys(flatData[0]);
    
    const csvRows = [
      headers.join(','),
      ...flatData.map(row => 
        headers.map(header => {
          let value = row[header];
          
          // Format dates
          if (value instanceof Date) {
            value = format(value, 'dd/MM/yyyy HH:mm:ss');
          } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            try {
              value = format(new Date(value), 'dd/MM/yyyy HH:mm:ss');
            } catch (e) {
              // keep as is if not a valid date
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

  /**
   * Helper to flatten nested objects into a single level
   */
  private flattenObject(obj: any, prefix = ''): any {
    return Object.keys(obj).reduce((acc: any, k: string) => {
      const pre = prefix.length ? prefix + '_' : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !(obj[k] instanceof Date) && !Array.isArray(obj[k])) {
        Object.assign(acc, this.flattenObject(obj[k], pre + k));
      } else if (Array.isArray(obj[k])) {
        acc[pre + k] = obj[k].join('; ');
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  }

  /**
   * Simulates a JSON export
   */
  exportToJSON(data: any[], filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `${filename}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.json`);
  }
}

export const exportService = new ExportService();
