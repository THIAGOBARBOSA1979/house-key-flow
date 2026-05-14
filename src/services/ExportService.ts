
import { saveAs } from 'file-saver';

class ExportService {
  /**
   * Simulates a CSV export by generating a file with the given data
   */
  exportToCSV(data: any[], filename: string) {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  }

  /**
   * Simulates a JSON export
   */
  exportToJSON(data: any[], filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  }
}

export const exportService = new ExportService();
