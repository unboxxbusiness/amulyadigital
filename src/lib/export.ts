
'use client';

/**
 * Converts an array of objects to a CSV string.
 */
function convertToCSV(data: any[]): string {
    if (!data || data.length === 0) {
        return "";
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) {
                value = "";
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            
            const stringValue = String(value);
            // Escape quotes and wrap in quotes if necessary
            if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

/**
 * Triggers a browser download for the given CSV data.
 */
export function downloadToCSV(data: any[], filename: string) {
    const csvString = convertToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}
