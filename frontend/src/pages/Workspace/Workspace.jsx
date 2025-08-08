import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWorkspace } from '../../store/slices/workspaceSlice';
import { addNotification, openModal, setSelectedWorkspace } from '../../store/slices/uiSlice';
import { Plus, Settings, Users, Grid, Calendar } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Workspace = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { currentWorkspace, loading } = useSelector(state => state.workspace);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspace(workspaceId));
      dispatch(setSelectedWorkspace(workspaceId));
    }
  }, [dispatch, workspaceId]);

  const handleCreateBoard = () => {
    dispatch(setSelectedWorkspace(workspaceId));
    dispatch(openModal({ modalName: 'createBoard' }));
  };

  const handleBoardClick = (boardId) => {
    navigate(`/board/${boardId}`);
  };

  const handleSettings = () => {
    dispatch(addNotification({ 
      type: 'info', 
      message: 'Workspace settings coming soon!' 
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Workspace not found</h2>
          <p className="text-gray-600 mb-4">
            The workspace you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className="w-8 h-8 rounded-lg mr-4"
              style={{ backgroundColor: currentWorkspace.color }}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentWorkspace.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentWorkspace.description || 'No description'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSettings}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Workspace Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate(`/workspace/${workspaceId}/members`)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Manage Members"
            >
              <Users className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Grid className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Boards</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentWorkspace.boards?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentWorkspace.members?.length || 1}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Created</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(currentWorkspace.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Boards Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Boards</h2>
          <button
            onClick={handleCreateBoard}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Board
          </button>
        </div>

        {currentWorkspace.boards?.length === 0 ? (
          <div className="text-center py-12">
            <Grid className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No boards yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first board to start organizing tasks and projects.
            </p>
            <button
              onClick={handleCreateBoard}
              className="btn btn-primary"
            >
              Create Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentWorkspace.boards?.map((board) => (
              <div
                key={board._id}
                onClick={() => handleBoardClick(board._id)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 truncate">
                    {board.name}
                  </h3>
                  {board.isArchived && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Archived
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {board.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(board.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Members</h2>
          <button
            onClick={() => navigate(`/workspace/${workspaceId}/members`)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Manage Members
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentWorkspace.members?.map((member) => (
            <div key={member.user._id} className="flex items-center p-3 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-gray-700">
                  {member.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{member.user.username}</p>
                <p className="text-sm text-gray-600 capitalize">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workspace; 