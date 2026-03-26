import { useMemo, useState } from 'react';
import { departments as initialDepartments, employees as initialEmployees } from '@/data/mockData';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { Department, Employee } from '@/types/hrm';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Building2, Pencil, Trash2, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Departments = () => {
  const [departmentList, setDepartmentList] = usePersistedState<Department[]>('hrm_departments', initialDepartments);
  const [employeeList] = usePersistedState<Employee[]>('hrm_employees', initialEmployees);

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [deleteDept, setDeleteDept] = useState<Department | null>(null);

  const employeeCountByDeptId = useMemo(() => {
    const map = new Map<string, number>();
    for (const emp of employeeList) {
      map.set(emp.departmentId, (map.get(emp.departmentId) || 0) + 1);
    }
    return map;
  }, [employeeList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return departmentList;
    return departmentList.filter(d => d.name.toLowerCase().includes(q));
  }, [departmentList, search]);

  const DepartmentForm = ({
    dept,
    onSubmit,
    onCancel,
    submitLabel,
  }: {
    dept?: Department | null;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    submitLabel: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Tên phòng ban</Label>
        <Input name="name" defaultValue={dept?.name} placeholder="VD: Phòng Nhân sự" required />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get('name') as string).trim();
    if (!name) return;

    const newDept: Department = {
      id: `dept_${Date.now()}`,
      name,
      employeeCount: 0,
    };

    setDepartmentList(prev => [newDept, ...prev]);
    setDialogOpen(false);
    toast.success(`Đã tạo phòng ban: ${name}`);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDept) return;
    const fd = new FormData(e.currentTarget);
    const name = (fd.get('name') as string).trim();
    if (!name) return;

    setDepartmentList(prev => prev.map(d => (d.id === editDept.id ? { ...d, name } : d)));
    toast.success('Đã cập nhật phòng ban');
    setEditDept(null);
  };

  const handleDelete = () => {
    if (!deleteDept) return;
    const name = deleteDept.name;
    setDepartmentList(prev => prev.filter(d => d.id !== deleteDept.id));
    setDeleteDept(null);
    toast.success(`Đã xóa phòng ban: ${name}`);
  };

  return (
    <div>
      <PageHeader
        title="Phòng ban"
        description="Quản lý cơ cấu tổ chức (CRUD)"
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus size={16} className="mr-1" />
            Thêm phòng ban
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-5 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tìm phòng ban..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <Users size={14} className="mr-1" />
              {departmentList.length} phòng ban
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phòng ban</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nhân viên</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{d.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {d.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{employeeCountByDeptId.get(d.id) || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditDept(d)}
                      >
                        <Pencil size={16} className="mr-1" />
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDept(d)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-muted-foreground">
                    Không có phòng ban nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm phòng ban</DialogTitle>
            <DialogDescription>Nhập tên phòng ban mới</DialogDescription>
          </DialogHeader>
          <DepartmentForm
            onSubmit={handleCreate}
            onCancel={() => setDialogOpen(false)}
            submitLabel="Tạo"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDept} onOpenChange={open => !open && setEditDept(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng ban</DialogTitle>
            <DialogDescription>{editDept?.name}</DialogDescription>
          </DialogHeader>
          <DepartmentForm
            dept={editDept}
            onSubmit={handleEdit}
            onCancel={() => setEditDept(null)}
            submitLabel="Lưu"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDept} onOpenChange={open => !open && setDeleteDept(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phòng ban?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa phòng ban <span className="font-semibold text-foreground">{deleteDept?.name}</span>? Dữ liệu nhân viên thuộc phòng này có thể còn tồn tại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Departments;
