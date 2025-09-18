import React from 'react';

export default function Table({ data, columns, keyField, emptyMessage = 'No data available' }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white">
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={String(item[keyField])}>
              {columns.map((column, index) => (
                <td
                  key={index}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {column.render
                    ? column.render(item)
                    : String(item[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
