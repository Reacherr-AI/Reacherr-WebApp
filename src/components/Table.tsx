import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Loader, AlertTriangle } from 'lucide-react';

// Reusable type for table columns - now using TanStack's ColumnDef
export type { ColumnDef };

// Props for the generic Table component
interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

const Table = <T,>({
  columns,
  data,
  isLoading = false,
  error = null,
  emptyMessage = 'No data available.',
}: TableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={columns.length} className="text-center p-8">
            <div className="flex justify-center items-center space-x-2 text-gray-500">
              <Loader className="animate-spin" />
              <span>Loading...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={columns.length} className="text-center p-8">
            <div className="flex flex-col items-center justify-center space-y-2 text-red-400">
              <AlertTriangle />
              <span>{error}</span>
            </div>
          </td>
        </tr>
      );
    }

    if (table.getRowModel().rows.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className="text-center p-8 text-gray-500">
            {emptyMessage}
          </td>
        </tr>
      );
    }

    return table.getRowModel().rows.map(row => (
      <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-700/50">
        {row.getVisibleCells().map(cell => (
          <td key={cell.id} className="p-2 text-sm text-gray-300">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-gray-700 bg-gray-800/60">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                                    key={header.id}
                                    colSpan={header.colSpan}
                                    className="p-2 text-sm font-semibold text-gray-300 uppercase tracking-wider"
                                  >
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                          <tbody>{renderContent()}</tbody>
                        </table>
                      </div>
                    );
                  };
                  
                  export default Table;
                  