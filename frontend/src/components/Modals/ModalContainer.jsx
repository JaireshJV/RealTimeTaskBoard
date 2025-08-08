import React from 'react';
import { useSelector } from 'react-redux';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import CreateBoardModal from './CreateBoardModal';

const ModalContainer = () => {
  const { modals } = useSelector(state => state.ui);

  return (
    <>
      {modals.createWorkspace && <CreateWorkspaceModal />}
      {modals.createBoard && <CreateBoardModal />}
      {/* Add other modals here as they are implemented */}
    </>
  );
};

export default ModalContainer; 