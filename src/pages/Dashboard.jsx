import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Dashboard() {
  // Static Filter States
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [selectedOrg, setSelectedOrg] = useState('All Organizations');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [activeHoverPoint, setActiveHoverPoint] = useState(null);
  const [activeSessionDay, setActiveSessionDay] = useState(null);
  const [appliedNotification, setAppliedNotification] = useState(false);

  // MOCK DATA
  const initialKpis = [
    { title: 'Total Users', value: '2,845', trend: '+12.5%', isPositive: true },
    { title: 'Active Organizations', value: '86', trend: '+8.2%', isPositive: true },
    { title: 'Total XR Experiences', value: '142', trend: '+15 new this month', isPositive: true },
    { title: 'Total Sessions', value: '18,420', trend: '+18.4%', isPositive: true },
    { title: 'Avg Session Duration', value: '24 min', trend: '+4.6%', isPositive: true },
    { title: 'Completion Rate', value: '78.6%', trend: '+6.1%', isPositive: true }
  ];

  // User Growth data
  const userGrowth = [
    { label: 'Jan', value: 1200, growth: '+14.2%', newUsers: 150 },
    { label: 'Feb', value: 1450, growth: '+20.8%', newUsers: 250 },
    { label: 'Mar', value: 1680, growth: '+15.9%', newUsers: 230 },
    { label: 'Apr', value: 1920, growth: '+14.3%', newUsers: 240 },
    { label: 'May', value: 2240, growth: '+16.7%', newUsers: 320 },
    { label: 'Jun', value: 2580, growth: '+15.2%', newUsers: 340 },
    { label: 'Jul', value: 2845, growth: '+10.3%', newUsers: 265 }
  ];

  // Session Activity data (Weekly)
  const sessionActivity = [
    { day: 'Mon', completed: 420, inProgress: 80, isWeekend: false },
    { day: 'Tue', completed: 510, inProgress: 95, isWeekend: false },
    { day: 'Wed', completed: 480, inProgress: 60, isWeekend: false },
    { day: 'Thu', completed: 620, inProgress: 110, isWeekend: false },
    { day: 'Fri', completed: 580, inProgress: 90, isWeekend: false },
    { day: 'Sat', completed: 310, inProgress: 45, isWeekend: true },
    { day: 'Sun', completed: 290, inProgress: 35, isWeekend: true },
  ];

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
  const initialExperiences = [
    { id: 1, name: 'Virtual Safety Training', org: 'TechCorp Logistics', platform: 'VR Headset', sessions: 4250, completion: '92%', rating: 4.8, status: 'Active' },
    { id: 2, name: 'Human Anatomy Explorer', org: 'Global Health Institute', platform: 'WebXR Desktop', sessions: 3120, completion: '88%', rating: 4.9, status: 'Active' },
    { id: 3, name: 'Industrial Equipment Demo', org: 'Pioneer Robotics', platform: 'VR Headset', sessions: 1840, completion: '74%', rating: 4.2, status: 'Active' },
    { id: 4, name: 'Campus Orientation 360', org: 'EduTech Academy', platform: 'AR Mobile', sessions: 5600, completion: '65%', rating: 4.5, status: 'Inactive' },
    { id: 5, name: 'Product Design Lab', org: 'Nova Startups', platform: 'WebXR Desktop', sessions: 890, completion: '81%', rating: 4.7, status: 'Active' },
  ];

  // Recent Activity
  const recentActivities = [
    { id: 1, text: 'A new organization "Nova Startups" was registered.', time: '2 hours ago' },
    { id: 2, text: 'Jane Doe completed "Virtual Safety Training".', time: '4 hours ago' },
    { id: 3, text: 'EduTech Academy upgraded to Business Plan.', time: '1 day ago' },
    { id: 4, text: '"Human Anatomy Explorer" experience published.', time: '2 days ago' },
    { id: 5, text: '50 new users joined Global Health Institute.', time: '2 days ago' },
  ];

  // Filtered Experiences based on static filter choices
  const filteredExperiences = initialExperiences.filter((exp) => {
    const matchOrg = selectedOrg === 'All Organizations' || exp.org === selectedOrg;
    const matchStatus = selectedStatus === 'All Statuses' || exp.status === selectedStatus;
    const matchPlatform = selectedPlatform === 'All Platforms' || exp.platform === selectedPlatform;
    return matchOrg && matchStatus && matchPlatform;
  });

  const handleResetFilters = () => {
    setDateRange('Last 30 Days');
    setSelectedOrg('All Organizations');
    setSelectedStatus('All Statuses');
    setSelectedPlatform('All Platforms');
    setAppliedNotification(false);
  };

  const handleApplyFilters = () => {
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2500);
  };

  const isFilterActive =
    dateRange !== 'Last 30 Days' ||
    selectedOrg !== 'All Organizations' ||
    selectedStatus !== 'All Statuses' ||
    selectedPlatform !== 'All Platforms';

  // SVG Chart Geometry Constants & Path Generators
  const chartWidth = 640;
  const chartHeight = 220;
  const padLeft = 46;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 32;
  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = chartHeight - padTop - padBottom;
  const maxY = 3000;

  // Compute coordinate points for User Growth
  const points = userGrowth.map((d, i) => {
    const x = padLeft + (i / (userGrowth.length - 1)) * plotWidth;
    const y = padTop + (1 - d.value / maxY) * plotHeight;
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier SVG curve
  const generateSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cx1 = prev.x + (curr.x - prev.x) * 0.45;
      const cy1 = prev.y;
      const cx2 = curr.x - (curr.x - prev.x) * 0.45;
      const cy2 = curr.y;
      d += ` C ${cx1},${cy1} ${cx2},${cy2} ${curr.x},${curr.y}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x},${padTop + plotHeight} L ${points[0].x},${padTop + plotHeight} Z`
    : '';

  // Session activity summary totals
  const totalWeeklySessions = sessionActivity.reduce((acc, d) => acc + d.completed + d.inProgress, 0);
  const totalCompletedSessions = sessionActivity.reduce((acc, d) => acc + d.completed, 0);
  const avgCompletionRate = Math.round((totalCompletedSessions / totalWeeklySessions) * 100);
  const peakDay = [...sessionActivity].sort((a, b) => (b.completed + b.inProgress) - (a.completed + a.inProgress))[0];
  const maxSessionBarTotal = 800; // Fixed scale for uniform benchmark alignment

  return (
    <div className="space-y-5 pb-6">
      {/* ----------------------------------------------------- */}
      {/* Static Filters Bar */}
      {/* ----------------------------------------------------- */}
      <Card className="p-3.5 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
            {/* Date Range Filter */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="This Year">This Year</option>
                <option value="All Time">All Time</option>
              </select>
            </div>

            {/* Organization Filter */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Organization
              </label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="All Organizations">All Organizations</option>
                <option value="TechCorp Logistics">TechCorp Logistics</option>
                <option value="Global Health Institute">Global Health Institute</option>
                <option value="Pioneer Robotics">Pioneer Robotics</option>
                <option value="EduTech Academy">EduTech Academy</option>
                <option value="Nova Startups">Nova Startups</option>
              </select>
            </div>

            {/* Experience Status Filter */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Platform / Device Filter */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="All Platforms">All Platforms</option>
                <option value="VR Headset">VR Headset</option>
                <option value="AR Mobile">AR Mobile</option>
                <option value="WebXR Desktop">WebXR Desktop</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end pb-0.5">
            <Button
              variant="primary"
              onClick={handleApplyFilters}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              {appliedNotification ? 'Applied' : 'Apply Filters'}
            </Button>
            {isFilterActive && (
              <Button
                variant="secondary"
                onClick={handleResetFilters}
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-300"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {isFilterActive && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Applied:</span>
            {dateRange !== 'Last 30 Days' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Range: {dateRange}
                <button onClick={() => setDateRange('Last 30 Days')} className="hover:text-red-500">×</button>
              </span>
            )}
            {selectedOrg !== 'All Organizations' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Org: {selectedOrg}
                <button onClick={() => setSelectedOrg('All Organizations')} className="hover:text-red-500">×</button>
              </span>
            )}
            {selectedStatus !== 'All Statuses' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Status: {selectedStatus}
                <button onClick={() => setSelectedStatus('All Statuses')} className="hover:text-red-500">×</button>
              </span>
            )}
            {selectedPlatform !== 'All Platforms' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Platform: {selectedPlatform}
                <button onClick={() => setSelectedPlatform('All Platforms')} className="hover:text-red-500">×</button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium ml-1"
            >
              Clear All
            </button>
          </div>
        )}
      </Card>

      {/* ----------------------------------------------------- */}
      {/* KPI Cards */}
      {/* ----------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialKpis.map((kpi, idx) => (
          <Card key={idx} className="p-4 sm:p-5">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{kpi.title}</h3>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{kpi.value}</span>
              <span className={`text-xs sm:text-sm font-medium ${kpi.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {kpi.trend}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* ----------------------------------------------------- */}
      {/* Charts Row 1: Growth & Activity Visualizations */}
      {/* ----------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* User Growth SVG Area Visualization */}
        <Card className="p-4 sm:p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">User Growth</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                +24.8% YoY
              </span>
            </div>
            {/* Quick Interactive Metric Display */}
            {activeHoverPoint ? (
              <div className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 text-right">
                <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  {activeHoverPoint.label}: {activeHoverPoint.value.toLocaleString()} users
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  {activeHoverPoint.growth} ({activeHoverPoint.newUsers} new)
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right hidden sm:block">
                Hover point for monthly metrics
              </div>
            )}
          </div>

          {/* SVG Visual Canvas */}
          <div className="relative w-full overflow-hidden flex-1 min-h-[220px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full select-none"
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id="userGrowthAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.38" />
                  <stop offset="65%" stopColor="#3b82f6" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                {/* Glow Filter for Active Point */}
                <filter id="pointGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Horizontal Grid Milestone Lines */}
              {[0, 1000, 2000, 3000].map((val) => {
                const yPos = padTop + (1 - val / maxY) * plotHeight;
                return (
                  <g key={val}>
                    <line
                      x1={padLeft}
                      y1={yPos}
                      x2={chartWidth - padRight}
                      y2={yPos}
                      className="stroke-gray-200 dark:stroke-gray-700/60"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={yPos + 4}
                      textAnchor="end"
                      className="text-[11px] fill-gray-400 dark:fill-gray-500 font-sans"
                    >
                      {val.toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* SVG Area Filled Path */}
              <path
                d={areaPath}
                fill="url(#userGrowthAreaGradient)"
              />

              {/* SVG Main Curve Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active Hover Vertical Cursor Line */}
              {activeHoverPoint && (
                <line
                  x1={activeHoverPoint.x}
                  y1={padTop}
                  x2={activeHoverPoint.x}
                  y2={padTop + plotHeight}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  className="transition-all duration-150"
                />
              )}

              {/* Data Point Circles */}
              {points.map((pt, idx) => {
                const isHovered = activeHoverPoint?.label === pt.label;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer group"
                    onMouseEnter={() => setActiveHoverPoint(pt)}
                    onMouseLeave={() => setActiveHoverPoint(null)}
                  >
                    {/* Transparent hover capture circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="16"
                      fill="transparent"
                    />
                    {/* Visual Circle Marker */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? '7' : '4.5'}
                      fill={isHovered ? '#2563eb' : '#3b82f6'}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? '3' : '2'}
                      filter={isHovered ? 'url(#pointGlow)' : undefined}
                      className="transition-all duration-200"
                    />
                    {/* Bottom Month Label */}
                    <text
                      x={pt.x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      className={`text-[11px] font-medium transition-colors ${
                        isHovered
                          ? 'fill-blue-600 dark:fill-blue-400 font-bold'
                          : 'fill-gray-500 dark:fill-gray-400'
                      }`}
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* User Growth Bottom Summary Insights */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Avg Monthly Addition: <strong className="text-gray-800 dark:text-gray-200">+235 users</strong></span>
            </div>
            <div>
              Peak Surge: <strong className="text-gray-800 dark:text-gray-200">Jun (+340)</strong>
            </div>
          </div>
        </Card>

        {/* Session Activity Visualization */}
        <Card className="p-4 sm:p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Session Activity</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {totalWeeklySessions.toLocaleString()} Weekly
              </span>
            </div>

            {/* Visual Legend */}
            <div className="flex items-center gap-3 text-xs font-medium text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-indigo-500 dark:bg-indigo-600 rounded-sm"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-indigo-200 dark:bg-indigo-800 rounded-sm"></div>
                <span>In Progress</span>
              </div>
            </div>
          </div>

          {/* Interactive Stacked Bar Chart with Benchmark Line */}
          <div className="relative flex-1 min-h-[220px] flex flex-col justify-end pt-5">
            {/* Benchmark Guideline (600 Sessions) */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-gray-300 dark:border-gray-600 pointer-events-none z-10"
              style={{ bottom: `${(600 / maxSessionBarTotal) * 100}%` }}
            >
              <span className="absolute right-0 -top-4 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-800/80 px-1 rounded">
                Target: 600
              </span>
            </div>

            {/* Bars Container */}
            <div className="flex items-end justify-between gap-2 sm:gap-3 h-48 border-b border-gray-200 dark:border-gray-700 pb-2">
              {sessionActivity.map((data) => {
                const total = data.completed + data.inProgress;
                const completionPct = Math.round((data.completed / total) * 100);
                const totalHeightPct = (total / maxSessionBarTotal) * 100;
                const completedPortionPct = (data.completed / total) * 100;
                const isSelected = activeSessionDay?.day === data.day;

                return (
                  <div
                    key={data.day}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                    onMouseEnter={() => setActiveSessionDay({ ...data, total, completionPct })}
                    onMouseLeave={() => setActiveSessionDay(null)}
                  >
                    {/* Hover Value Tooltip / Top Label */}
                    <div className="h-5 mb-1 flex items-center justify-center">
                      <span className={`text-[11px] font-semibold transition-opacity duration-150 ${
                        isSelected
                          ? 'text-indigo-600 dark:text-indigo-400 opacity-100 font-bold scale-105'
                          : 'text-gray-500 dark:text-gray-400 opacity-80 group-hover:opacity-100'
                      }`}>
                        {total}
                      </span>
                    </div>

                    {/* Stacked Bar Pillar */}
                    <div
                      className="w-full max-w-[42px] rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:scale-x-105 shadow-sm"
                      style={{ height: `${totalHeightPct}%` }}
                    >
                      {/* In Progress Portion (Top) */}
                      <div
                        className="w-full bg-indigo-200 hover:bg-indigo-300 dark:bg-indigo-800/70 dark:hover:bg-indigo-700 transition-colors"
                        style={{ height: `${100 - completedPortionPct}%` }}
                        title={`${data.day} In Progress: ${data.inProgress}`}
                      />
                      {/* Completed Portion (Bottom) */}
                      <div
                        className="w-full bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                        style={{ height: `${completedPortionPct}%` }}
                        title={`${data.day} Completed: ${data.completed} (${completionPct}%)`}
                      />
                    </div>

                    {/* X-axis Day Label & Badge */}
                    <div className="mt-2 text-center">
                      <span className={`text-xs font-medium block ${
                        isSelected
                          ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                          : data.isWeekend
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {data.day}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session Activity Footer Metrics */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-gray-400 dark:text-gray-500 text-[11px] block">Avg Completion</span>
              <strong className="text-gray-800 dark:text-gray-200 font-semibold">{avgCompletionRate}%</strong>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500 text-[11px] block">Peak Day</span>
              <strong className="text-gray-800 dark:text-gray-200 font-semibold">{peakDay.day} ({peakDay.completed + peakDay.inProgress})</strong>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500 text-[11px] block">Daily Average</span>
              <strong className="text-gray-800 dark:text-gray-200 font-semibold">{Math.round(totalWeeklySessions / 7)}</strong>
            </div>
          </div>
        </Card>

      </div>

      {/* ----------------------------------------------------- */}
      {/* Row 2: Org Distribution & Recent Activity */}
      {/* ----------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Organization Distribution */}
        <Card className="p-4 sm:p-5 lg:col-span-2 flex flex-col">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Organizations by Type</h2>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {orgDistribution.map((org) => {
              const widthPercent = (org.count / totalOrgs) * 100;
              return (
                <div key={org.type}>
                  <div className="flex justify-between text-xs sm:text-sm font-medium mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{org.type}</span>
                    <span className="text-gray-900 dark:text-white">{org.count} <span className="text-gray-500 font-normal">({widthPercent.toFixed(1)}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${org.color}`} style={{ width: `${widthPercent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4 sm:p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
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
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
              View All Activity
            </button>
          </div>
        </Card>
      </div>

      {/* ----------------------------------------------------- */}
      {/* Experience Performance Table */}
      {/* ----------------------------------------------------- */}
      <Card className="overflow-hidden p-0">
        <div className="px-4 sm:px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Experience Performance</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredExperiences.length} of {initialExperiences.length} experiences
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Experience Name</th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Organization</th>
                <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Platform</th>
                <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Sessions</th>
                <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion</th>
                <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Rating</th>
                <th scope="col" className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExperiences.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No experiences match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredExperiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{exp.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exp.org}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exp.platform}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right font-medium">{exp.sessions.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{exp.completion}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-yellow-400">★</span> {exp.rating.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <Badge variant={exp.status === 'Active' ? 'success' : 'neutral'}>{exp.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
