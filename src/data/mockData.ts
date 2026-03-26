import type { Employee, Department, AttendanceRecord, PayrollRecord, KPIRecord, OvertimeRequest, LeaveRequest, FinanceTransaction, Recruitment, Contract } from '@/types/hrm';

export const departments: Department[] = [
  { id: '1', name: 'Phòng Kỹ thuật', managerId: '3', employeeCount: 25 },
  { id: '2', name: 'Phòng Nhân sự', managerId: '2', employeeCount: 8 },
  { id: '3', name: 'Phòng Tài chính', managerId: '4', employeeCount: 10 },
  { id: '4', name: 'Phòng Marketing', employeeCount: 12 },
  { id: '5', name: 'Phòng Kinh doanh', employeeCount: 18 },
];

export const employees: Employee[] = [
  { id: '1', userId: '5', fullName: 'Hoàng Văn Em', email: 'em@hrm.vn', phone: '0901234567', departmentId: '1', departmentName: 'Phòng Kỹ thuật', position: 'Developer', startDate: '2023-03-15', status: 'active', baseSalary: 18000000 },
  { id: '2', userId: '6', fullName: 'Nguyễn Thị Phương', email: 'phuong@hrm.vn', phone: '0912345678', departmentId: '1', departmentName: 'Phòng Kỹ thuật', position: 'Senior Developer', startDate: '2022-01-10', status: 'active', baseSalary: 25000000 },
  { id: '3', userId: '7', fullName: 'Trần Minh Đức', email: 'duc@hrm.vn', phone: '0923456789', departmentId: '2', departmentName: 'Phòng Nhân sự', position: 'HR Specialist', startDate: '2023-06-01', status: 'active', baseSalary: 15000000 },
  { id: '4', userId: '8', fullName: 'Lê Thị Hương', email: 'huong@hrm.vn', phone: '0934567890', departmentId: '3', departmentName: 'Phòng Tài chính', position: 'Accountant', startDate: '2021-09-20', status: 'active', baseSalary: 16000000 },
  { id: '5', userId: '9', fullName: 'Phạm Quốc Bảo', email: 'bao@hrm.vn', phone: '0945678901', departmentId: '4', departmentName: 'Phòng Marketing', position: 'Marketing Lead', startDate: '2022-11-05', status: 'active', baseSalary: 20000000 },
  { id: '6', userId: '10', fullName: 'Vũ Thị Mai', email: 'mai@hrm.vn', phone: '0956789012', departmentId: '5', departmentName: 'Phòng Kinh doanh', position: 'Sales Manager', startDate: '2021-04-12', status: 'on_leave', baseSalary: 22000000 },
  { id: '7', userId: '11', fullName: 'Đỗ Văn Tùng', email: 'tung@hrm.vn', phone: '0967890123', departmentId: '1', departmentName: 'Phòng Kỹ thuật', position: 'QA Engineer', startDate: '2023-08-20', status: 'active', baseSalary: 14000000 },
  { id: '8', userId: '12', fullName: 'Bùi Thị Lan', email: 'lan@hrm.vn', phone: '0978901234', departmentId: '1', departmentName: 'Phòng Kỹ thuật', position: 'UI/UX Designer', startDate: '2022-07-15', status: 'active', baseSalary: 17000000 },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: '1', employeeId: '1', employeeName: 'Hoàng Văn Em', date: '2026-03-04', checkIn: '08:05', checkOut: '17:30', workHours: 9.42, overtimeHours: 1.42, status: 'on_time' },
  { id: '2', employeeId: '2', employeeName: 'Nguyễn Thị Phương', date: '2026-03-04', checkIn: '08:35', checkOut: '18:00', workHours: 9.42, overtimeHours: 1.42, status: 'late' },
  { id: '3', employeeId: '3', employeeName: 'Trần Minh Đức', date: '2026-03-04', checkIn: '07:55', checkOut: '17:00', workHours: 9.08, overtimeHours: 1.08, status: 'on_time' },
  { id: '4', employeeId: '4', employeeName: 'Lê Thị Hương', date: '2026-03-04', checkIn: '08:00', checkOut: '17:00', workHours: 9, overtimeHours: 1, status: 'on_time' },
  { id: '5', employeeId: '5', employeeName: 'Phạm Quốc Bảo', date: '2026-03-04', checkIn: null, checkOut: null, workHours: 0, overtimeHours: 0, status: 'absent' },
];

export const payrollRecords: PayrollRecord[] = [
  { id: '1', employeeId: '1', employeeName: 'Hoàng Văn Em', month: 2, year: 2026, baseSalary: 18000000, allowance: 2000000, bonus: 1000000, overtimePay: 1500000, taxDeduction: 1800000, insuranceDeduction: 1890000, netSalary: 18810000, status: 'approved' },
  { id: '2', employeeId: '2', employeeName: 'Nguyễn Thị Phương', month: 2, year: 2026, baseSalary: 25000000, allowance: 3000000, bonus: 2000000, overtimePay: 2500000, taxDeduction: 3200000, insuranceDeduction: 2625000, netSalary: 26675000, status: 'paid' },
  { id: '3', employeeId: '3', employeeName: 'Trần Minh Đức', month: 2, year: 2026, baseSalary: 15000000, allowance: 1500000, bonus: 500000, overtimePay: 800000, taxDeduction: 1200000, insuranceDeduction: 1575000, netSalary: 15025000, status: 'draft' },
];

export const kpiRecords: KPIRecord[] = [
  { id: '1', employeeId: '1', employeeName: 'Hoàng Văn Em', month: 2, year: 2026, score: 85, comment: 'Hoàn thành tốt công việc, cần cải thiện kỹ năng giao tiếp', evaluatedBy: 'Lê Văn Cường' },
  { id: '2', employeeId: '2', employeeName: 'Nguyễn Thị Phương', month: 2, year: 2026, score: 92, comment: 'Xuất sắc, chủ động và sáng tạo', evaluatedBy: 'Lê Văn Cường' },
  { id: '3', employeeId: '7', employeeName: 'Đỗ Văn Tùng', month: 2, year: 2026, score: 78, comment: 'Cần cải thiện tốc độ xử lý task', evaluatedBy: 'Lê Văn Cường' },
];

export const overtimeRequests: OvertimeRequest[] = [
  { id: '1', employeeId: '1', employeeName: 'Hoàng Văn Em', date: '2026-03-05', hours: 3, reason: 'Hoàn thành deadline dự án', status: 'pending' },
  { id: '2', employeeId: '2', employeeName: 'Nguyễn Thị Phương', date: '2026-03-03', hours: 2, reason: 'Fix bug khẩn cấp', status: 'approved', approvedBy: 'Lê Văn Cường' },
];

export const leaveRequests: LeaveRequest[] = [
  { id: '1', employeeId: '6', employeeName: 'Vũ Thị Mai', type: 'annual', startDate: '2026-03-01', endDate: '2026-03-07', reason: 'Nghỉ phép năm', status: 'approved' },
  { id: '2', employeeId: '1', employeeName: 'Hoàng Văn Em', type: 'sick', startDate: '2026-03-10', endDate: '2026-03-11', reason: 'Bị ốm', status: 'pending' },
];

export const financeTransactions: FinanceTransaction[] = [
  { id: '1', type: 'expense', category: 'Lương', amount: 350000000, description: 'Chi lương tháng 02/2026', date: '2026-03-05', createdBy: 'Phạm Thị Dung' },
  { id: '2', type: 'expense', category: 'Văn phòng phẩm', amount: 5000000, description: 'Mua VPP tháng 3', date: '2026-03-01', createdBy: 'Phạm Thị Dung' },
  { id: '3', type: 'income', category: 'Doanh thu', amount: 800000000, description: 'Doanh thu dự án ABC', date: '2026-02-28', createdBy: 'Phạm Thị Dung' },
  { id: '4', type: 'expense', category: 'BHXH', amount: 45000000, description: 'Đóng BHXH tháng 02', date: '2026-03-10', createdBy: 'Phạm Thị Dung' },
];

export const contracts: Contract[] = [
  { id: '1', employeeId: '1', employeeName: 'Hoàng Văn Em', type: 'fixed_term', startDate: '2023-03-15', endDate: '2025-03-15', salary: 18000000, status: 'pending_renewal', signedDate: '2023-03-10' },
  { id: '2', employeeId: '2', employeeName: 'Nguyễn Thị Phương', type: 'indefinite', startDate: '2022-01-10', endDate: null, salary: 25000000, status: 'active', signedDate: '2022-01-05' },
  { id: '3', employeeId: '3', employeeName: 'Trần Minh Đức', type: 'fixed_term', startDate: '2023-06-01', endDate: '2025-06-01', salary: 15000000, status: 'active', signedDate: '2023-05-28' },
  { id: '4', employeeId: '4', employeeName: 'Lê Thị Hương', type: 'indefinite', startDate: '2021-09-20', endDate: null, salary: 16000000, status: 'active', signedDate: '2021-09-15' },
  { id: '5', employeeId: '5', employeeName: 'Phạm Quốc Bảo', type: 'probation', startDate: '2026-01-01', endDate: '2026-03-31', salary: 12000000, status: 'active', signedDate: '2025-12-28' },
  { id: '6', employeeId: '6', employeeName: 'Vũ Thị Mai', type: 'fixed_term', startDate: '2021-04-12', endDate: '2024-04-12', salary: 22000000, status: 'expired', signedDate: '2021-04-10' },
  { id: '7', employeeId: '7', employeeName: 'Đỗ Văn Tùng', type: 'probation', startDate: '2023-08-20', endDate: '2023-10-20', salary: 10000000, status: 'terminated', signedDate: '2023-08-18', notes: 'Chuyển sang HĐ chính thức' },
  { id: '8', employeeId: '8', employeeName: 'Bùi Thị Lan', type: 'fixed_term', startDate: '2022-07-15', endDate: '2025-07-15', salary: 17000000, status: 'active', signedDate: '2022-07-10' },
];

export const recruitments: Recruitment[] = [
  { id: '1', title: 'Senior React Developer', department: 'Phòng Kỹ thuật', positions: 2, status: 'open', applicants: 15, deadline: '2026-03-31' },
  { id: '2', title: 'Marketing Executive', department: 'Phòng Marketing', positions: 1, status: 'open', applicants: 8, deadline: '2026-04-15' },
  { id: '3', title: 'Kế toán viên', department: 'Phòng Tài chính', positions: 1, status: 'closed', applicants: 12, deadline: '2026-02-28' },
];

export const dashboardStats = {
  totalEmployees: 73,
  totalDepartments: 5,
  totalPayroll: 1250000000,
  newHires: 4,
  onLeave: 3,
  lateToday: 2,
  pendingOT: 5,
  totalIncome: 2400000000,
  totalExpense: 1600000000,
  monthlyPayrollData: [
    { month: 'T9', amount: 1100 },
    { month: 'T10', amount: 1150 },
    { month: 'T11', amount: 1180 },
    { month: 'T12', amount: 1250 },
    { month: 'T1', amount: 1200 },
    { month: 'T2', amount: 1250 },
  ],
  departmentDistribution: [
    { name: 'Kỹ thuật', value: 25 },
    { name: 'Nhân sự', value: 8 },
    { name: 'Tài chính', value: 10 },
    { name: 'Marketing', value: 12 },
    { name: 'Kinh doanh', value: 18 },
  ],
  // Admin/HR: recruitment pipeline
  recruitmentPipeline: [
    { stage: 'Ứng tuyển', count: 45 },
    { stage: 'Sàng lọc', count: 28 },
    { stage: 'Phỏng vấn', count: 15 },
    { stage: 'Offer', count: 6 },
    { stage: 'Nhận việc', count: 4 },
  ],
  // Admin/HR: attendance summary this week
  attendanceSummary: [
    { day: 'T2', onTime: 65, late: 5, absent: 3 },
    { day: 'T3', onTime: 63, late: 7, absent: 3 },
    { day: 'T4', onTime: 68, late: 3, absent: 2 },
    { day: 'T5', onTime: 66, late: 4, absent: 3 },
    { day: 'T6', onTime: 60, late: 8, absent: 5 },
  ],
  // Admin/HR: leave by type
  leaveByType: [
    { name: 'Phép năm', value: 12 },
    { name: 'Ốm', value: 5 },
    { name: 'Không lương', value: 3 },
    { name: 'Thai sản', value: 2 },
  ],
  // Admin/HR: contract status overview
  contractOverview: [
    { name: 'Đang hiệu lực', value: 58 },
    { name: 'Sắp hết hạn', value: 8 },
    { name: 'Đã hết hạn', value: 5 },
    { name: 'Thử việc', value: 2 },
  ],
  // Finance: income vs expense monthly
  incomeExpenseMonthly: [
    { month: 'T9', income: 750, expense: 520 },
    { month: 'T10', income: 820, expense: 550 },
    { month: 'T11', income: 780, expense: 530 },
    { month: 'T12', income: 900, expense: 600 },
    { month: 'T1', income: 850, expense: 580 },
    { month: 'T2', income: 800, expense: 560 },
  ],
  // Finance: expense breakdown
  expenseBreakdown: [
    { name: 'Lương', value: 350 },
    { name: 'BHXH', value: 45 },
    { name: 'Vận hành', value: 30 },
    { name: 'Marketing', value: 25 },
    { name: 'Khác', value: 15 },
  ],
  // Manager: team KPI
  teamKPI: [
    { name: 'Hoàng Văn Em', score: 85 },
    { name: 'Nguyễn T. Phương', score: 92 },
    { name: 'Đỗ Văn Tùng', score: 78 },
    { name: 'Bùi Thị Lan', score: 88 },
    { name: 'Trần Quang Huy', score: 72 },
  ],
  // Manager: team attendance this week
  teamAttendance: [
    { day: 'T2', onTime: 22, late: 2, absent: 1 },
    { day: 'T3', onTime: 23, late: 1, absent: 1 },
    { day: 'T4', onTime: 24, late: 1, absent: 0 },
    { day: 'T5', onTime: 21, late: 3, absent: 1 },
    { day: 'T6', onTime: 20, late: 4, absent: 1 },
  ],
  // Employee: personal salary history
  personalSalaryHistory: [
    { month: 'T9', net: 17.5 },
    { month: 'T10', net: 18.2 },
    { month: 'T11', net: 17.8 },
    { month: 'T12', net: 19.5 },
    { month: 'T1', net: 18.0 },
    { month: 'T2', net: 18.8 },
  ],
  // Employee: personal KPI trend
  personalKPI: [
    { month: 'T9', score: 80 },
    { month: 'T10', score: 82 },
    { month: 'T11', score: 78 },
    { month: 'T12', score: 88 },
    { month: 'T1', score: 83 },
    { month: 'T2', score: 85 },
  ],
  // Employee: personal attendance this month
  personalAttendance: { onTime: 18, late: 1, absent: 1, totalDays: 20 },
};
