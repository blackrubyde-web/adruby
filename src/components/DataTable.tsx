import React, { useMemo } from 'react';
import {
  Column,
  useFilters,
  usePagination,
  useSortBy,
  useTable,
  HeaderGroup,
  Row
} from 'react-table';
import { exportTableToCsv } from '../utils/export';
import { DataTableSummary } from '../api/types';

interface DataTableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  summary?: DataTableSummary<T>;
  title?: string;
  onExportCsv?: (rows: T[]) => void;
}

const DefaultColumnFilter = ({ column: { filterValue, setFilter } }: any) => {
  return (
    <input
      value={filterValue || ''}
      onChange={(e) => setFilter(e.target.value || undefined)}
      placeholder="Filter..."
      className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
    />
  );
};

export function DataTable<T extends object>({ data, columns, summary, title, onExportCsv }: DataTableProps<T>) {
  const memoColumns = useMemo(() => columns, [columns]);
  const memoData = useMemo(() => data, [data]);

  const tableInstance = useTable<T>(
    {
      columns: memoColumns,
      data: memoData,
      defaultColumn: { Filter: DefaultColumnFilter }
    },
    useFilters,
    useSortBy,
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    state: { pageIndex }
  } = tableInstance;

  const handleExport = () => {
    if (onExportCsv) {
      onExportCsv(memoData);
    } else {
      exportTableToCsv(memoData as unknown as Record<string, any>[], 'table-export.csv');
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card/80 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {title ? <h3 className="text-sm font-semibold text-foreground">{title}</h3> : <div />}
        <button
          type="button"
          onClick={handleExport}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-accent/40">
            {headerGroups.map((headerGroup: HeaderGroup<T>) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    <div className="flex items-center gap-2">
                      {column.render('Header')}
                      <span className="text-[10px]">
                        {column.isSorted ? (column.isSortedDesc ? '▼' : '▲') : ''}
                      </span>
                    </div>
                    {column.canFilter ? <div className="mt-2">{column.render('Filter')}</div> : null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-border">
            {page.map((row: Row<T>) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="hover:bg-accent/30">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="px-4 py-3 text-foreground text-sm">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
            {summary && (
              <tr className="bg-accent/30 font-semibold text-foreground">
                {headerGroups[0].headers.map((column, idx) => {
                  const value =
                    idx === 0
                      ? summary.label
                      : (summary.totals as any)[column.id] ?? (summary.totals as any)[column.accessor as string];
                  return (
                    <td key={column.id} className="px-4 py-3">
                      {typeof value === 'number' ? value.toLocaleString() : value ?? ''}
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
        <div>
          Seite {pageIndex + 1} / {Math.ceil(memoData.length / 10) || 1}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="rounded-md border border-border bg-background px-2 py-1 disabled:opacity-40"
          >
            Zurück
          </button>
          <button
            type="button"
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="rounded-md border border-border bg-background px-2 py-1 disabled:opacity-40"
          >
            Weiter
          </button>
        </div>
      </div>
      {summary?.description && (
        <p className="px-4 pb-4 text-[11px] text-muted-foreground">{summary.description}</p>
      )}
    </div>
  );
}

export default DataTable;
