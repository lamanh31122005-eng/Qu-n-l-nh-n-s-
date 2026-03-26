import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { dashboardStats } from '@/data/mockData';
import { FileText, CalendarDays, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['hsl(350,60%,52%)', 'hsl(210,80%,55%)', 'hsl(142,60%,45%)', 'hsl(38,92%,50%)', 'hsl(280,60%,55%)'];

const ChartCard = ({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-card rounded-xl p-5"
    style={{ boxShadow: 'var(--shadow-card)' }}
  >
    <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </motion.div>
);

const PieLegend = ({ data, colors }: { data: { name: string; value: number }[]; colors: string[] }) => (
  <div className="flex flex-wrap gap-3 justify-center mt-2">
    {data.map((d, i) => (
      <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
        {d.name} ({d.value})
      </div>
    ))}
  </div>
);

const roleDescriptions: Record<string, string> = {
  ADMIN: 'Báo cáo tổng quan toàn công ty: nhân sự, chấm công, tuyển dụng, hợp đồng, lương',
  HR: 'Báo cáo tổng quan nhân sự: chấm công, tuyển dụng, nghỉ phép, hợp đồng',
  FINANCE: 'Báo cáo tài chính: thu chi, cơ cấu chi phí, biến động quỹ lương',
  MANAGER_TECH: 'Báo cáo phòng Kỹ thuật: KPI nhân viên, chấm công, nhân sự',
  EMPLOYEE: 'Báo cáo cá nhân: lương, KPI, chấm công, hợp đồng',
};

const Reports = () => {
  const { user } = useAuth();
  if (!user) return null;

  const stats = dashboardStats;
  const role = user.role;

  return (
    <div>
      <PageHeader
        title="Báo cáo"
        description={roleDescriptions[role] || 'Báo cáo tổng hợp'}
      />

      {/* ===== ADMIN / HR ===== */}
      {(role === 'ADMIN' || role === 'HR') && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Chấm công tuần này (toàn công ty)" delay={0.1}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.attendanceSummary}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,90%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onTime" name="Đúng giờ" fill="hsl(142,60%,45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" name="Đi trễ" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name="Vắng" fill="hsl(350,60%,52%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Kênh tuyển dụng (Pipeline)" delay={0.2}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.recruitmentPipeline} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,90%)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={80} stroke="hsl(220,10%,50%)" />
                  <Tooltip />
                  <Bar dataKey="count" name="Ứng viên" fill="hsl(210,80%,55%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <ChartCard title="Phân bổ nhân sự theo phòng ban" delay={0.3}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.departmentDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
                    {stats.departmentDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend data={stats.departmentDistribution} colors={COLORS} />
            </ChartCard>

            <ChartCard title="Nghỉ phép theo loại (tháng này)" delay={0.4}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.leaveByType} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
                    {stats.leaveByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend data={stats.leaveByType} colors={COLORS} />
            </ChartCard>

            <ChartCard title="Tình trạng hợp đồng" delay={0.5}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.contractOverview} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
                    {stats.contractOverview.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend data={stats.contractOverview} colors={COLORS} />
            </ChartCard>
          </div>

          <ChartCard title="Chi phí lương theo tháng (triệu VNĐ)" delay={0.6}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.monthlyPayrollData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                <Tooltip />
                <Area type="monotone" dataKey="amount" name="Lương" stroke="hsl(350,60%,52%)" fill="hsl(350,60%,52%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}

      {/* ===== FINANCE ===== */}
      {role === 'FINANCE' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Thu – Chi theo tháng (triệu VNĐ)" delay={0.1}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.incomeExpenseMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" name="Thu" fill="hsl(142,60%,45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Chi" fill="hsl(350,60%,52%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Cơ cấu chi phí (triệu VNĐ)" delay={0.2}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stats.expenseBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                    {stats.expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend data={stats.expenseBreakdown} colors={COLORS} />
            </ChartCard>
          </div>

          <ChartCard title="Biến động quỹ lương (triệu VNĐ)" delay={0.3}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.monthlyPayrollData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                <Tooltip />
                <Area type="monotone" dataKey="amount" name="Lương" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}

      {/* ===== MANAGER_TECH ===== */}
      {role === 'MANAGER_TECH' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="KPI nhân viên phòng Kỹ thuật" delay={0.1}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.teamKPI} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,90%)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} stroke="hsl(220,10%,50%)" />
                  <Tooltip />
                  <Bar dataKey="score" name="Điểm KPI" radius={[0, 6, 6, 0]}>
                    {stats.teamKPI.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 85 ? 'hsl(142,60%,45%)' : entry.score >= 75 ? 'hsl(38,92%,50%)' : 'hsl(350,60%,52%)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Chấm công phòng KT tuần này" delay={0.2}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.teamAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,90%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onTime" name="Đúng giờ" fill="hsl(142,60%,45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" name="Đi trễ" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name="Vắng" fill="hsl(350,60%,52%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Phân bổ nhân sự theo phòng ban" delay={0.3}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                <Tooltip />
                <Bar dataKey="value" name="Nhân viên" fill="hsl(280,60%,55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}

      {/* ===== EMPLOYEE ===== */}
      {role === 'EMPLOYEE' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Lương thực nhận 6 tháng gần nhất (triệu VNĐ)" delay={0.1}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.personalSalaryHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" domain={[15, 22]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="net" name="Lương net" stroke="hsl(142,60%,45%)" strokeWidth={2.5} dot={{ fill: 'hsl(142,60%,45%)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Điểm KPI 6 tháng gần nhất" delay={0.2}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.personalKPI}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" domain={[60, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" name="KPI" stroke="hsl(210,80%,55%)" fill="hsl(210,80%,55%)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Chấm công tháng này" delay={0.3}>
              <div className="flex items-center justify-center gap-8 py-6">
                {[
                  { label: 'Đúng giờ', value: stats.personalAttendance.onTime, color: 'hsl(142,60%,45%)' },
                  { label: 'Đi trễ', value: stats.personalAttendance.late, color: 'hsl(38,92%,50%)' },
                  { label: 'Vắng', value: stats.personalAttendance.absent, color: 'hsl(350,60%,52%)' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-3xl font-bold" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                  </div>
                ))}
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{stats.personalAttendance.totalDays}</div>
                  <div className="text-xs text-muted-foreground mt-1">Tổng ngày</div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div className="h-full flex">
                  <div style={{ width: `${(stats.personalAttendance.onTime / stats.personalAttendance.totalDays) * 100}%`, backgroundColor: 'hsl(142,60%,45%)' }} />
                  <div style={{ width: `${(stats.personalAttendance.late / stats.personalAttendance.totalDays) * 100}%`, backgroundColor: 'hsl(38,92%,50%)' }} />
                  <div style={{ width: `${(stats.personalAttendance.absent / stats.personalAttendance.totalDays) * 100}%`, backgroundColor: 'hsl(350,60%,52%)' }} />
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Thông tin hợp đồng" delay={0.4}>
              <div className="space-y-4 py-4">
                {[
                  { label: 'Loại hợp đồng', value: 'Có thời hạn', icon: FileText },
                  { label: 'Ngày bắt đầu', value: '15/03/2023', icon: CalendarDays },
                  { label: 'Ngày kết thúc', value: '15/03/2025', icon: CalendarDays },
                  { label: 'Trạng thái', value: 'Chờ gia hạn', icon: AlertTriangle },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
