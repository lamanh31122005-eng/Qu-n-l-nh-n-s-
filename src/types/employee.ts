export type EmployeeGender = 'male' | 'female' | 'other';

export type EmployeeMaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export type EmployeeEducationLevel = 'high school' | 'bachelor' | 'master' | 'doctorate' | 'other';

export interface EmployeeProfileData {
  employeeId: string;

  // Thông tin cơ bản
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: EmployeeGender;
  idCard: string;

  // Địa chỉ thường trú + tạm trú
  permanentAddress: string;
  temporaryAddress: string;

  // SĐT + liên hệ khẩn cấp
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  // Email cá nhân + công ty
  personalEmail: string;
  companyEmail: string;

  // Công việc
  departmentId: string;
  position: string;
  startDate: string; // YYYY-MM-DD

  // Trình độ học vấn + tình trạng hôn nhân
  educationLevel: EmployeeEducationLevel;
  maritalStatus: EmployeeMaritalStatus;
}