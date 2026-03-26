import { useMemo } from 'react';
import { attendanceRecords as initialRecords, employees } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { AttendanceRecord } from '@/types/hrm';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusStyle = {
  on_time: { label: 'Đúng giờ', className: 'bg-success/10 text-success border-success/20' },
  late: { label: 'Đi trễ', className: 'bg-warning/10 text-warning border-warning/20' },
  absent: { label: 'Vắng mặt', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  day_off: { label: 'Nghỉ', className: 'bg-muted text-muted-foreground border-border' },
};

const Attendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = usePersistedState<AttendanceRecord[]>('hrm_attendance', initialRecords);
  const isEmployee = user?.role === 'EMPLOYEE';

  const emp = useMemo(() => isEmployee ? employees.find(e => e.userId === user?.id) : null, [isEmployee, user?.id]);
  const todayStr = new Date().toISOString().split('T')[0];

  const todayRecord = useMemo(() => {
    if (!emp) return null;
    return records.find(r => r.employeeId === emp.id && r.date === todayStr);
  }, [emp, records, todayStr]);

  const checkedIn = !!todayRecord?.checkIn;
  const checkedOut = !!todayRecord?.checkOut;

  const handleCheckIn = () => {
    if (!emp) return;
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const hour = new Date().getHours();
    const status: AttendanceRecord['status'] = hour > 8 ? 'late' : 'on_time';

    if (todayRecord) {
      setRecords(prev => prev.map(r =>
        r.id === todayRecord.id ? { ...r, checkIn: now, status } : r
      ));
    } else {
      const newRecord: AttendanceRecord = {
        id: `att_${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        date: todayStr,
        checkIn: now,
        checkOut: null,
        workHours: 0,
        overtimeHours: 0,
        status,
      };
      setRecords(prev => [newRecord, ...prev]);
    }
    toast.success(`Check-in thành công lúc ${now}`);
  };

  const handleCheckOut = () => {
    if (!emp || !todayRecord) return;
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const checkInParts = todayRecord.checkIn!.split(':');
    const checkInHours = parseInt(checkInParts[0]) + parseInt(checkInParts[1]) / 60;
    const currentHours = new Date().getHours() + new Date().getMinutes() / 60;
    const workHours = Math.round((currentHours - checkInHours) * 100) / 100;
    const overtimeHours = Math.max(0, Math.round((workHours - 8) * 100) / 100);

    setRecords(prev => prev.map(r =>
      r.id === todayRecord.id ? { ...r, checkOut: now, workHours, overtimeHours } : r
    ));
    toast.success(`Check-out thành công lúc ${now}`);
  };

  const filteredRecords = useMemo(() => {
    if (!isEmployee) return records;
    return records.filter(r => r.employeeId === emp?.id);
  }, [isEmployee, records, emp?.id]);

  return (
    <div>
      <PageHeader title="Chấm công" description="Quản lý chấm công hàng ngày" />

      {isEmployee && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-4"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Hôm nay: {new Date().toLocaleDateString('vi-VN')}</p>
              {todayRecord?.checkIn && <p className="text-sm text-muted-foreground">Đã check-in lúc {todayRecord.checkIn}</p>}
              {todayRecord?.checkOut && <p className="text-sm text-muted-foreground">Đã check-out lúc {todayRecord.checkOut}</p>}
            </div>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <Button onClick={handleCheckIn} disabled={checkedIn} size="sm">
              <LogIn size={16} className="mr-1" /> Check-in
            </Button>
            <Button onClick={handleCheckOut} disabled={!checkedIn || checkedOut} variant="outline" size="sm">
              <LogOut size={16} className="mr-1" /> Check-out
            </Button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nhân viên</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ngày</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Check-in</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Check-out</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Giờ làm</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">OT</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, i) => {
                const st = statusStyle[r.status];
                return (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{r.employeeName}</td>
                    <td className="px-4 py-3 text-foreground">{r.date}</td>
                    <td className="px-4 py-3 text-foreground">{r.checkIn || '—'}</td>
                    <td className="px-4 py-3 text-foreground">{r.checkOut || '—'}</td>
                    <td className="px-4 py-3 text-foreground">{r.workHours}h</td>
                    <td className="px-4 py-3 text-foreground">{r.overtimeHours > 0 ? `${r.overtimeHours}h` : '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('text-xs', st.className)}>{st.label}</Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Attendance;
