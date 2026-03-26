import { useState, useMemo } from 'react';
import { employees as initialEmployees, departments as initialDepartments } from '@/data/mockData';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { Department, Employee } from '@/types/hrm';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Plus, MoreHorizontal, Pencil, Trash2, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const statusMap = {
  active: { label: 'Đang làm', className: 'bg-success/10 text-success border-success/20' },
  inactive: { label: 'Nghỉ việc', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  on_leave: { label: 'Nghỉ phép', className: 'bg-warning/10 text-warning border-warning/20' },
};

const Employees = () => {
  const [employeeList, setEmployeeList] = usePersistedState<Employee[]>('hrm_employees', initialEmployees);
  const [departmentList] = usePersistedState<Department[]>('hrm_departments', initialDepartments);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<Employee | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Employee | null>(null);

  const departmentMap = useMemo(() => new Map(departmentList.map(d => [d.id, d.name])), [departmentList]);

  const filtered = useMemo(() => employeeList.filter(e => {
    const matchSearch = e.fullName.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || e.departmentId === deptFilter;
    return matchSearch && matchDept;
  }), [employeeList, search, deptFilter]);

  const formatSalary = (v: number) => v.toLocaleString('vi-VN') + ' ₫';

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const dept = departmentList.find(d => d.id === fd.get('departmentId'));
    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      userId: `user_${Date.now()}`,
      fullName: fd.get('fullName') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      departmentId: fd.get('departmentId') as string,
      departmentName: dept?.name || '',
      position: fd.get('position') as string,
      startDate: fd.get('startDate') as string,
      status: fd.get('status') as Employee['status'],
      baseSalary: Number(fd.get('baseSalary')),
    };
    setEmployeeList(prev => [newEmp, ...prev]);
    setDialogOpen(false);
    toast.success(`Đã thêm nhân viên ${newEmp.fullName}`);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDialog) return;
    const fd = new FormData(e.currentTarget);
    const dept = departmentList.find(d => d.id === fd.get('departmentId'));
    setEmployeeList(prev => prev.map(emp =>
      emp.id === editDialog.id
        ? {
            ...emp,
            fullName: fd.get('fullName') as string,
            email: fd.get('email') as string,
            phone: fd.get('phone') as string,
            departmentId: fd.get('departmentId') as string,
            departmentName: dept?.name || emp.departmentName,
            position: fd.get('position') as string,
            baseSalary: Number(fd.get('baseSalary')),
            status: fd.get('status') as Employee['status'],
          }
        : emp
    ));
    toast.success(`Đã cập nhật thông tin ${editDialog.fullName}`);
    setEditDialog(null);
  };

  const handleDelete = () => {
    if (!deleteDialog) return;
    setEmployeeList(prev => prev.filter(e => e.id !== deleteDialog.id));
    toast.success(`Đã xóa nhân viên ${deleteDialog.fullName}`);
    setDeleteDialog(null);
  };

  const EmployeeForm = ({ emp, onSubmit, onCancel, submitLabel }: { emp?: Employee; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Họ tên</Label>
          <Input name="fullName" defaultValue={emp?.fullName} required placeholder="Nguyễn Văn A" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input name="email" type="email" defaultValue={emp?.email} required placeholder="email@company.vn" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Số điện thoại</Label>
          <Input name="phone" defaultValue={emp?.phone} required placeholder="0901234567" />
        </div>
        <div className="space-y-2">
          <Label>Chức vụ</Label>
          <Input name="position" defaultValue={emp?.position} required placeholder="Developer" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phòng ban</Label>
          <select name="departmentId" defaultValue={emp?.departmentId || ''} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="" disabled>Chọn phòng ban</option>
            {departmentList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Lương cơ bản</Label>
          <Input name="baseSalary" type="number" defaultValue={emp?.baseSalary} required placeholder="15000000" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ngày bắt đầu</Label>
          <Input name="startDate" type="date" defaultValue={emp?.startDate || new Date().toISOString().split('T')[0]} required />
        </div>
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <select name="status" defaultValue={emp?.status || 'active'} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="active">Đang làm</option>
            <option value="inactive">Nghỉ việc</option>
            <option value="on_leave">Nghỉ phép</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );

  return (
    <div>
      <PageHeader
        title="Quản lý nhân viên"
        description={`Tổng cộng ${employeeList.length} nhân viên`}
        actions={<Button size="sm" onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-1" /> Thêm nhân viên</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm kiếm nhân viên..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
        >
          <option value="all">Tất cả phòng ban</option>
          {departmentList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

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
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phòng ban</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Chức vụ</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Lương CB</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => {
                const st = statusMap[emp.status];
                return (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{emp.fullName}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{departmentMap.get(emp.departmentId) || emp.departmentName || '—'}</td>
                    <td className="px-4 py-3 text-foreground">{emp.position}</td>
                    <td className="px-4 py-3 text-foreground">{formatSalary(emp.baseSalary)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn('text-xs', st.className)}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreHorizontal size={16} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditDialog(emp)}>
                            <Pencil size={14} className="mr-2" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/employee-profiles/${emp.id}`)}>
                            <FileText size={14} className="mr-2" /> Xem hồ sơ
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteDialog(emp)} className="text-destructive focus:text-destructive">
                            <Trash2 size={14} className="mr-2" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Không tìm thấy nhân viên nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm nhân viên mới</DialogTitle>
            <DialogDescription>Điền thông tin nhân viên</DialogDescription>
          </DialogHeader>
          <EmployeeForm onSubmit={handleCreate} onCancel={() => setDialogOpen(false)} submitLabel="Thêm nhân viên" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={open => !open && setEditDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
            <DialogDescription>{editDialog?.fullName}</DialogDescription>
          </DialogHeader>
          {editDialog && <EmployeeForm emp={editDialog} onSubmit={handleEdit} onCancel={() => setEditDialog(null)} submitLabel="Lưu thay đổi" />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={open => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhân viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa nhân viên <span className="font-semibold text-foreground">{deleteDialog?.fullName}</span>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Employees;
