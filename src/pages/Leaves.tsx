import { useMemo, useState } from 'react';
import { leaveRequests as initialRequests, employees } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { LeaveRequest } from '@/types/hrm';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Check, X, CalendarDays, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const typeLabels = { annual: 'Phép năm', sick: 'Ốm', personal: 'Việc riêng', maternity: 'Thai sản' };
const statusStyle = {
  pending: { label: 'Chờ duyệt', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Đã duyệt', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Từ chối', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const TOTAL_ANNUAL_LEAVE = 12;

const Leaves = () => {
  const { user } = useAuth();
  const [requests, setRequests] = usePersistedState<LeaveRequest[]>('hrm_leaves', initialRequests);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const isEmployee = user?.role === 'EMPLOYEE';
  const canApprove = user?.role === 'MANAGER_TECH' || user?.role === 'HR' || user?.role === 'ADMIN';

  const emp = useMemo(() => isEmployee ? employees.find(e => e.userId === user?.id) : null, [isEmployee, user?.id]);

  const filteredRequests = useMemo(() => {
    if (!isEmployee || !emp) return requests;
    return requests.filter(r => r.employeeId === emp.id);
  }, [isEmployee, emp, requests]);

  const usedLeaveDays = useMemo(() => {
    if (!emp) return 0;
    return requests
      .filter(r => r.employeeId === emp.id && r.type === 'annual' && r.status !== 'rejected')
      .reduce((sum, r) => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + days;
      }, 0);
  }, [emp, requests]);

  const remainingLeave = TOTAL_ANNUAL_LEAVE - usedLeaveDays;

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
    toast.success('Đã duyệt đơn nghỉ phép');
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
    toast.error('Đã từ chối đơn nghỉ phép');
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setRequests(prev => prev.filter(r => r.id !== deleteId));
    toast.success('Đã xóa đơn nghỉ phép');
    setDeleteId(null);
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emp) return;
    const fd = new FormData(e.currentTarget);
    const newReq: LeaveRequest = {
      id: `leave_${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      type: fd.get('type') as LeaveRequest['type'],
      startDate: fd.get('startDate') as string,
      endDate: fd.get('endDate') as string,
      reason: fd.get('reason') as string,
      status: 'pending',
    };
    setRequests(prev => [newReq, ...prev]);
    setDialogOpen(false);
    toast.success('Đã gửi đơn xin nghỉ phép');
  };

  return (
    <div>
      <PageHeader
        title="Nghỉ phép"
        description="Quản lý đơn xin nghỉ phép"
        actions={isEmployee ? <Button size="sm" onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-1" /> Xin nghỉ phép</Button> : undefined}
      />

      {isEmployee && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-5 mb-6 flex flex-wrap items-center gap-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarDays size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng phép năm</p>
              <p className="text-lg font-bold text-foreground">{TOTAL_ANNUAL_LEAVE} ngày</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Đã sử dụng</p>
            <p className="text-lg font-bold text-warning">{usedLeaveDays} ngày</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Còn lại</p>
            <p className={cn('text-lg font-bold', remainingLeave > 3 ? 'text-success' : 'text-destructive')}>{remainingLeave} ngày</p>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4">
        {filteredRequests.map((r, i) => {
          const st = statusStyle[r.status];
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{r.employeeName}</p>
                  <Badge variant="secondary" className="text-xs">{typeLabels[r.type]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{r.startDate} → {r.endDate}</p>
                <p className="text-sm text-muted-foreground">{r.reason}</p>
              </div>
              <Badge variant="outline" className={cn('text-xs', st.className)}>{st.label}</Badge>
              {canApprove && r.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleApprove(r.id)}>
                    <Check size={14} className="mr-1" /> Duyệt
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleReject(r.id)}>
                    <X size={14} className="mr-1" /> Từ chối
                  </Button>
                </div>
              )}
              {(canApprove || (isEmployee && r.status === 'pending')) && (
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive">
                  <Trash2 size={14} />
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Create leave dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xin nghỉ phép</DialogTitle>
            <DialogDescription>Điền thông tin đơn xin nghỉ phép</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Loại nghỉ phép</Label>
              <Select name="type" defaultValue="annual">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Phép năm</SelectItem>
                  <SelectItem value="sick">Ốm</SelectItem>
                  <SelectItem value="personal">Việc riêng</SelectItem>
                  <SelectItem value="maternity">Thai sản</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Từ ngày</Label>
                <Input type="date" name="startDate" required />
              </div>
              <div className="space-y-2">
                <Label>Đến ngày</Label>
                <Input type="date" name="endDate" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lý do</Label>
              <Textarea name="reason" placeholder="Nhập lý do..." required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
              <Button type="submit">Gửi đơn</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đơn nghỉ phép?</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa đơn này? Hành động không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Leaves;
