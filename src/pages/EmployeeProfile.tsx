import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { Department, Employee } from '@/types/hrm';
import type { EmployeeEducationLevel, EmployeeGender, EmployeeMaritalStatus, EmployeeProfileData } from '@/types/employee';
import { employees as initialEmployees, departments as initialDepartments } from '@/data/mockData';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Building2, FileText, IdCard, Mail, MapPin, Phone, Save, School, User } from 'lucide-react';

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

const EmployeeProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();

  const [employeeList, setEmployeeList] = usePersistedState<Employee[]>('hrm_employees', initialEmployees);
  const [departmentList] = usePersistedState<Department[]>('hrm_departments', initialDepartments);
  const [profilesByEmployeeId, setProfilesByEmployeeId] = usePersistedState<Record<string, EmployeeProfileData>>(
    'hrm_employee_profiles',
    initialProfiles,
  );

  const allowedEmployees = useMemo(() => {
    if (!user) return [];
    if (user.role === 'EMPLOYEE') return employeeList.filter(e => e.userId === user.id);
    return employeeList;
  }, [employeeList, user]);

  const selectedEmployeeId = useMemo(() => {
    if (user?.role === 'EMPLOYEE') return allowedEmployees[0]?.id;
    return employeeId || allowedEmployees[0]?.id;
  }, [allowedEmployees, employeeId, user?.role]);

  const selectedEmployee = useMemo(
    () => employeeList.find(e => e.id === selectedEmployeeId) || allowedEmployees[0] || null,
    [allowedEmployees, employeeList, selectedEmployeeId],
  );

  const selectedProfile = useMemo(() => {
    if (!selectedEmployee) return null;
    return profilesByEmployeeId[selectedEmployee.id] || buildDefaultProfile(selectedEmployee);
  }, [profilesByEmployeeId, selectedEmployee]);

  const [editing, setEditing] = useState<EmployeeProfileData | null>(null);

  useEffect(() => {
    if (!selectedProfile) return;
    setEditing(selectedProfile);
  }, [selectedProfile]);

  const departmentMap = useMemo(() => new Map(departmentList.map(d => [d.id, d.name])), [departmentList]);

  const [search, setSearch] = useState('');

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allowedEmployees;
    return allowedEmployees.filter(e => e.fullName.toLowerCase().includes(q));
  }, [allowedEmployees, search]);

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Hồ sơ nhân viên"
        description="Thông tin cá nhân, liên hệ và dữ liệu tổ chức"
        actions={
          selectedEmployee ? (
            <Badge variant="outline" className="gap-2">
              <User size={14} /> {selectedEmployee.fullName}
            </Badge>
          ) : undefined
        }
      />

      {!selectedEmployee || !editing ? (
        <div className="bg-card rounded-xl p-6 text-muted-foreground" style={{ boxShadow: 'var(--shadow-card)' }}>
          Chưa có dữ liệu nhân viên.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: employee list */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="xl:col-span-1"
          >
            <div className="bg-card rounded-xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-primary" />
                <h3 className="font-semibold text-foreground">Danh sách</h3>
                <span className="text-xs text-muted-foreground">({filteredEmployees.length})</span>
              </div>

              <div className="space-y-3 mb-4">
                <Label>Tìm nhân viên</Label>
                <Input placeholder="Nhập họ tên..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>

              <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
                {filteredEmployees.map(emp => {
                  const isActive = emp.id === selectedEmployee.id;
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => navigate(`/employee-profiles/${emp.id}`)}
                      className={cn(
                        'w-full text-left rounded-lg border px-3 py-2 transition-colors',
                        isActive
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/60 hover:bg-muted/30 hover:border-border',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">{emp.fullName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {departmentMap.get(emp.departmentId) || emp.departmentName || '—'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">Không tìm thấy nhân viên.</div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right: profile form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-2"
          >
            <form
              key={selectedEmployee.id}
              onSubmit={(e) => {
                e.preventDefault();
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

                setEmployeeList(prev =>
                  prev.map(emp => {
                    if (emp.id !== updatedProfile.employeeId) return emp;
                    const deptName = departmentMap.get(updatedProfile.departmentId) || emp.departmentName;
                    return {
                      ...emp,
                      fullName: updatedProfile.fullName,
                      email: updatedProfile.companyEmail,
                      phone: updatedProfile.phone,
                      departmentId: updatedProfile.departmentId,
                      departmentName: deptName,
                      position: updatedProfile.position,
                      startDate: updatedProfile.startDate,
                    };
                  }),
                );

                toast.success('Đã lưu hồ sơ nhân viên');
              }}
              className="bg-card rounded-xl p-6"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <IdCard size={18} className="text-primary" />
                    {editing.fullName || 'Chưa có tên'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {departmentMap.get(editing.departmentId) || 'Chưa chọn phòng ban'} · {editing.position || '—'}
                  </p>
                </div>

                <Button type="submit" className="gap-2">
                  <Save size={16} />
                  Lưu
                </Button>
              </div>

              {/* Section: Basic */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Họ tên</Label>
                  <Input name="fullName" defaultValue={editing.fullName} placeholder="Nguyễn Văn A" />
                </div>
                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Input name="dateOfBirth" type="date" defaultValue={editing.dateOfBirth} />
                </div>
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <select
                    name="gender"
                    defaultValue={editing.gender}
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
                  <Label>CCCD</Label>
                  <Input name="idCard" defaultValue={editing.idCard} placeholder="Số CCCD" />
                </div>
              </div>

              {/* Section: Contacts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone size={16} className="text-primary" />
                    SĐT
                  </Label>
                  <Input name="phone" defaultValue={editing.phone} placeholder="0901xxxxxx" />
                </div>
                <div className="space-y-2">
                  <Label>Liên hệ khẩn cấp (tên)</Label>
                  <Input name="emergencyContactName" defaultValue={editing.emergencyContactName} placeholder="Người liên hệ khẩn cấp" />
                </div>
                <div className="space-y-2">
                  <Label>Liên hệ khẩn cấp (SĐT)</Label>
                  <Input name="emergencyContactPhone" defaultValue={editing.emergencyContactPhone} placeholder="SĐT khẩn cấp" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail size={16} className="text-primary" />
                    Email cá nhân / công ty
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    <Input name="personalEmail" type="email" defaultValue={editing.personalEmail} placeholder="Email cá nhân" />
                    <Input name="companyEmail" type="email" defaultValue={editing.companyEmail} placeholder="Email công ty" />
                  </div>
                </div>
              </div>

              {/* Section: Addresses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    Địa chỉ thường trú
                  </Label>
                  <Textarea name="permanentAddress" defaultValue={editing.permanentAddress} placeholder="Nhập địa chỉ thường trú" />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ tạm trú</Label>
                  <Textarea name="temporaryAddress" defaultValue={editing.temporaryAddress} placeholder="Nhập địa chỉ tạm trú" />
                </div>
              </div>

              {/* Section: Organization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 size={16} className="text-primary" />
                    Phòng ban
                  </Label>
                  <select
                    name="departmentId"
                    defaultValue={editing.departmentId}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {departmentList.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                    {departmentList.length === 0 && <option value={editing.departmentId}>{editing.departmentId}</option>}
                    {departmentList.length > 0 && !departmentMap.get(editing.departmentId) && (
                      <option value={editing.departmentId}>{editing.departmentId}</option>
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Chức vụ</Label>
                  <Input name="position" defaultValue={editing.position} placeholder="Chức vụ" />
                </div>
                <div className="space-y-2">
                  <Label>Ngày vào làm</Label>
                  <Input name="startDate" type="date" defaultValue={editing.startDate} />
                </div>
                <div className="space-y-2">
                  <Label>Trình độ học vấn</Label>
                  <select
                    name="educationLevel"
                    defaultValue={editing.educationLevel}
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
                    defaultValue={editing.maritalStatus}
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
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;