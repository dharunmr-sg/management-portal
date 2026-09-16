export default function StatCard({ title, value, icon, trend }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
      
      {/* If a trend prop was passed in, show the trend! */}
      {trend && (
        <div className="mt-3 flex items-center text-sm">
          <span className={`font-medium ${trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
          </span>
          <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
