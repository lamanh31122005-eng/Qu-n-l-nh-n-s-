import { useState, useMemo } from 'react';
import { recruitments as initialRecruitments, departments as initialDepartments } from '@/data/mockData';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { Department, Recruitment } from '@/types/hrm';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Users, Calendar, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusStyle = {
  open: { label: 'Đang tuyển', className: 'bg-success/10 text-success border-success/20' },
  closed: { label: 'Đã đóng', className: 'bg-muted text-muted-foreground border-border' },
  on_hold: { label: 'Tạm dừng', className: 'bg-warning/10 text-warning border-warning/20' },
};

const Recruitment = () => {
  const [list, setList] = usePersistedState<Recruitment[]>('hrm_recruitment', initialRecruitments);
  const [departmentList] = usePersistedState<Department[]>('hrm_departments', initialDepartments);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<Recruitment | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Recruitment | null>(null);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newItem: Recruitment = {
      id: `rec_${Date.now()}`,
      title: fd.get('title') as string,
      department: fd.get('department') as string,
      positions: Number(fd.get('positions')),
      status: fd.get('status') as Recruitment['status'],
      applicants: 0,
      deadline: fd.get('deadline') as string,
    };
    setList(prev => [newItem, ...prev]);
    setDialogOpen(false);
    toast.success(`Đã tạo tin tuyển dụng: ${newItem.title}`);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDialog) return;
    const fd = new FormData(e.currentTarget);
    setList(prev => prev.map(r =>
      r.id === editDialog.id
        ? {
            ...r,
            title: fd.get('title') as string,
            department: fd.get('department') as string,
            positions: Number(fd.get('positions')),
            status: fd.get('status') as Recruitment['status'],
            deadline: fd.get('deadline') as string,
          }
        : r
    ));
    toast.success(`Đã cập nhật tin tuyển dụng`);
    setEditDialog(null);
  };

  const handleDelete = () => {
    if (!deleteDialog) return;
    setList(prev => prev.filter(r => r.id !== deleteDialog.id));
    toast.success(`Đã xóa tin tuyển dụng: ${deleteDialog.title}`);
    setDeleteDialog(null);
  };

  const RecruitmentForm = ({ item, onSubmit, onCancel, submitLabel }: { item?: Recruitment; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Tiêu đề</Label>
        <Input name="title" defaultValue={item?.title} required placeholder="Senior React Developer" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phòng ban</Label>
          <select name="department" defaultValue={item?.department || ''} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="" disabled>Chọn phòng ban</option>
            {departmentList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Số vị trí</Label>
          <Input name="positions" type="number" min="1" defaultValue={item?.positions || 1} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Hạn nộp</Label>
          <Input name="deadline" type="date" defaultValue={item?.deadline} required />
        </div>
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <select name="status" defaultValue={item?.status || 'open'} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="open">Đang tuyển</option>
            <option value="closed">Đã đóng</option>
            <option value="on_hold">Tạm dừng</option>
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
        title="Tuyển dụng"
        description="Quản lý tin tuyển dụng và ứng viên"
        actions={<Button size="sm" onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-1" /> Tạo tin tuyển dụng</Button>}
      />
      <div className="grid gap-4">
        {list.map((r, i) => {
          const st = statusStyle[r.status];
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{r.title}</h3>
                    <Badge variant="outline" className={cn('text-xs', st.className)}>{st.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.department} · {r.positions} vị trí</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users size={14} /> {r.applicants} ứng viên</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> Hạn: {r.deadline}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm"><MoreHorizontal size={16} /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditDialog(r)}>
                      <Pencil size={14} className="mr-2" /> Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteDialog(r)} className="text-destructive focus:text-destructive">
                      <Trash2 size={14} className="mr-2" /> Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          );
        })}
        {list.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Chưa có tin tuyển dụng nào</div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo tin tuyển dụng mới</DialogTitle>
            <DialogDescription>Điền thông tin tin tuyển dụng</DialogDescription>
          </DialogHeader>
          <RecruitmentForm onSubmit={handleCreate} onCancel={() => setDialogOpen(false)} submitLabel="Tạo tin" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={open => !open && setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tin tuyển dụng</DialogTitle>
            <DialogDescription>{editDialog?.title}</DialogDescription>
          </DialogHeader>
          {editDialog && <RecruitmentForm item={editDialog} onSubmit={handleEdit} onCancel={() => setEditDialog(null)} submitLabel="Lưu thay đổi" />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={open => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tin tuyển dụng?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa tin <span className="font-semibold text-foreground">{deleteDialog?.title}</span>?
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

export default Recruitment;
