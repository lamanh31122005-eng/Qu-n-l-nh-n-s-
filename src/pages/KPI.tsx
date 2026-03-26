import { useMemo, useState } from 'react';
import { kpiRecords as initialRecords, employees } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { KPIRecord } from '@/types/hrm';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const scoreColor = (s: number) => {
  if (s >= 90) return 'text-success';
  if (s >= 70) return 'text-info';
  if (s >= 50) return 'text-warning';
  return 'text-destructive';
};

const scoreBar = (s: number) => {
  if (s >= 90) return 'bg-success';
  if (s >= 70) return 'bg-info';
  if (s >= 50) return 'bg-warning';
  return 'bg-destructive';
};

const KPI = () => {
  const { user } = useAuth();
  const [records, setRecords] = usePersistedState<KPIRecord[]>('hrm_kpi', initialRecords);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<KPIRecord | null>(null);
  const isEmployee = user?.role === 'EMPLOYEE';
  const canEvaluate = user?.role === 'MANAGER_TECH' || user?.role === 'HR' || user?.role === 'ADMIN';

  const emp = useMemo(() => isEmployee ? employees.find(e => e.userId === user?.id) : null, [isEmployee, user?.id]);

  const filteredRecords = useMemo(() => {
    if (!isEmployee) return records;
    return records.filter(r => r.employeeId === emp?.id);
  }, [isEmployee, records, emp?.id]);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const selectedEmp = employees.find(emp => emp.id === fd.get('employeeId'));
    if (!selectedEmp) return;

    const newRecord: KPIRecord = {
      id: `kpi_${Date.now()}`,
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.fullName,
      month: Number(fd.get('month')),
      year: Number(fd.get('year')),
      score: Number(fd.get('score')),
      comment: fd.get('comment') as string,
      evaluatedBy: user?.fullName || '',
    };
    setRecords(prev => [newRecord, ...prev]);
    setDialogOpen(false);
    toast.success(`Đã đánh giá KPI cho ${selectedEmp.fullName}`);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editRecord) return;
    const fd = new FormData(e.currentTarget);
    setRecords(prev => prev.map(r =>
      r.id === editRecord.id
        ? { ...r, score: Number(fd.get('score')), comment: fd.get('comment') as string }
        : r
    ));
    setEditRecord(null);
    toast.success('Đã cập nhật đánh giá KPI');
  };

  return (
    <div>
      <PageHeader
        title="Đánh giá KPI"
        description="Đánh giá hiệu suất nhân viên theo tháng"
        actions={canEvaluate ? <Button size="sm" onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-1" /> Đánh giá mới</Button> : undefined}
      />

      <div className="grid gap-4">
        {filteredRecords.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {r.employeeName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground">{r.employeeName}</p>
                <p className="text-xs text-muted-foreground">Tháng {r.month}/{r.year} · Đánh giá bởi {r.evaluatedBy}</p>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{r.comment}</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className={cn('h-2 rounded-full transition-all', scoreBar(r.score))} style={{ width: `${r.score}%` }} />
              </div>
            </div>

            <div className={cn('text-3xl font-bold', scoreColor(r.score))}>
              {r.score}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </div>

            {canEvaluate && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditRecord(r)}>
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  setRecords(prev => prev.filter(k => k.id !== r.id));
                  toast.success('Đã xóa đánh giá KPI');
                }} className="text-destructive hover:text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            )}
          </motion.div>
        ))}
        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Chưa có đánh giá KPI nào</div>
        )}
      </div>

      {/* Create KPI dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá KPI mới</DialogTitle>
            <DialogDescription>Chọn nhân viên và đánh giá hiệu suất</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nhân viên</Label>
              <Select name="employeeId" required>
                <SelectTrigger><SelectValue placeholder="Chọn nhân viên" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.fullName} - {e.position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tháng</Label>
                <Input type="number" name="month" min="1" max="12" defaultValue={new Date().getMonth() + 1} required />
              </div>
              <div className="space-y-2">
                <Label>Năm</Label>
                <Input type="number" name="year" defaultValue={new Date().getFullYear()} required />
              </div>
              <div className="space-y-2">
                <Label>Điểm (0-100)</Label>
                <Input type="number" name="score" min="0" max="100" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nhận xét</Label>
              <Textarea name="comment" placeholder="Nhận xét hiệu suất..." required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
              <Button type="submit">Lưu đánh giá</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit KPI dialog */}
      <Dialog open={!!editRecord} onOpenChange={open => !open && setEditRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa KPI</DialogTitle>
            <DialogDescription>{editRecord?.employeeName} - Tháng {editRecord?.month}/{editRecord?.year}</DialogDescription>
          </DialogHeader>
          {editRecord && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label>Điểm (0-100)</Label>
                <Input type="number" name="score" min="0" max="100" defaultValue={editRecord.score} required />
              </div>
              <div className="space-y-2">
                <Label>Nhận xét</Label>
                <Textarea name="comment" defaultValue={editRecord.comment} required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditRecord(null)}>Hủy</Button>
                <Button type="submit">Cập nhật</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KPI;
