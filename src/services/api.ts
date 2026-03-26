// api.ts

// Define the API base URL
const BASE_URL = 'https://api.example.com';

// Function to fetch all employees
export const fetchEmployees = async () => {
    const response = await fetch(`${BASE_URL}/employees`);
    if (!response.ok) {
        throw new Error('Failed to fetch employees');
    }
    return response.json();
};

// Function to fetch an employee by ID
export const fetchEmployeeById = async (id) => {
    const response = await fetch(`${BASE_URL}/employees/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch employee with id ${id}`);
    }
    return response.json();
};

// Function to fetch all departments
export const fetchDepartments = async () => {
    const response = await fetch(`${BASE_URL}/departments`);
    if (!response.ok) {
        throw new Error('Failed to fetch departments');
    }
    return response.json();
};

// Function to fetch a department by ID
export const fetchDepartmentById = async (id) => {
    const response = await fetch(`${BASE_URL}/departments/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch department with id ${id}`);
    }
    return response.json();
};

// Export all functions for use in other parts of the application
export default {
    fetchEmployees,
    fetchEmployeeById,
    fetchDepartments,
    fetchDepartmentById,
};