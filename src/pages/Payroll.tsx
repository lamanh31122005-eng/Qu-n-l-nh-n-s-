import { useMemo, useState } from 'react';
import { payrollRecords as initialRecords, employees } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { PayrollRecord } from '@/types/hrm';
import PageHeader from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FileText, Calculator, Check, Plus, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusStyle = {
  draft: { label: 'Nháp', className: 'bg-muted text-muted-foreground border-border' },
  approved: { label: 'Đã duyệt', className: 'bg-info/10 text-info border-info/20' },
  paid: { label: 'Đã trả', className: 'bg-success/10 text-success border-success/20' },
};

const Payroll = () => {
  const { user } = useAuth();
  const [records, setRecords] = usePersistedState<PayrollRecord[]>('hrm_payroll', initialRecords);
  const isEmployee = user?.role === 'EMPLOYEE';
  const canApprove = user?.role === 'ADMIN' || user?.role === 'FINANCE';
  const fmt = (v: number) => v.toLocaleString('vi-VN') + ' ₫';

  const emp = useMemo(() => isEmployee ? employees.find(e => e.userId === user?.id) : null, [isEmployee, user?.id]);

  const filteredRecords = useMemo(() => {
    if (!isEmployee) return records;
    return records.filter(r => r.employeeId === emp?.id);
  }, [isEmployee, records, emp?.id]);

  const handleApprove = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
    toast.success('Đã duyệt bảng lương');
  };

  const handlePay = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'paid' as const } : r));
    toast.success('Đã xác nhận thanh toán lương');
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const selectedEmp = employees.find(emp => emp.id === fd.get('employeeId'));
    if (!selectedEmp) return;
    const baseSalary = Number(fd.get('baseSalary'));
    const allowance = Number(fd.get('allowance'));
    const bonus = Number(fd.get('bonus'));
    const overtimePay = Number(fd.get('overtimePay'));
    const taxDeduction = Number(fd.get('taxDeduction'));
    const insuranceDeduction = Number(fd.get('insuranceDeduction'));
    const netSalary = baseSalary + allowance + bonus + overtimePay - taxDeduction - insuranceDeduction;
    const newRecord: PayrollRecord = {
      id: `pay_${Date.now()}`,
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.fullName,
      month: Number(fd.get('month')),
      year: Number(fd.get('year')),
      baseSalary, allowance, bonus, overtimePay, taxDeduction, insuranceDeduction, netSalary,
      status: 'draft',
    };
    setRecords(prev => [newRecord, ...prev]);
    setCreateOpen(false);
    toast.success(`Đã tạo bảng lương cho ${selectedEmp.fullName}`);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setRecords(prev => prev.filter(r => r.id !== deleteId));
    toast.success('Đã xóa bảng lương');
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Bảng lương"
        description="Quản lý và duyệt bảng lương nhân viên"
        actions={canApprove ? <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-1" /> Tạo bảng lương</Button> : undefined}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card rounded-xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nhân viên</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tháng</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Lương CB</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Phụ cấp</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Thưởng</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">OT</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Thuế</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">BHXH</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground font-semibold">Thực nhận</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">TT</th>
                {canApprove && <th className="px-4 py-3"></th>}
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
                    <td className="px-4 py-3 text-foreground">{r.month}/{r.year}</td>
                    <td className="px-4 py-3 text-right text-foreground">{fmt(r.baseSalary)}</td>
                    <td className="px-4 py-3 text-right text-foreground">{fmt(r.allowance)}</td>
                    <td className="px-4 py-3 text-right text-success">{fmt(r.bonus)}</td>
                    <td className="px-4 py-3 text-right text-info">{fmt(r.overtimePay)}</td>
                    <td className="px-4 py-3 text-right text-destructive">-{fmt(r.taxDeduction)}</td>
                    <td className="px-4 py-3 text-right text-destructive">-{fmt(r.insuranceDeduction)}</td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">{fmt(r.netSalary)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('text-xs', st.className)}>{st.label}</Badge>
                    </td>
                    {canApprove && (
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreHorizontal size={16} /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                          {r.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleApprove(r.id)}>
                              <Check size={14} className="mr-2" /> Duyệt
                            </DropdownMenuItem>
                          )}
                          {r.status === 'approved' && (
                            <DropdownMenuItem onClick={() => handlePay(r.id)}>
                              <FileText size={14} className="mr-2" /> Trả lương
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setDeleteId(r.id)} className="text-destructive focus:text-destructive">
                            <Trash2 size={14} className="mr-2" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr><td colSpan={11} className="text-center py-8 text-muted-foreground">Không có dữ liệu lương</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Payroll Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo bảng lương</DialogTitle>
            <DialogDescription>Nhập thông tin lương cho nhân viên</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Nhân viên</Label>
              <Select name="employeeId" required>
                <SelectTrigger><SelectValue placeholder="Chọn nhân viên" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tháng</Label>
                <Input type="number" name="month" min="1" max="12" defaultValue={new Date().getMonth() + 1} required />
              </div>
              <div className="space-y-2">
                <Label>Năm</Label>
                <Input type="number" name="year" defaultValue={new Date().getFullYear()} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lương CB</Label>
                <Input type="number" name="baseSalary" required placeholder="18000000" />
              </div>
              <div className="space-y-2">
                <Label>Phụ cấp</Label>
                <Input type="number" name="allowance" defaultValue={0} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thưởng</Label>
                <Input type="number" name="bonus" defaultValue={0} required />
              </div>
              <div className="space-y-2">
                <Label>OT</Label>
                <Input type="number" name="overtimePay" defaultValue={0} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thuế</Label>
                <Input type="number" name="taxDeduction" defaultValue={0} required />
              </div>
              <div className="space-y-2">
                <Label>BHXH</Label>
                <Input type="number" name="insuranceDeduction" defaultValue={0} required />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button>
              <Button type="submit">Tạo bảng lương</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bảng lương?</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa bảng lương này?</AlertDialogDescription>
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

export default Payroll;
