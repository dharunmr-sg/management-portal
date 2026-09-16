import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  // MOCK DATA

  const kpis = [
    { title: 'Total Users', value: '2,845', trend: '+12.5%', isPositive: true },
    { title: 'Active Organizations', value: '86', trend: '+8.2%', isPositive: true },
    { title: 'Total XR Experiences', value: '142', trend: '+15 new this month', isPositive: true },
    { title: 'Total Sessions', value: '18,420', trend: '+18.4%', isPositive: true },
    { title: 'Avg Session Duration', value: '24 min', trend: '+4.6%', isPositive: true },
    { title: 'Completion Rate', value: '78.6%', trend: '+6.1%', isPositive: true }
  ];

  // User Growth data
  const userGrowth = [
    { label: 'Jan', value: 1200 },
    { label: 'Feb', value: 1450 },
    { label: 'Mar', value: 1680 },
    { label: 'Apr', value: 1920 },
    { label: 'May', value: 2240 },
    { label: 'Jun', value: 2580 },
    { label: 'Jul', value: 2845 }
  ];
  const maxGrowth = Math.max(...userGrowth.map(d => d.value));

  // Session Activity data (Weekly)
  const sessionActivity = [
    { day: 'Mon', completed: 420, inProgress: 80 },
    { day: 'Tue', completed: 510, inProgress: 95 },
    { day: 'Wed', completed: 480, inProgress: 60 },
    { day: 'Thu', completed: 620, inProgress: 110 },
    { day: 'Fri', completed: 580, inProgress: 90 },
    { day: 'Sat', completed: 310, inProgress: 45 },
    { day: 'Sun', completed: 290, inProgress: 35 },
  ];
  const maxSession = Math.max(...sessionActivity.map(d => d.completed + d.inProgress));

  // Organization Types
  const orgDistribution = [
    { type: 'Educational', count: 32, color: 'bg-blue-500' },
    { type: 'Corporate', count: 24, color: 'bg-indigo-500' },
    { type: 'Training Center', count: 14, color: 'bg-purple-500' },
    { type: 'Healthcare', count: 8, color: 'bg-emerald-500' },
    { type: 'Government', count: 5, color: 'bg-amber-500' },
    { type: 'Startup', count: 3, color: 'bg-pink-500' },
  ];
  const totalOrgs = orgDistribution.reduce((sum, item) => sum + item.count, 0);

  // Experience Performance
  const experiences = [
    { id: 1, name: 'Virtual Safety Training', org: 'TechCorp Logistics', sessions: 4250, completion: '92%', rating: 4.8, status: 'Active' },
    { id: 2, name: 'Human Anatomy Explorer', org: 'Global Health Institute', sessions: 3120, completion: '88%', rating: 4.9, status: 'Active' },
    { id: 3, name: 'Industrial Equipment Demo', org: 'Pioneer Robotics', sessions: 1840, completion: '74%', rating: 4.2, status: 'Active' },
    { id: 4, name: 'Campus Orientation 360', org: 'EduTech Academy', sessions: 5600, completion: '65%', rating: 4.5, status: 'Inactive' },
    { id: 5, name: 'Product Design Lab', org: 'Nova Startups', sessions: 890, completion: '81%', rating: 4.7, status: 'Active' },
  ];

  // Recent Activity
  const recentActivities = [
    { id: 1, text: 'A new organization "Nova Startups" was registered.', time: '2 hours ago', type: 'Org' },
    { id: 2, text: 'Jane Doe completed "Virtual Safety Training".', time: '4 hours ago', type: 'Session' },
    { id: 3, text: 'EduTech Academy upgraded to Business Plan.', time: '1 day ago', type: 'Billing' },
    { id: 4, text: '"Human Anatomy Explorer" experience published.', time: '2 days ago', type: 'Experience' },
    { id: 5, text: '50 new users joined Global Health Institute.', time: '2 days ago', type: 'User' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ----------------------------------------------------- */}
      {/* Header & Filters */}
      {/* ----------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Monitor platform usage, user activity, organizations, and XR experience performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="This Year">This Year</option>
          </select>
          <Button variant="primary">Apply Filter</Button>
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* KPI Cards */}
      {/* ----------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{kpi.title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{kpi.value}</span>
              <span className={`text-sm font-medium ${kpi.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {kpi.trend}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* ----------------------------------------------------- */}
      {/* Charts Row 1: Growth & Activity */}
      {/* ----------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Growth Chart */}
        <Card className="p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Growth</h2>
          <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 h-64 border-b border-gray-200 dark:border-gray-700 pb-2">
            {userGrowth.map((data) => {
              const heightPercent = (data.value / maxGrowth) * 100;
              return (
                <div key={data.label} className="w-full flex flex-col items-center justify-end h-full group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    {data.value}
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-t-sm transition-all duration-300" 
                    style={{ height: `${heightPercent}%` }}
                  />
                  {/* Label */}
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {data.label}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            Total active users per month in {new Date().getFullYear()}
          </p>
        </Card>

        {/* Session Activity (Stacked Bar) */}
        <Card className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Session Activity</h2>
            <div className="flex gap-4 text-xs font-medium text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> Completed</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-200 dark:bg-indigo-900 rounded-sm"></div> In Progress</div>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 h-64 border-b border-gray-200 dark:border-gray-700 pb-2">
            {sessionActivity.map((data) => {
              const completedHeight = (data.completed / maxSession) * 100;
              const inProgressHeight = (data.inProgress / maxSession) * 100;
              return (
                <div key={data.day} className="w-full flex flex-col items-center justify-end h-full group">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-center text-gray-700 dark:text-gray-200 mb-2">
                    <div className="font-bold">{data.completed + data.inProgress}</div>
                  </div>
                  {/* Stacked Bar Container */}
                  <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                    {/* In Progress Section (Top) */}
                    <div 
                      className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-t-sm transition-all"
                      style={{ height: `${inProgressHeight}%` }}
                    />
                    {/* Completed Section (Bottom) */}
                    <div 
                      className="w-full bg-indigo-500 dark:bg-indigo-600 transition-all"
                      style={{ height: `${completedHeight}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {data.day}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            Average sessions by day of week
          </p>
        </Card>

      </div>

      {/* ----------------------------------------------------- */}
      {/* Row 2: Org Distribution & Recent Activity */}
      {/* ----------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Organization Distribution */}
        <Card className="p-6 lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Organizations by Type</h2>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {orgDistribution.map((org) => {
              const widthPercent = (org.count / totalOrgs) * 100;
              return (
                <div key={org.type}>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{org.type}</span>
                    <span className="text-gray-900 dark:text-white">{org.count} <span className="text-gray-500 font-normal">({widthPercent.toFixed(1)}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full ${org.color}`} style={{ width: `${widthPercent}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 ring-4 ring-blue-50 dark:ring-blue-900/30"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-tight">
                    {activity.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
              View All Activity
            </button>
          </div>
        </Card>
      </div>

      {/* ----------------------------------------------------- */}
      {/* Experience Performance Table */}
      {/* ----------------------------------------------------- */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Experience Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Experience Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Organization</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Sessions</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Rating</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {experiences.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{exp.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exp.org}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right font-medium">{exp.sessions.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{exp.completion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-yellow-400">★</span> {exp.rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Badge variant={exp.status === 'Active' ? 'success' : 'gray'}>{exp.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
    </div>
  );
}