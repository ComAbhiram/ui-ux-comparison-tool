import { useState, useMemo, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { User, UserRole } from '../types';

type SortField = 'name' | 'email' | 'role' | 'status';
type SortOrder = 'asc' | 'desc';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '' as UserRole | '',
    department: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive',
    password: '',
    confirmPassword: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '' as UserRole | '',
    department: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await usersAPI.getAll();
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

      const newUser = await usersAPI.create({
        name: formData.name,
        email: formData.email,
        role: formData.role as UserRole,
        password: formData.password,
        status: formData.status
      });

      // Add to users list
      setUsers(prev => [...prev, newUser]);

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        phone: '',
        status: 'Active',
        password: '',
        confirmPassword: ''
      });
      setShowAddModal(false);
      alert('User created successfully!');
    } catch (error: any) {
      alert(`Failed to create user: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert('User deleted successfully!');
    } catch (error: any) {
      alert(`Failed to delete user: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: '',
      phone: '',
      status: user.status
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    // Validation
    if (!editFormData.name || !editFormData.email || !editFormData.role) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const updatedUser = await usersAPI.update(selectedUser.id, {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role as UserRole,
        department: editFormData.department,
        phone: editFormData.phone,
        status: editFormData.status
      });

      // Update users list
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...updatedUser } : u));

      // Close modal and reset
      setShowEditModal(false);
      setSelectedUser(null);
      alert('User updated successfully!');
    } catch (error: any) {
      alert(`Failed to update user: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: 'Active' | 'Inactive') => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    try {
      await usersAPI.update(userId, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      alert(`User status updated to ${newStatus}!`);
    } catch (error: any) {
      alert(`Failed to update user status: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortOrder]);

  const getStatusColor = (status: string) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Developer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'QA':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-[#0e141b] dark:text-slate-50 text-3xl font-bold leading-tight tracking-tight">
            User Management
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
            Add, edit, and manage user accounts and permissions.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex min-w-[84px] items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
          <span className="truncate">Add User</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Developer">Developer</option>
          <option value="QA">QA</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
          Showing {filteredAndSortedUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="@container">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-soft">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th 
                  className="px-6 py-4 text-left text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-primary"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    User
                    {sortField === 'name' && (
                      <span className="material-symbols-outlined text-sm">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-primary"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">
                    Email
                    {sortField === 'email' && (
                      <span className="material-symbols-outlined text-sm">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-primary"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-1">
                    Role
                    {sortField === 'role' && (
                      <span className="material-symbols-outlined text-sm">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-primary"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortField === 'status' && (
                      <span className="material-symbols-outlined text-sm">
                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAndSortedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${user.avatar})` }}
                      ></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {user.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(
                        user.status
                      )}`}
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      title="Click to toggle status"
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{user.lastActive}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                        onClick={() => handleEditUser(user)}
                        title="Edit user"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button 
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        title="Delete user"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 flex items-center justify-center p-4 z-50" onClick={() => setShowAddModal(false)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] transform rounded-2xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add New User</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create a new user account for the system</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="full-name">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-white transition-all"
                    id="full-name"
                    name="name"
                    placeholder="Enter full name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-white transition-all"
                    id="email"
                    name="email"
                    placeholder="user@company.com"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-gray-200 transition-all"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="Admin">Admin</option>
                    <option value="QA">QA Tester</option>
                    <option value="Developer">Developer</option>
                  </select>
                </div>

                {/* Department */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="department">
                    Department
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-white transition-all"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g., Engineering, QA"
                    type="text"
                  />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-white transition-all"
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-gray-200 transition-all"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Security</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-white transition-all"
                      id="password"
                      name="password"
                      placeholder="Enter password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="confirm-password">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 h-11 px-4 text-sm text-gray-900 dark:text-white transition-all"
                      id="confirm-password"
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permissions</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-2 focus:ring-primary/20"
                      defaultChecked
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Can create projects</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Allow user to create new projects</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-2 focus:ring-primary/20"
                      defaultChecked
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Can report issues</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Allow user to report and track issues</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Can manage users</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Allow user to add, edit, or remove users</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => setShowAddModal(false)}
                type="button"
                className="px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                type="button"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 flex items-center justify-center p-4 z-50" onClick={() => setShowEditModal(false)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] transform rounded-2xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update user account information</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="QA">QA</option>
                    <option value="Developer">Developer</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={editFormData.department}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
