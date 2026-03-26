import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Department, Employee } from '@/types/hrm';
import type { EmployeeEducationLevel, EmployeeGender, EmployeeMaritalStatus, EmployeeProfileData } from '@/types/employee';
import { employees as initialEmployees, departments as initialDepartments } from '@/data/mockData';
import { usePersistedState } from '@/hooks/usePersistedState';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Building2,
  FileText,
  IdCard,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Search,
  School,
  Phone,
  Trash2,
  User,
} from 'lucide-react';

const statusMap: Record<Employee['status'], { label: string; className: string }> = {
  active: { label: 'Đang làm', className: 'bg-success/10 text-success border-success/20' },
  inactive: { label: 'Nghỉ việc', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  on_leave: { label: 'Nghỉ phép', className: 'bg-warning/10 text-warning border-warning/20' },
};

const genderOptions: { value: EmployeeGender; label: string }[] = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const maritalStatusOptions: { value: EmployeeMaritalStatus; label: string }[] = [
  { value: 'single', label: 'Độc thân' },
  { value: 'married', label: 'Đã kết hôn' },
  { value: 'divorced', label: 'Ly hôn' },
  { value: 'widowed', label: 'Góa' },
];

const educationLevelOptions: { value: EmployeeEducationLevel; label: string }[] = [
  { value: 'high school', label: 'Trung học phổ thông' },
  { value: 'bachelor', label: 'Đại học' },
  { value: 'master', label: 'Thạc sĩ' },
  { value: 'doctorate', label: 'Tiến sĩ' },
  { value: 'other', label: 'Khác' },
];

const buildDefaultProfile = (emp: Employee): EmployeeProfileData => ({
  employeeId: emp.id,
  fullName: emp.fullName,
  dateOfBirth: '',
  gender: 'other',
  idCard: '',

  permanentAddress: '',
  temporaryAddress: '',

  phone: emp.phone,
  emergencyContactName: '',
  emergencyContactPhone: '',

  personalEmail: '',
  companyEmail: emp.email,

  departmentId: emp.departmentId,
  position: emp.position,
  startDate: emp.startDate,

  educationLevel: 'other',
  maritalStatus: 'single',
});

const initialProfiles: Record<string, EmployeeProfileData> = initialEmployees.reduce((acc, emp) => {
  acc[emp.id] = buildDefaultProfile(emp);
  return acc;
}, {} as Record<string, EmployeeProfileData>);

const EmployeeDashboard = () => {
  const { user } = useAuth();

  const [employeeList, setEmployeeList] = usePersistedState<Employee[]>('hrm_employees', initialEmployees);
  const [departmentList] = usePersistedState<Department[]>('hrm_departments', initialDepartments);
  const [profilesByEmployeeId, setProfilesByEmployeeId] = usePersistedState<Record<string, EmployeeProfileData>>(
    'hrm_employee_profiles',
    initialProfiles,
  );

  const departmentMap = useMemo(() => new Map(departmentList.map(d => [d.id, d.name])), [departmentList]);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<Employee | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Employee | null>(null);

  const canManage = user?.role !== 'EMPLOYEE';
  const employeesVisible = canManage ? employeeList : [];

  useEffect(() => {
    if (!canManage) return;
    // Ensure there's always a selected employee on the page.
    // (Selected state is stored below; initialized after render.)
  }, [canManage]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(() => employeeList[0]?.id ?? null);

  useEffect(() => {
    if (!canManage) return;
    if (selectedEmployeeId && employeeList.some(e => e.id === selectedEmployeeId)) return;
    setSelectedEmployeeId(employeeList[0]?.id ?? null);
  }, [employeeList, canManage, selectedEmployeeId]);

  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return employeeList.find(e => e.id === selectedEmployeeId) || null;
  }, [employeeList, selectedEmployeeId]);

  const selectedProfile = useMemo(() => {
    if (!selectedEmployee) return null;
    return profilesByEmployeeId[selectedEmployee.id] || buildDefaultProfile(selectedEmployee);
  }, [profilesByEmployeeId, selectedEmployee]);

  const [editingProfile, setEditingProfile] = useState<EmployeeProfileData | null>(null);
  useEffect(() => {
    setEditingProfile(selectedProfile);
  }, [selectedProfile]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employeesVisible.filter(e => {
      const matchSearch =
        !q || e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
      const matchDept = deptFilter === 'all' || e.departmentId === deptFilter;
      return matchSearch && matchDept;
    });
  }, [employeesVisible, search, deptFilter]);

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
    setProfilesByEmployeeId(prev => ({ ...prev, [newEmp.id]: buildDefaultProfile(newEmp) }));
    setSelectedEmployeeId(newEmp.id);
    setDialogOpen(false);
    toast.success(`Đã thêm nhân viên ${newEmp.fullName}`);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDialog) return;
    const fd = new FormData(e.currentTarget);
    const dept = departmentList.find(d => d.id === fd.get('departmentId'));

    const updatedEmp: Employee = {
      ...editDialog,
      fullName: fd.get('fullName') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      departmentId: fd.get('departmentId') as string,
      departmentName: dept?.name || editDialog.departmentName,
      position: fd.get('position') as string,
      baseSalary: Number(fd.get('baseSalary')),
      startDate: fd.get('startDate') as string,
      status: fd.get('status') as Employee['status'],
    };

    setEmployeeList(prev => prev.map(emp => (emp.id === updatedEmp.id ? updatedEmp : emp)));

    setProfilesByEmployeeId(prev => ({
      ...prev,
      [updatedEmp.id]: {
        ...(prev[updatedEmp.id] || buildDefaultProfile(updatedEmp)),
        fullName: updatedEmp.fullName,
        companyEmail: updatedEmp.email,
        phone: updatedEmp.phone,
        departmentId: updatedEmp.departmentId,
        position: updatedEmp.position,
        startDate: updatedEmp.startDate,
      },
    }));

    toast.success(`Đã cập nhật thông tin ${updatedEmp.fullName}`);
    setEditDialog(null);
  };

  const handleDelete = () => {
    if (!deleteDialog) return;
    const id = deleteDialog.id;
    const name = deleteDialog.fullName;
    setEmployeeList(prev => prev.filter(e => e.id !== id));
    setProfilesByEmployeeId(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    toast.success(`Đã xóa nhân viên ${name}`);
    setDeleteDialog(null);
  };

  const EmployeeForm = ({
    emp,
    onSubmit,
    onCancel,
    submitLabel,
  }: {
    emp?: Employee;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    submitLabel: string;
  }) => (
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
          <select
            name="departmentId"
            defaultValue={emp?.departmentId || ''}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Chọn phòng ban
            </option>
            {departmentList.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
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
          <Input
            name="startDate"
            type="date"
            defaultValue={emp?.startDate || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <select
            name="status"
            defaultValue={emp?.status || 'active'}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="active">Đang làm</option>
            <option value="inactive">Nghỉ việc</option>
            <option value="on_leave">Nghỉ phép</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );

  if (!user) return null;
  if (!canManage) return <Navigate to="/dashboard" replace />;

  return (
    <div>
      <PageHeader
        title="Quản lý nhân viên"
        description={`Hồ sơ nhân viên + CRUD (tổng cộng ${employeeList.length})`}
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus size={16} className="mr-1" /> Thêm nhân viên
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm nhân viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
        >
          <option value="all">Tất cả phòng ban</option>
          {departmentList.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: employees list */}
        <div className="xl:col-span-1">
          <div className="bg-card rounded-xl p-4 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Danh sách</h3>
              <span className="text-xs text-muted-foreground">({filteredEmployees.length})</span>
            </div>

            <div className="space-y-1 max-h-[560px] overflow-auto pr-1">
              {filteredEmployees.map(emp => {
                const isActive = emp.id === selectedEmployeeId;
                const st = statusMap[emp.status];
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={cn(
                      'w-full text-left rounded-lg border px-3 py-2 transition-colors',
                      isActive ? 'border-primary/50 bg-primary/5' : 'border-border/60 hover:bg-muted/30',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{emp.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {(departmentMap.get(emp.departmentId) || emp.departmentName) ?? '—'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn('text-[11px]', st.className)}>
                        {st.label}
                      </Badge>
                    </div>
                  </button>
                );
              })}
              {filteredEmployees.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">Không tìm thấy nhân viên.</div>
              )}
            </div>
          </div>

          {/* CRUD helper table controls */}
          <div className="mt-4">
            <div className="bg-card rounded-xl p-4 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-2 py-3 font-medium text-muted-foreground">Hành động</th>
                      <th className="text-right px-2 py-3 font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.slice(0, 6).map(emp => (
                      <tr key={emp.id} className="border-b border-border/50">
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground text-xs">{emp.fullName}</span>
                              <span className="text-xs text-muted-foreground truncate">{emp.position}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEmployeeId(emp.id);
                                  setEditDialog(emp);
                                }}
                              >
                                <Pencil size={14} className="mr-2" /> Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSelectedEmployeeId(emp.id)}>
                                <FileText size={14} className="mr-2" /> Xem hồ sơ
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteDialog(emp)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 size={14} className="mr-2" /> Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {filteredEmployees.length > 6 && (
                      <tr>
                        <td colSpan={2} className="text-center py-3 text-muted-foreground text-xs">
                          Hiển thị {Math.min(6, filteredEmployees.length)}/{filteredEmployees.length} hành động. Chọn nhân viên ở danh sách bên trên.
                        </td>
                      </tr>
                    )}
                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td colSpan={2} className="text-center py-6 text-muted-foreground text-xs">
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right: profile form */}
        <div className="xl:col-span-2">
          {!selectedEmployee || !editingProfile ? (
            <div className="bg-card rounded-xl p-6 text-muted-foreground" style={{ boxShadow: 'var(--shadow-card)' }}>
              Vui lòng chọn một nhân viên để xem/chỉnh sửa hồ sơ.
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-card rounded-xl p-6"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <form
                key={selectedEmployee.id}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedEmployee) return;
                  const fd = new FormData(e.currentTarget);

                  const updatedProfile: EmployeeProfileData = {
                    employeeId: selectedEmployee.id,
                    fullName: fd.get('fullName') as string,
                    dateOfBirth: fd.get('dateOfBirth') as string,
                    gender: fd.get('gender') as EmployeeGender,
                    idCard: fd.get('idCard') as string,

                    permanentAddress: fd.get('permanentAddress') as string,
                    temporaryAddress: fd.get('temporaryAddress') as string,

                    phone: fd.get('phone') as string,
                    emergencyContactName: fd.get('emergencyContactName') as string,
                    emergencyContactPhone: fd.get('emergencyContactPhone') as string,

                    personalEmail: fd.get('personalEmail') as string,
                    companyEmail: fd.get('companyEmail') as string,

                    departmentId: fd.get('departmentId') as string,
                    position: fd.get('position') as string,
                    startDate: fd.get('startDate') as string,

                    educationLevel: fd.get('educationLevel') as EmployeeEducationLevel,
                    maritalStatus: fd.get('maritalStatus') as EmployeeMaritalStatus,
                  };

                  setProfilesByEmployeeId(prev => ({ ...prev, [updatedProfile.employeeId]: updatedProfile }));

                  const deptName = departmentMap.get(updatedProfile.departmentId) || selectedEmployee.departmentName;
                  setEmployeeList(prev =>
                    prev.map(emp =>
                      emp.id === updatedProfile.employeeId
                        ? {
                            ...emp,
                            fullName: updatedProfile.fullName,
                            email: updatedProfile.companyEmail,
                            phone: updatedProfile.phone,
                            departmentId: updatedProfile.departmentId,
                            departmentName: deptName,
                            position: updatedProfile.position,
                            startDate: updatedProfile.startDate,
                          }
                        : emp,
                    ),
                  );

                  toast.success('Đã lưu hồ sơ nhân viên');
                }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <User size={18} className="text-primary" />
                      {editingProfile.fullName || 'Chưa có tên'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {(departmentMap.get(editingProfile.departmentId) || 'Chưa chọn phòng ban') + ' · ' + (editingProfile.position || '—')}
                    </p>
                  </div>
                  <Button type="submit" className="gap-2">
                    <Save size={16} />
                    Lưu
                  </Button>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Họ tên</Label>
                    <Input name="fullName" defaultValue={editingProfile.fullName} placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày sinh</Label>
                    <Input name="dateOfBirth" type="date" defaultValue={editingProfile.dateOfBirth} />
                  </div>
                  <div className="space-y-2">
                    <Label>Giới tính</Label>
                    <select
                      name="gender"
                      defaultValue={editingProfile.gender}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {genderOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <IdCard size={16} className="text-primary" />
                      CCCD
                    </Label>
                    <Input name="idCard" defaultValue={editingProfile.idCard} placeholder="Số CCCD" />
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin size={16} className="text-primary" />
                      Địa chỉ thường trú
                    </Label>
                    <Textarea
                      name="permanentAddress"
                      defaultValue={editingProfile.permanentAddress}
                      placeholder="Nhập địa chỉ thường trú"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Địa chỉ tạm trú</Label>
                    <Textarea
                      name="temporaryAddress"
                      defaultValue={editingProfile.temporaryAddress}
                      placeholder="Nhập địa chỉ tạm trú"
                    />
                  </div>
                </div>

                {/* Contacts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone size={16} className="text-primary" />
                      SĐT
                    </Label>
                    <Input name="phone" defaultValue={editingProfile.phone} placeholder="0901xxxxxx" />
                  </div>
                  <div className="space-y-2">
                    <Label>Liên hệ khẩn cấp (tên)</Label>
                    <Input
                      name="emergencyContactName"
                      defaultValue={editingProfile.emergencyContactName}
                      placeholder="Người liên hệ khẩn cấp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Liên hệ khẩn cấp (SĐT)</Label>
                    <Input
                      name="emergencyContactPhone"
                      defaultValue={editingProfile.emergencyContactPhone}
                      placeholder="SĐT khẩn cấp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail size={16} className="text-primary" />
                      Email cá nhân + công ty
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      <Input
                        name="personalEmail"
                        type="email"
                        defaultValue={editingProfile.personalEmail}
                        placeholder="Email cá nhân"
                      />
                      <Input
                        name="companyEmail"
                        type="email"
                        defaultValue={editingProfile.companyEmail}
                        placeholder="Email công ty"
                      />
                    </div>
                  </div>
                </div>

                {/* Organization + Education */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 size={16} className="text-primary" />
                      Phòng ban
                    </Label>
                    <select
                      name="departmentId"
                      defaultValue={editingProfile.departmentId}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {departmentList.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                      {departmentList.length === 0 && <option value={editingProfile.departmentId}>{editingProfile.departmentId}</option>}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chức vụ</Label>
                    <Input name="position" defaultValue={editingProfile.position} placeholder="Chức vụ" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày vào làm</Label>
                    <Input name="startDate" type="date" defaultValue={editingProfile.startDate} />
                  </div>
                  <div className="space-y-2">
                    <Label>Trình độ học vấn</Label>
                    <select
                      name="educationLevel"
                      defaultValue={editingProfile.educationLevel}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {educationLevelOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <School size={16} className="text-primary" />
                      Tình trạng hôn nhân
                    </Label>
                    <select
                      name="maritalStatus"
                      defaultValue={editingProfile.maritalStatus}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {maritalStatusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ghi chú</Label>
                    <Input placeholder="(tùy chọn)" disabled className="opacity-70" />
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>

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
          {editDialog && (
            <EmployeeForm emp={editDialog} onSubmit={handleEdit} onCancel={() => setEditDialog(null)} submitLabel="Lưu thay đổi" />
          )}
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

export default EmployeeDashboard;

