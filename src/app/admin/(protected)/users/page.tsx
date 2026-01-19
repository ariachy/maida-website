'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  isPrimary: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<User | null>(null);
  
  // Form states
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    
    if (newUserPassword !== confirmPassword) {
      setActionError('Passwords do not match');
      return;
    }

    setActionLoading(true);
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName,
          password: newUserPassword,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setNewUserEmail('');
        setNewUserName('');
        setNewUserPassword('');
        setConfirmPassword('');
        fetchUsers();
      } else {
        setActionError(data.error);
      }
    } catch {
      setActionError('Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!showDeleteModal) return;
    
    setActionLoading(true);
    setActionError(null);
    
    try {
      const res = await fetch(`/api/admin/users/${showDeleteModal.id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowDeleteModal(null);
        fetchUsers();
      } else {
        setActionError(data.error);
      }
    } catch {
      setActionError('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal) return;
    
    setActionError(null);
    
    if (newPassword !== confirmNewPassword) {
      setActionError('Passwords do not match');
      return;
    }

    setActionLoading(true);
    
    try {
      const res = await fetch(`/api/admin/users/${showPasswordModal.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowPasswordModal(null);
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setActionError(data.error);
      }
    } catch {
      setActionError('Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C45C26]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage admin users who can access the admin panel
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-[#C45C26] text-white px-4 py-2 rounded-lg hover:bg-[#A34E20] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-[#C45C26]/10 flex items-center justify-center">
                        <span className="text-[#C45C26] font-medium">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || 'No name'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isPrimary ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C45C26]/10 text-[#C45C26]">
                      Primary Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Admin
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.lastLogin)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowPasswordModal(user)}
                      className="text-gray-600 hover:text-[#C45C26] p-1"
                      title="Reset Password"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </button>
                    {!user.isPrimary && (
                      <button
                        onClick={() => setShowDeleteModal(user)}
                        className="text-gray-600 hover:text-red-600 p-1"
                        title="Delete User"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create New Admin</h2>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="p-6 space-y-4">
                {actionError && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                    {actionError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45C26] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45C26] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45C26] focus:border-transparent"
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Min 8 chars, uppercase, lowercase, number
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45C26] focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setActionError(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#C45C26] text-white rounded-lg hover:bg-[#A34E20] transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Delete User</h2>
            </div>
            <div className="p-6">
              {actionError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{showDeleteModal.email}</strong>? 
                This will also delete all their active sessions.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => {
                  setShowDeleteModal(null);
                  setActionError(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Reset Password for {showPasswordModal.email}
              </h2>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="p-6 space-y-4">
                {actionError && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                    {actionError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45C26] focus:border-transparent"
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Min 8 chars, uppercase, lowercase, number
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45C26] focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                  ⚠️ This will log out the user from all devices
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(null);
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setActionError(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#C45C26] text-white rounded-lg hover:bg-[#A34E20] transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
