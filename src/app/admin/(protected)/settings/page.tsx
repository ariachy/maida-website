'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  isPrimary: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Profile form
  const [name, setName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/admin/auth/session');
        const data = await res.json();
        
        if (data.success) {
          setUser(data.user);
          setName(data.user.name || '');
        }
      } catch {
        console.error('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    
    try {
      const res = await fetch(`/api/admin/users/${user?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error);
      }
    } catch {
      setPasswordError('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setProfileLoading(true);
    
    try {
      const res = await fetch(`/api/admin/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setProfileSuccess(true);
        setUser(data.user);
      } else {
        setProfileError(data.error);
      }
    } catch {
      setProfileError('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C45C26]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and change your password
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Profile</h2>
        </div>
        <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
          {profileError && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700">
              Profile updated successfully
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45C26] focus:border-transparent"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="flex items-center gap-2">
              {user?.isPrimary ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C45C26]/10 text-[#C45C26]">
                  Primary Admin
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Admin
                </span>
              )}
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-4 py-2 bg-[#C45C26] text-white rounded-lg hover:bg-[#A34E20] transition-colors disabled:opacity-50"
            >
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
          {passwordError && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700">
              Password changed successfully
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45C26] focus:border-transparent"
              required
            />
          </div>
          
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
              Min 8 characters with uppercase, lowercase, and number
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C45C26] focus:border-transparent"
              required
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 bg-[#C45C26] text-white rounded-lg hover:bg-[#A34E20] transition-colors disabled:opacity-50"
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow border border-red-200">
        <div className="px-6 py-4 border-b border-red-200 bg-red-50">
          <h2 className="text-lg font-medium text-red-800">Danger Zone</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Log out everywhere</h3>
              <p className="text-sm text-gray-500">
                End all active sessions on other devices
              </p>
            </div>
            <button
              onClick={async () => {
                if (confirm('This will log you out from all other devices. Continue?')) {
                  try {
                    // This would need a new API endpoint
                    const res = await fetch(`/api/admin/users/${user?.id}/sessions`, {
                      method: 'DELETE',
                    });
                    if (res.ok) {
                      alert('All other sessions have been logged out');
                    }
                  } catch {
                    alert('Failed to log out other sessions');
                  }
                }
              }}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Log out all devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
