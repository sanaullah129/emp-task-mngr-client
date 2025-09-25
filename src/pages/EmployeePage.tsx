import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Box,
  Chip
} from '@mui/material';
import { Add, Edit, Delete, Email, Work, Business } from '@mui/icons-material';
import { apiService } from '../services/api';
import type { Employee, CreateEmployee } from '../services/api';

interface EmployeeFormData {
  name: string;
  email: string;
  department: string;
  position: string;
}

export const EmployeePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    department: '',
    position: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<EmployeeFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployees();
      setEmployees(data);
      setError('');
    } catch (error: any) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<EmployeeFormData> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.department.trim()) errors.department = 'Department is required';
    if (!formData.position.trim()) errors.position = 'Position is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setFormData({ name: '', email: '', department: '', position: '' });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      return;
    }

    try {
      await apiService.deleteEmployee(employee.id);
      setEmployees(employees.filter(emp => emp.id !== employee.id));
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to delete employee');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingEmployee) {
        // Update existing employee
        const updated = await apiService.updateEmployee(editingEmployee.id, formData);
        setEmployees(employees.map(emp => 
          emp.id === editingEmployee.id ? updated : emp
        ));
      } else {
        // Create new employee
        const newEmployee = await apiService.createEmployee(formData as CreateEmployee);
        setEmployees([...employees, newEmployee]);
      }
      setDialogOpen(false);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to save employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Employees
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateEmployee}
        >
          Add Employee
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" 
        gap={3}
      >
        {employees.map((employee) => (
          <Card key={employee.id}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {employee.name}
                </Typography>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {employee.email}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <Business sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {employee.department}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <Work sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {employee.position}
                  </Typography>
                </Box>

                {employee.tasks && employee.tasks.length > 0 && (
                  <Chip
                    label={`${employee.tasks.length} task${employee.tasks.length === 1 ? '' : 's'}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </CardContent>
              
              <CardActions>
                <IconButton
                  onClick={() => handleEditEmployee(employee)}
                  color="primary"
                  title="Edit Employee"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteEmployee(employee)}
                  color="error"
                  title="Delete Employee"
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
        ))}
      </Box>

      {employees.length === 0 && !loading && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Click "Add Employee" to create your first employee record
          </Typography>
        </Box>
      )}

      {/* Create/Edit Employee Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
            disabled={submitting}
          />
          
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={submitting}
          />
          
          <TextField
            margin="dense"
            label="Department"
            fullWidth
            variant="outlined"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            error={!!formErrors.department}
            helperText={formErrors.department}
            disabled={submitting}
          />
          
          <TextField
            margin="dense"
            label="Position"
            fullWidth
            variant="outlined"
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            error={!!formErrors.position}
            helperText={formErrors.position}
            disabled={submitting}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : editingEmployee ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};