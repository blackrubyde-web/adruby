import Papa from 'papaparse';
import { toPng } from 'html-to-image';

export const exportTableToCsv = (rows: Record<string, any>[], filename = 'table.csv') => {
  if (!rows?.length) return;
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(url);
};

export const exportNodeToPng = async (node: HTMLElement | null, filename = 'chart.png') => {
  if (!node) return;
  const dataUrl = await toPng(node);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};
