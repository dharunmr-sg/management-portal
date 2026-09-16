import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import usePagination from '../hooks/usePagination';

// 1. Mock Data! This mimics what an API might return.
const mockStats = [
  { id: 1, title: 'Total Users', value: '1,234', trend: { isPositive: true, value: 12 }, icon: '👥' },
  { id: 2, title: 'Active Sessions', value: '892', trend: { isPositive: true, value: 5 }, icon: '🟢' },
  { id: 3, title: 'Bounce Rate', value: '42%', trend: { isPositive: false, value: 2 }, icon: '📉' },
  { id: 4, title: 'New Signups', value: '156', trend: { isPositive: true, value: 24 }, icon: '✨' },
];

// 2. Mock Leaderboard Data
const mockLeaderboard = [
  { id: 1, user: 'Alice Smith', score: 12500, rank: 1 },
  { id: 2, user: 'Bob Jones', score: 11200, rank: 2 },
  { id: 3, user: 'Charlie Brown', score: 10800, rank: 3 },
  { id: 4, user: 'Diana Prince', score: 9500, rank: 4 },
  { id: 5, user: 'Ethan Hunt', score: 8900, rank: 5 },
  { id: 6, user: 'Fiona Gallagher', score: 8400, rank: 6 },
  { id: 7, user: 'George Clark', score: 7200, rank: 7 },
  { id: 8, user: 'Hannah Abbott', score: 6500, rank: 8 },
  { id: 9, user: 'Ian Malcolm', score: 5400, rank: 9 },
  { id: 10, user: 'Jane Doe', score: 4100, rank: 10 },
];

export default function Dashboard() {
  // Use our custom pagination hook! Let's display exactly 4 users per page on the dashboard.
  const { currentPage, totalPages, currentItems, next, prev } = usePagination(mockLeaderboard, 4);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Overview Dashboard</h1>

      {/* 2. Map over the mock data and render a StatCard for each item! */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {mockStats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={<span className="text-xl">{stat.icon}</span>}
          />
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performers Leaderboard</h2>
        
        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="p-3 font-medium">Rank</th>
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((performer) => (
                <tr key={performer.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                  <td className="p-3 font-medium text-gray-900 dark:text-gray-100">#{performer.rank}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400 font-semibold">{performer.user}</td>
                  <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">{performer.score.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={prev} disabled={currentPage === 1}>
              Previous
            </Button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button onClick={next} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
