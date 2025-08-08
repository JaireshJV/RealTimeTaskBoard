import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { fetchBoard } from '../../store/slices/boardSlice';
import { fetchCards, moveCardOptimistic } from '../../store/slices/cardSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { Plus, Settings, Users, Filter } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Board = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const { currentBoard, loading: boardLoading } = useSelector(state => state.board);
  const { cards, loading: cardsLoading } = useSelector(state => state.card);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
      dispatch(fetchCards({ boardId }));
    }
  }, [dispatch, boardId]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result) => {
    setIsDragging(false);
    
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) {
      return;
    }

    // Optimistic update
    dispatch(moveCardOptimistic({
      cardId: draggableId,
      sourceListId: source.droppableId,
      destinationListId: destination.droppableId,
      sourceIndex: source.index,
      destinationIndex: destination.index
    }));

    // TODO: Call API to update card position
    dispatch(addNotification({ 
      type: 'info', 
      message: 'Card moved! Real-time updates coming soon.' 
    }));
  };

  const handleCreateCard = (listId) => {
    dispatch(addNotification({ 
      type: 'info', 
      message: 'Create card functionality coming soon!' 
    }));
  };

  const handleCreateList = () => {
    dispatch(addNotification({ 
      type: 'info', 
      message: 'Create list functionality coming soon!' 
    }));
  };

  const handleCardClick = (cardId) => {
    dispatch(addNotification({ 
      type: 'info', 
      message: 'Card details modal coming soon!' 
    }));
  };

  if (boardLoading || cardsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Board not found</h2>
          <p className="text-gray-600 mb-4">
            The board you're looking for doesn't exist or you don't have access to it.
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-gray-400 hover:text-gray-600"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentBoard.name}
              </h1>
              <p className="text-gray-600 text-sm">
                {currentBoard.description || 'No description'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Filter"
            >
              <Filter className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Members"
            >
              <Users className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Board Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex space-x-6 h-full">
            {currentBoard.lists?.map((list) => (
              <div key={list._id} className="flex-shrink-0 w-80">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                  {/* List Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: list.color }}
                        />
                        <h3 className="font-medium text-gray-900">{list.name}</h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {cards[list._id]?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <Droppable droppableId={list._id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2 overflow-y-auto ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {cards[list._id]?.map((card, index) => (
                          <Draggable
                            key={card._id}
                            draggableId={card._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleCardClick(card._id)}
                                className={`mb-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                              >
                                <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                  {card.title}
                                </h4>
                                {card.description && (
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {card.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  {card.dueDate && (
                                    <span>
                                      Due {new Date(card.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  {card.priority && (
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      card.priority === 'high' ? 'bg-red-100 text-red-700' :
                                      card.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      {card.priority}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Add Card Button */}
                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={() => handleCreateCard(list._id)}
                      className="w-full flex items-center justify-center py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Card
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add List Button */}
            <div className="flex-shrink-0 w-80">
              <button
                onClick={handleCreateList}
                className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors"
              >
                <Plus className="h-6 w-6 mr-2" />
                Add List
              </button>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Board; 