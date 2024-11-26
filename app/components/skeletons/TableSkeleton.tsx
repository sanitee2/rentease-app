const TableSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      {/* Search Bar Skeleton */}
      <div className="p-4 border-b">
        <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></th>
              <th className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></th>
              <th className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></th>
              <th className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></th>
              <th className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></th>
              <th className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></th>
              <th className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></th>
            </tr>
          </thead>
          {/* Body */}
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="border-b">
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="p-4 border-t">
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-8 w-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton; 