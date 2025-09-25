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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Add, Edit, Delete, Person, CheckCircle, Schedule, PlayArrow } from '@mui/icons-material';
import dayjs from 'dayjs';
import { apiService } from '../services/api';
import type { Task, Employee, CreateTask } from '../services/api';
import type { Dayjs } from 'dayjs';

interface TaskFormData {
  title: string;
  description: string;
  employee_id: number | '';
  due_date: Dayjs | null;
}

export const TaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    employee_id: '',
    due_date: null,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchTasks(), fetchEmployees()]);
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await apiService.getTasks();
      setTasks(data);
      setError('');
    } catch (error: any) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployees();
      setEmployees(data);
    } catch (error: any) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof TaskFormData, string>> = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getStatusColor = (status: Task['status']): 'default' | 'warning' | 'info' | 'success' => {
    switch (status) {
      case 'pending': return 'default';
      case 'ongoing': return 'info';
      case 'completed': return 'success';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'ongoing': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', employee_id: '', due_date: null });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      employee_id: task.employee_id || '',
      due_date: task.due_date ? dayjs(task.due_date) : null,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    try {
      await apiService.deleteTask(task.id);
      setTasks(tasks.filter(t => t.id !== task.id));
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to delete task');
    }
  };

  const handleStatusUpdate = async (task: Task, newStatus: Task['status']) => {
    try {
      const updated = await apiService.updateTask(task.id, { status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? updated : t));
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to update task status');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const taskData: CreateTask = {
        title: formData.title,
        description: formData.description || undefined,
        employee_id: formData.employee_id || undefined,
        due_date: formData.due_date ? formData.due_date.toISOString() : undefined,
      };

      if (editingTask) {
        const updated = await apiService.updateTask(editingTask.id, taskData);
        setTasks(tasks.map(t => t.id === editingTask.id ? updated : t));
      } else {
        const newTask = await apiService.createTask(taskData);
        setTasks([...tasks, newTask]);
      }
      setDialogOpen(false);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isOverdue = (dueDate: string) => {
    return dayjs(dueDate).isBefore(dayjs()) && dayjs(dueDate).isValid();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTask}
        >
          Add Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box 
        display="grid" 
        gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))" 
        gap={3}
      >
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="h6" component="h2" flex={1}>
                  {task.title}
                </Typography>
                <Chip
                  label={task.status}
                  color={getStatusColor(task.status)}
                  icon={getStatusIcon(task.status)}
                  size="small"
                />
              </Box>
              
              {task.description && (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {task.description}
                </Typography>
              )}
              
              {task.employee && (
                <Box display="flex" alignItems="center" mb={1}>
                  <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {task.employee.name} ({task.employee.department})
                  </Typography>
                </Box>
              )}
              
              {task.due_date && (
                <Box display="flex" alignItems="center" mb={2}>
                  <Schedule sx={{ mr: 1, color: isOverdue(task.due_date) ? 'error.main' : 'text.secondary' }} />
                  <Typography 
                    variant="body2" 
                    color={isOverdue(task.due_date) ? 'error.main' : 'text.secondary'}
                  >
                    Due: {dayjs(task.due_date).format('MMM DD, YYYY HH:mm')}
                    {isOverdue(task.due_date) && ' (Overdue)'}
                  </Typography>
                </Box>
              )}

              {task.status !== 'completed' && (
                <Stack direction="row" spacing={1} mb={2}>
                  {task.status === 'pending' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusUpdate(task, 'ongoing')}
                    >
                      Start
                    </Button>
                  )}
                  {task.status === 'ongoing' && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleStatusUpdate(task, 'completed')}
                    >
                      Complete
                    </Button>
                  )}
                  {task.status === 'ongoing' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusUpdate(task, 'pending')}
                    >
                      Reset
                    </Button>
                  )}
                </Stack>
              )}
            </CardContent>
            
            <CardActions>
              <IconButton
                onClick={() => handleEditTask(task)}
                color="primary"
                title="Edit Task"
              >
                <Edit />
              </IconButton>
              <IconButton
                onClick={() => handleDeleteTask(task)}
                color="error"
                title="Delete Task"
              >
                <Delete />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {tasks.length === 0 && !loading && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Click "Add Task" to create your first task
          </Typography>
        </Box>
      )}

      {/* Create/Edit Task Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={!!formErrors.title}
            helperText={formErrors.title}
            disabled={submitting}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={submitting}
          />
          
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Assign to Employee</InputLabel>
            <Select
              value={formData.employee_id}
              onChange={(e) => handleInputChange('employee_id', e.target.value)}
              label="Assign to Employee"
              disabled={submitting}
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name} - {employee.position}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <DateTimePicker
            label="Due Date"
            value={formData.due_date}
            onChange={(date) => handleInputChange('due_date', date)}
            disabled={submitting}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: 'dense',
                variant: 'outlined',
              },
            }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};