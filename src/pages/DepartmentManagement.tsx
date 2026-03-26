import React, { useState, useEffect } from 'react';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [newDepartment, setNewDepartment] = useState('');
    const [editDepartmentId, setEditDepartmentId] = useState(null);
    const [editDepartmentName, setEditDepartmentName] = useState('');

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        // Fetch departments from API (replace with your API endpoint)
        const response = await fetch('/api/departments');
        const data = await response.json();
        setDepartments(data);
    };

    const createDepartment = async () => {
        // Create a new department
        await fetch('/api/departments', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: newDepartment }),
        });
        setNewDepartment('');
        fetchDepartments();
    };

    const updateDepartment = async () => {
        // Update an existing department
        await fetch(`/api/departments/${editDepartmentId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: editDepartmentName }),
        });
        setEditDepartmentId(null);
        setEditDepartmentName('');
        fetchDepartments();
    };

    const deleteDepartment = async (id) => {
        // Delete a department
        await fetch(`/api/departments/${id}`, {
            method: 'DELETE',
        });
        fetchDepartments();
    };

    return (
        <div>
            <h1>Department Management</h1>
            <div>
                <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="New Department Name"
                />
                <button onClick={createDepartment}>Create Department</button>
            </div>
            <div>
                <ul>
                    {departments.map((department) => (
                        <li key={department.id}>
                            {editDepartmentId === department.id ? (
                                <input
                                    type="text"
                                    value={editDepartmentName}
                                    onChange={(e) => setEditDepartmentName(e.target.value)}
                                />
                            ) : (
                                <span>{department.name}</span>
                            )}
                            {editDepartmentId === department.id ? (
                                <button onClick={updateDepartment}>Update</button>
                            ) : (
                                <button onClick={() => {
                                    setEditDepartmentId(department.id);
                                    setEditDepartmentName(department.name);
                                }}>Edit</button>
                            )}
                            <button onClick={() => deleteDepartment(department.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DepartmentManagement;