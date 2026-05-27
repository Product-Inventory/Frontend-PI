"use client";

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
}

export function DataTable<T>({ columns, data }: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-4"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row: any, i) => (
              <tr
                key={row.id || i}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                {columns.map((col, j) => (
                  <td key={j} className="py-5 text-gray-700">
                    {col.render
                      ? col.render(row)
                      : String(row[col.accessor])}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-gray-400">
                No hay registros
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}