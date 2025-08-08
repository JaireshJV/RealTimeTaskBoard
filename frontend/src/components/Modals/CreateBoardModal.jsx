import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBoard } from '../../store/slices/boardSlice';
import { closeModal, addNotification } from '../../store/slices/uiSlice';
import { X, Palette } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const CreateBoardModal = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.board);
  const { selectedWorkspace } = useSelector(state => state.ui);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    background: '#FFFFFF'
  });

  const [validationErrors, setValidationErrors] = useState({});

  const colors = [
    '#FFFFFF', '#F1F5F9', '#FEF2F2', '#ECFDF5', '#FFFBEB',
    '#EEF2FF', '#FAE8FF', '#F0FDFA', '#FFF7ED'
  ];

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Board name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Board name must be less than 100 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!selectedWorkspace) {
      setValidationErrors(prev => ({ ...prev, name: 'No workspace selected' }));
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      background: formData.background,
      workspace: selectedWorkspace,
    };

    const result = await dispatch(createBoard(payload));

    if (createBoard.fulfilled.match(result)) {
      dispatch(addNotification({ type: 'success', message: 'Board created successfully!' }));
      dispatch(closeModal({ modalName: 'createBoard' }));
      setFormData({ name: '', description: '', background: '#FFFFFF' });
    }
  };

  const handleClose = () => {
    dispatch(closeModal({ modalName: 'createBoard' }));
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Board</h2>
            <button onClick={handleClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Board Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                placeholder="Enter board name"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
              />
              {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="input resize-none"
                placeholder="Describe your board"
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, background: color }))}
                    className={`w-8 h-8 rounded-md border-2 transition-all ${
                      formData.background === color ? 'border-gray-900 scale-110' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={handleClose} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary flex items-center">
                {loading ? <LoadingSpinner size="sm" className="text-white mr-2" /> : <Palette className="h-4 w-4 mr-2" />}
                Create Board
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal; 