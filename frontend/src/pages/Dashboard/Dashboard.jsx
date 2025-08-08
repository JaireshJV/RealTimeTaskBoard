import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWorkspaces } from '../../store/slices/workspaceSlice';
import { openModal } from '../../store/slices/uiSlice';
import { Plus, Grid, Users, Calendar, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { workspaces, loading } = useSelector(state => state.workspace);

  const [stats, setStats] = useState({
    totalWorkspaces: 0,
    totalBoards: 0,
    totalCards: 0,
    completedCards: 0
  });

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    // Calculate stats from workspaces
    if (workspaces.length > 0) {
      const totalBoards = workspaces.reduce((acc, workspace) => 
        acc + (workspace.boards?.length || 0), 0);
      
      setStats({
        totalWorkspaces: workspaces.length,
        totalBoards,
        totalCards: 0, // This would come from cards API
        completedCards: 0 // This would come from cards API
      });
    }
  }, [workspaces]);

  const handleCreateWorkspace = () => {
    dispatch(openModal({ modalName: 'createWorkspace' }));
  };

  const handleWorkspaceClick = (workspaceId) => {
    navigate(`/workspace/${workspaceId}`);
  };

  const recentWorkspaces = workspaces.slice(0, 4);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Grid className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Workspaces</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWorkspaces}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Boards</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBoards}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedCards}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleCreateWorkspace}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Workspace
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Users className="h-5 w-5 mr-2" />
            View Profile
          </button>
        </div>
      </div>

      {/* Recent Workspaces */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Workspaces</h2>
          <button
            onClick={() => navigate('/workspaces')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-8">
            <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first workspace to start organizing your projects.
            </p>
            <button
              onClick={handleCreateWorkspace}
              className="btn btn-primary"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentWorkspaces.map((workspace) => (
              <div
                key={workspace._id}
                onClick={() => handleWorkspaceClick(workspace._id)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center mb-3">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: workspace.color }}
                  />
                  <h3 className="font-medium text-gray-900 truncate">
                    {workspace.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {workspace.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{workspace.boards?.length || 0} boards</span>
                  <span>{workspace.members?.length || 1} members</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 