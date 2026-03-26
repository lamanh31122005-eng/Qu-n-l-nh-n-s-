import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { dashboardStats } from '@/data/mockData';
import { Users, Building2, DollarSign, UserPlus, Clock, TrendingUp, ArrowDownLeft, ArrowUpRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['hsl(350,60%,52%)', 'hsl(210,80%,55%)', 'hsl(142,60%,45%)', 'hsl(38,92%,50%)', 'hsl(280,60%,55%)'];

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  const stats = dashboardStats;

  const formatCurrency = (v: number) => {
    if (v >= 1000000000) return `${(v / 1000000000).toFixed(1)} tỷ`;
    if (v >= 1000000) return `${(v / 1000000).toFixed(0)} tr`;
    return v.toLocaleString('vi-VN');
  };

  return (
    <div>
      <PageHeader
        title={`Xin chào, ${user.fullName}`}
        description={`Dashboard tổng quan – ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(user.role === 'ADMIN' || user.role === 'HR') && (
          <>
            <StatCard title="Tổng nhân viên" value={stats.totalEmployees} icon={Users} color="primary" index={0} />
            <StatCard title="Phòng ban" value={stats.totalDepartments} icon={Building2} color="info" index={1} />
            <StatCard title="Nhân viên mới" value={stats.newHires} subtitle="Tháng này" icon={UserPlus} color="success" index={2} />
            <StatCard title="Đang nghỉ phép" value={stats.onLeave} icon={Clock} color="warning" index={3} />
          </>
        )}
        {user.role === 'FINANCE' && (
          <>
            <StatCard title="Tổng thu" value={formatCurrency(stats.totalIncome)} icon={ArrowDownLeft} color="success" index={0} />
            <StatCard title="Tổng chi" value={formatCurrency(stats.totalExpense)} icon={ArrowUpRight} color="primary" index={1} />
            <StatCard title="Quỹ lương" value={formatCurrency(stats.totalPayroll)} icon={DollarSign} color="warning" index={2} />
            <StatCard title="Nhân viên" value={stats.totalEmployees} icon={Users} color="info" index={3} />
          </>
        )}
        {user.role === 'MANAGER_TECH' && (
          <>
            <StatCard title="NV phòng KT" value={25} icon={Users} color="primary" index={0} />
            <StatCard title="Đơn OT chờ duyệt" value={stats.pendingOT} icon={Clock} color="warning" index={1} />
            <StatCard title="Đi trễ hôm nay" value={stats.lateToday} icon={AlertTriangle} color="primary" index={2} />
            <StatCard title="KPI TB phòng" value="85.2" icon={TrendingUp} color="success" index={3} />
          </>
        )}
        {user.role === 'EMPLOYEE' && (
          <>
            <StatCard title="Lương tháng này" value="18.8 tr" icon={DollarSign} color="success" index={0} />
            <StatCard title="Giờ làm hôm nay" value="8h 25m" icon={Clock} color="primary" index={1} />
            <StatCard title="Tổng OT tháng" value="12h" icon={TrendingUp} color="warning" index={2} />
            <StatCard title="KPI tháng" value="85" subtitle="/100" icon={CheckCircle} color="info" index={3} />
          </>
        )}
      </div>

      {/* Basic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-5"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Chi phí lương theo tháng (triệu VNĐ)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.monthlyPayrollData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
              <Tooltip />
              <Bar dataKey="amount" fill="hsl(350,60%,52%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl p-5"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Phân bổ nhân sự theo phòng ban</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={stats.departmentDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {stats.departmentDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {stats.departmentDistribution.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
