import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createWorkspace } from '../../store/slices/workspaceSlice';
import { closeModal, addNotification } from '../../store/slices/uiSlice';
import { X, Palette } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const CreateWorkspaceModal = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.workspace);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isPublic: false
  });

  const [validationErrors, setValidationErrors] = useState({});

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Workspace name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Workspace name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await dispatch(createWorkspace(formData));
    
    if (createWorkspace.fulfilled.match(result)) {
      dispatch(addNotification({ 
        type: 'success', 
        message: 'Workspace created successfully!' 
      }));
      dispatch(closeModal({ modalName: 'createWorkspace' }));
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        isPublic: false
      });
    }
  };

  const handleClose = () => {
    dispatch(closeModal({ modalName: 'createWorkspace' }));
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Workspace</h2>
            <button
              onClick={handleClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Workspace Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Workspace Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                placeholder="Enter workspace name"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="input resize-none"
                placeholder="Describe your workspace"
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workspace Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color 
                        ? 'border-gray-900 scale-110' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Public/Private Toggle */}
            <div className="flex items-center">
              <input
                id="isPublic"
                name="isPublic"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                Make this workspace public
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center"
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="text-white mr-2" />
                ) : (
                  <Palette className="h-4 w-4 mr-2" />
                )}
                Create Workspace
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal; 