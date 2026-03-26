import { useMemo, useState } from 'react';
import { overtimeRequests as initialRequests, employees } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { OvertimeRequest } from '@/types/hrm';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Check, X, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusStyle = {
  pending: { label: 'Chờ duyệt', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Đã duyệt', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Từ chối', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const Overtime = () => {
  const { user } = useAuth();
  const [requests, setRequests] = usePersistedState<OvertimeRequest[]>('hrm_overtime', initialRequests);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isEmployee = user?.role === 'EMPLOYEE';
  const canApprove = user?.role === 'MANAGER_TECH' || user?.role === 'ADMIN';

  const emp = useMemo(() => isEmployee ? employees.find(e => e.userId === user?.id) : null, [isEmployee, user?.id]);

  const filteredRequests = useMemo(() => {
    if (!isEmployee) return requests;
    return requests.filter(r => r.employeeId === emp?.id);
  }, [isEmployee, requests, emp?.id]);

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const, approvedBy: user?.fullName } : r));
    toast.success('Đã duyệt đơn OT');
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
    toast.error('Đã từ chối đơn OT');
  };

  const handleDeleteOT = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    toast.success('Đã xóa đơn OT');
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emp) return;
    const fd = new FormData(e.currentTarget);
    const newReq: OvertimeRequest = {
      id: `ot_${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      date: fd.get('date') as string,
      hours: Number(fd.get('hours')),
      reason: fd.get('reason') as string,
      status: 'pending',
    };
    setRequests(prev => [newReq, ...prev]);
    setDialogOpen(false);
    toast.success('Đã gửi đơn đăng ký OT');
  };

  return (
    <div>
      <PageHeader
        title="Làm thêm giờ (OT)"
        description="Quản lý đơn đăng ký làm thêm giờ"
        actions={isEmployee ? <Button size="sm" onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-1" /> Đăng ký OT</Button> : undefined}
      />

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
                <p className="font-semibold text-foreground">{r.employeeName}</p>
                <p className="text-sm text-muted-foreground">{r.date} · {r.hours} giờ</p>
                <p className="text-sm text-muted-foreground mt-1">{r.reason}</p>
                {r.approvedBy && <p className="text-xs text-success mt-1">Duyệt bởi: {r.approvedBy}</p>}
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
                <Button size="sm" variant="ghost" onClick={() => handleDeleteOT(r.id)} className="text-destructive hover:text-destructive">
                  <Trash2 size={14} />
                </Button>
              )}
            </motion.div>
          );
        })}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Chưa có đơn đăng ký OT nào</div>
        )}
      </div>

      {/* Create OT dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng ký làm thêm giờ</DialogTitle>
            <DialogDescription>Điền thông tin đăng ký OT</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày</Label>
                <Input type="date" name="date" required />
              </div>
              <div className="space-y-2">
                <Label>Số giờ</Label>
                <Input type="number" name="hours" min="1" max="8" required placeholder="VD: 3" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lý do</Label>
              <Textarea name="reason" placeholder="Nhập lý do làm OT..." required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
              <Button type="submit">Gửi đơn</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Overtime;
