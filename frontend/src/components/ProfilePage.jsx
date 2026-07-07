import React, { useState } from 'react';
import api from '../api';

export default function ProfilePage({ user, setUser, navigate, setStatus }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [photo, setPhoto] = useState(user?.photo || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setErrorMsg('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result); // Base64 encoding
      setErrorMsg('');
      setSuccessMsg('');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    document.getElementById('avatar-file-input').click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await api.put('/auth/profile', {
        ...formData,
        photo,
      });

      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccessMsg('Profile updated successfully!');
      setStatus('Profile updated');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setErrorMsg(msg);
      setStatus('Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button type="button" className="ghost-btn back-btn" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
        <h2>Account Settings</h2>
      </div>

      <div className="profile-grid">
        {/* Sidebar avatar card */}
        <div className="card profile-sidebar-card">
          <div className="avatar-upload-container" onClick={triggerFileInput}>
            {photo ? (
              <img src={photo} alt="Avatar Preview" className="profile-large-avatar" />
            ) : (
              <div className="profile-large-avatar-placeholder">
                {formData.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="avatar-overlay">
              <span className="camera-icon">📷</span>
              <span className="overlay-text">Change Photo</span>
            </div>
          </div>
          
          <input
            type="file"
            id="avatar-file-input"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div className="profile-sidebar-info">
            <h3 className="profile-display-username">{formData.username || 'Username'}</h3>
            <p className="profile-display-email">{formData.email || 'Email address'}</p>
          </div>
          
          <p className="avatar-hint-text">Click the photo circle to upload a custom avatar.</p>
        </div>

        {/* Edit profile details card */}
        <div className="card profile-form-card">
          <p className="eyebrow">Personal Information</p>
          <h3>Edit details</h3>

          <form onSubmit={handleSave} className="stack">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter new username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. +1 555-0199"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g. 123 University Ave"
              />
            </div>

            {errorMsg && <p className="error-message">{errorMsg}</p>}
            {successMsg && <p className="success-message">{successMsg}</p>}

            <button type="submit" disabled={loading} className="save-profile-btn">
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
