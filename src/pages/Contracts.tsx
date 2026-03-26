import { useState } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import PageHeader from '@/components/shared/PageHeader';
import { contracts as initialContracts } from '@/data/mockData';
import { CONTRACT_TYPE_LABELS, CONTRACT_STATUS_LABELS } from '@/types/hrm';
import type { Contract } from '@/types/hrm';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, FileText, CalendarDays, AlertTriangle, CheckCircle2, Pencil, RefreshCw, XCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import StatCard from '@/components/shared/StatCard';

const statusColors: Record<Contract['status'], string> = {
  active: 'bg-success/10 text-success border-success/20',
  expired: 'bg-destructive/10 text-destructive border-destructive/20',
  terminated: 'bg-muted text-muted-foreground border-border',
  pending_renewal: 'bg-warning/10 text-warning border-warning/20',
};

const Contracts = () => {
  const [contractList, setContractList] = usePersistedState<Contract[]>('hrm_contracts', initialContracts);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<Contract | null>(null);
  const [renewDialog, setRenewDialog] = useState<Contract | null>(null);
  const [terminateDialog, setTerminateDialog] = useState<Contract | null>(null);
  const { toast } = useToast();

  const filtered = contractList.filter(c => {
    const matchSearch = c.employeeName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: contractList.length,
    active: contractList.filter(c => c.status === 'active').length,
    expiringSoon: contractList.filter(c => c.status === 'pending_renewal').length,
    expired: contractList.filter(c => c.status === 'expired').length,
  };

  const [deleteDialog, setDeleteDialog] = useState<Contract | null>(null);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newContract: Contract = {
      id: `contract_${Date.now()}`,
      employeeId: `emp_${Date.now()}`,
      employeeName: fd.get('employeeName') as string,
      type: fd.get('type') as Contract['type'],
      startDate: fd.get('startDate') as string,
      endDate: (fd.get('endDate') as string) || null,
      salary: Number(fd.get('salary')),
      status: 'active',
      signedDate: new Date().toISOString().split('T')[0],
      notes: (fd.get('notes') as string) || undefined,
    };
    setContractList(prev => [newContract, ...prev]);
    toast({ title: 'Thành công', description: `Đã tạo hợp đồng cho ${newContract.employeeName}` });
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteDialog) return;
    setContractList(prev => prev.filter(c => c.id !== deleteDialog.id));
    toast({ title: 'Đã xóa', description: `Đã xóa hợp đồng của ${deleteDialog.employeeName}` });
    setDeleteDialog(null);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDialog) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    setContractList(prev => prev.map(c =>
      c.id === editDialog.id
        ? {
            ...c,
            type: formData.get('type') as Contract['type'],
            salary: Number(formData.get('salary')),
            startDate: formData.get('startDate') as string,
            endDate: (formData.get('endDate') as string) || null,
            notes: (formData.get('notes') as string) || undefined,
          }
        : c
    ));
    toast({ title: 'Thành công', description: `Đã cập nhật hợp đồng của ${editDialog.employeeName}` });
    setEditDialog(null);
  };

  const handleRenew = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!renewDialog) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    setContractList(prev => prev.map(c =>
      c.id === renewDialog.id
        ? {
            ...c,
            type: formData.get('type') as Contract['type'],
            startDate: formData.get('startDate') as string,
            endDate: (formData.get('endDate') as string) || null,
            salary: Number(formData.get('salary')),
            status: 'active',
            signedDate: new Date().toISOString().split('T')[0],
            notes: (formData.get('notes') as string) || undefined,
          }
        : c
    ));
    toast({ title: 'Thành công', description: `Đã gia hạn hợp đồng của ${renewDialog.employeeName}` });
    setRenewDialog(null);
  };

  const handleTerminate = () => {
    if (!terminateDialog) return;
    setContractList(prev => prev.map(c =>
      c.id === terminateDialog.id ? { ...c, status: 'terminated' as const } : c
    ));
    toast({ title: 'Đã chấm dứt', description: `Hợp đồng của ${terminateDialog.employeeName} đã được chấm dứt` });
    setTerminateDialog(null);
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div>
      <PageHeader
        title="Hợp đồng lao động"
        description="Quản lý hợp đồng lao động của nhân viên"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus size={16} className="mr-2" />Tạo hợp đồng</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo hợp đồng mới</DialogTitle>
                <DialogDescription>Điền thông tin để tạo hợp đồng lao động mới</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nhân viên</Label>
                  <Input name="employeeName" placeholder="Tên nhân viên" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loại hợp đồng</Label>
                    <Select defaultValue="fixed_term" name="type">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="probation">Thử việc</SelectItem>
                        <SelectItem value="fixed_term">Có thời hạn</SelectItem>
                        <SelectItem value="indefinite">Không thời hạn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mức lương</Label>
                    <Input type="number" name="salary" placeholder="VNĐ" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Input type="date" name="startDate" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Input type="date" name="endDate" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Input name="notes" placeholder="Ghi chú thêm..." />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
                  <Button type="submit">Tạo hợp đồng</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Tổng hợp đồng" value={stats.total} icon={FileText} />
        <StatCard title="Đang hiệu lực" value={stats.active} icon={CheckCircle2} color="success" />
        <StatCard title="Chờ gia hạn" value={stats.expiringSoon} icon={AlertTriangle} color="warning" />
        <StatCard title="Hết hạn" value={stats.expired} icon={CalendarDays} color="info" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm theo tên nhân viên..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Loại HĐ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="probation">Thử việc</SelectItem>
            <SelectItem value="fixed_term">Có thời hạn</SelectItem>
            <SelectItem value="indefinite">Không thời hạn</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Hiệu lực</SelectItem>
            <SelectItem value="pending_renewal">Chờ gia hạn</SelectItem>
            <SelectItem value="expired">Hết hạn</SelectItem>
            <SelectItem value="terminated">Đã chấm dứt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Nhân viên</th>
                <th className="text-left px-4 py-3 font-medium">Loại HĐ</th>
                <th className="text-left px-4 py-3 font-medium">Ngày bắt đầu</th>
                <th className="text-left px-4 py-3 font-medium">Ngày kết thúc</th>
                <th className="text-right px-4 py-3 font-medium">Mức lương</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium">Ngày ký</th>
                <th className="text-center px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{c.employeeName}</td>
                  <td className="px-4 py-3">{CONTRACT_TYPE_LABELS[c.type]}</td>
                  <td className="px-4 py-3">{c.startDate}</td>
                  <td className="px-4 py-3">{c.endDate || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(c.salary)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={statusColors[c.status]}>
                      {CONTRACT_STATUS_LABELS[c.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.signedDate}</td>
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditDialog(c)}>
                          <Pencil size={14} className="mr-2" />Chỉnh sửa
                        </DropdownMenuItem>
                        {(c.status === 'pending_renewal' || c.status === 'expired') && (
                          <DropdownMenuItem onClick={() => setRenewDialog(c)}>
                            <RefreshCw size={14} className="mr-2" />Gia hạn
                          </DropdownMenuItem>
                        )}
                         {c.status !== 'terminated' && (
                           <DropdownMenuItem onClick={() => setTerminateDialog(c)} className="text-destructive focus:text-destructive">
                             <XCircle size={14} className="mr-2" />Chấm dứt
                           </DropdownMenuItem>
                         )}
                         <DropdownMenuItem onClick={() => setDeleteDialog(c)} className="text-destructive focus:text-destructive">
                           <Trash2 size={14} className="mr-2" />Xóa
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Không tìm thấy hợp đồng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={open => !open && setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hợp đồng</DialogTitle>
            <DialogDescription>{editDialog?.employeeName}</DialogDescription>
          </DialogHeader>
          {editDialog && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại hợp đồng</Label>
                  <Select defaultValue={editDialog.type} name="type">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="probation">Thử việc</SelectItem>
                      <SelectItem value="fixed_term">Có thời hạn</SelectItem>
                      <SelectItem value="indefinite">Không thời hạn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mức lương</Label>
                  <Input type="number" name="salary" defaultValue={editDialog.salary} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày bắt đầu</Label>
                  <Input type="date" name="startDate" defaultValue={editDialog.startDate} required />
                </div>
                <div className="space-y-2">
                  <Label>Ngày kết thúc</Label>
                  <Input type="date" name="endDate" defaultValue={editDialog.endDate || ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea name="notes" defaultValue={editDialog.notes || ''} placeholder="Ghi chú..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditDialog(null)}>Hủy</Button>
                <Button type="submit">Lưu thay đổi</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Renew Dialog */}
      <Dialog open={!!renewDialog} onOpenChange={open => !open && setRenewDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gia hạn hợp đồng</DialogTitle>
            <DialogDescription>Gia hạn hợp đồng cho {renewDialog?.employeeName}</DialogDescription>
          </DialogHeader>
          {renewDialog && (
            <form onSubmit={handleRenew} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại hợp đồng mới</Label>
                  <Select defaultValue="fixed_term" name="type">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed_term">Có thời hạn</SelectItem>
                      <SelectItem value="indefinite">Không thời hạn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mức lương mới</Label>
                  <Input type="number" name="salary" defaultValue={renewDialog.salary} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày bắt đầu mới</Label>
                  <Input type="date" name="startDate" defaultValue={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="space-y-2">
                  <Label>Ngày kết thúc mới</Label>
                  <Input type="date" name="endDate" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea name="notes" placeholder="Ghi chú gia hạn..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setRenewDialog(null)}>Hủy</Button>
                <Button type="submit">Xác nhận gia hạn</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Terminate Confirmation */}
      <AlertDialog open={!!terminateDialog} onOpenChange={open => !open && setTerminateDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chấm dứt hợp đồng?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn chấm dứt hợp đồng của <span className="font-semibold text-foreground">{terminateDialog?.employeeName}</span>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleTerminate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Chấm dứt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={open => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa hợp đồng?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa hợp đồng của <span className="font-semibold text-foreground">{deleteDialog?.employeeName}</span>?
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

export default Contracts;
