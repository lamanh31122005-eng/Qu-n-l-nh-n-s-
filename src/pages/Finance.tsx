import { useState } from 'react';
import { financeTransactions as initialTransactions, dashboardStats } from '@/data/mockData';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useAuth } from '@/contexts/AuthContext';
import type { FinanceTransaction } from '@/types/hrm';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, ArrowDownLeft, ArrowUpRight, DollarSign, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Finance = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = usePersistedState<FinanceTransaction[]>('hrm_finance', initialTransactions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<FinanceTransaction | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<FinanceTransaction | null>(null);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const fmt = (v: number) => {
    if (v >= 1000000000) return `${(v / 1000000000).toFixed(1)} tỷ ₫`;
    if (v >= 1000000) return `${(v / 1000000).toFixed(0)} tr ₫`;
    return v.toLocaleString('vi-VN') + ' ₫';
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newTx: FinanceTransaction = {
      id: `fin_${Date.now()}`,
      type: fd.get('type') as FinanceTransaction['type'],
      category: fd.get('category') as string,
      amount: Number(fd.get('amount')),
      description: fd.get('description') as string,
      date: fd.get('date') as string,
      createdBy: user?.fullName || '',
    };
    setTransactions(prev => [newTx, ...prev]);
    setDialogOpen(false);
    toast.success('Đã tạo phiếu thu/chi');
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDialog) return;
    const fd = new FormData(e.currentTarget);
    setTransactions(prev => prev.map(t =>
      t.id === editDialog.id
        ? {
            ...t,
            type: fd.get('type') as FinanceTransaction['type'],
            category: fd.get('category') as string,
            amount: Number(fd.get('amount')),
            description: fd.get('description') as string,
            date: fd.get('date') as string,
          }
        : t
    ));
    toast.success('Đã cập nhật phiếu');
    setEditDialog(null);
  };

  const handleDelete = () => {
    if (!deleteDialog) return;
    setTransactions(prev => prev.filter(t => t.id !== deleteDialog.id));
    toast.success('Đã xóa phiếu');
    setDeleteDialog(null);
  };

  const TxForm = ({ item, onSubmit, onCancel, submitLabel }: { item?: FinanceTransaction; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Loại</Label>
          <select name="type" defaultValue={item?.type || 'expense'} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="income">Thu</option>
            <option value="expense">Chi</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Danh mục</Label>
          <Input name="category" defaultValue={item?.category} required placeholder="Lương, BHXH..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Số tiền (₫)</Label>
          <Input name="amount" type="number" defaultValue={item?.amount} required placeholder="10000000" />
        </div>
        <div className="space-y-2">
          <Label>Ngày</Label>
          <Input name="date" type="date" defaultValue={item?.date || new Date().toISOString().split('T')[0]} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Mô tả</Label>
        <Textarea name="description" defaultValue={item?.description} required placeholder="Mô tả chi tiết..." />
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
        title="Quản lý tài chính"
        description="Theo dõi thu chi và báo cáo tài chính"
        actions={<Button size="sm" onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-1" /> Tạo phiếu</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Tổng thu" value={fmt(totalIncome)} icon={ArrowDownLeft} color="success" index={0} />
        <StatCard title="Tổng chi" value={fmt(totalExpense)} icon={ArrowUpRight} color="primary" index={1} />
        <StatCard title="Chênh lệch" value={fmt(totalIncome - totalExpense)} icon={DollarSign} color="info" index={2} />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ngày</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Loại</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Danh mục</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mô tả</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Số tiền</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-foreground">{t.date}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn('text-xs', t.type === 'income' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20')}>
                      {t.type === 'income' ? 'Thu' : 'Chi'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-foreground">{t.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.description}</td>
                  <td className={cn('px-4 py-3 text-right font-medium', t.type === 'income' ? 'text-success' : 'text-destructive')}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreHorizontal size={16} /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditDialog(t)}>
                          <Pencil size={14} className="mr-2" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteDialog(t)} className="text-destructive focus:text-destructive">
                          <Trash2 size={14} className="mr-2" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có giao dịch nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo phiếu thu/chi</DialogTitle>
            <DialogDescription>Điền thông tin giao dịch</DialogDescription>
          </DialogHeader>
          <TxForm onSubmit={handleCreate} onCancel={() => setDialogOpen(false)} submitLabel="Tạo phiếu" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={open => !open && setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phiếu</DialogTitle>
            <DialogDescription>{editDialog?.description}</DialogDescription>
          </DialogHeader>
          {editDialog && <TxForm item={editDialog} onSubmit={handleEdit} onCancel={() => setEditDialog(null)} submitLabel="Lưu thay đổi" />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={open => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phiếu?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa phiếu <span className="font-semibold text-foreground">{deleteDialog?.description}</span>?
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

export default Finance;
