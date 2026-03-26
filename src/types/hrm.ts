export type UserRole = 'ADMIN' | 'HR' | 'MANAGER_TECH' | 'FINANCE' | 'EMPLOYEE';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
  employeeCount: number;
}

export interface Employee {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  position: string;
  startDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  avatar?: string;
  baseSalary: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number;
  overtimeHours: number;
  status: 'on_time' | 'late' | 'absent' | 'day_off';
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  hours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  allowance: number;
  bonus: number;
  overtimePay: number;
  taxDeduction: number;
  insuranceDeduction: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
}

export interface KPIRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  score: number;
  comment: string;
  evaluatedBy: string;
}

export interface FinanceTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
}

export interface Contract {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'probation' | 'fixed_term' | 'indefinite';
  startDate: string;
  endDate: string | null;
  salary: number;
  status: 'active' | 'expired' | 'terminated' | 'pending_renewal';
  signedDate: string;
  notes?: string;
}

export const CONTRACT_TYPE_LABELS: Record<Contract['type'], string> = {
  probation: 'Thử việc',
  fixed_term: 'Có thời hạn',
  indefinite: 'Không thời hạn',
};

export const CONTRACT_STATUS_LABELS: Record<Contract['status'], string> = {
  active: 'Hiệu lực',
  expired: 'Hết hạn',
  terminated: 'Đã chấm dứt',
  pending_renewal: 'Chờ gia hạn',
};

export interface Recruitment {
  id: string;
  title: string;
  department: string;
  positions: number;
  status: 'open' | 'closed' | 'on_hold';
  applicants: number;
  deadline: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Quản trị viên',
  HR: 'Nhân sự',
  MANAGER_TECH: 'Trưởng phòng',
  FINANCE: 'Tài chính',
  EMPLOYEE: 'Nhân viên',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-primary text-primary-foreground',
  HR: 'bg-info text-info-foreground',
  MANAGER_TECH: 'bg-warning text-warning-foreground',
  FINANCE: 'bg-success text-success-foreground',
  EMPLOYEE: 'bg-secondary text-secondary-foreground',
};
