import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FiTrash2 } from 'react-icons/fi';

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: var(--color-error);
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  width: 100%;
  text-align: left;

  &:hover {
    background-color: var(--color-panel-alt);
  }

  svg {
    font-size: 12px;
  }
`;

const ConfirmationDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const DialogContent = styled.div`
  background-color: var(--color-panel);
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  border: 1px solid var(--color-border);
`;

const DialogHeader = styled.div`
  margin-bottom: 16px;
  
  h2 {
    margin: 0;
    color: var(--color-text);
    font-size: 16px;
  }
`;

const DialogMessage = styled.p`
  color: var(--color-text);
  margin: 0 0 20px 0;
  font-size: 14px;
`;

const DialogButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button<{ $danger?: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.$danger ? 'var(--color-error)' : 'var(--color-panel-alt)'};
  color: var(--color-text);
  border: 1px solid ${props => props.$danger ? 'var(--color-error)' : 'var(--color-border)'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: ${props => props.$danger ? '#ff6666' : 'var(--color-border)'};
  }
`;

interface DeleteCollectionProps {
  collectionName: string;
  onConfirm: () => void;
  onCancel: () => void;
  menuItem?: boolean;
}

const DeleteCollection: React.FC<DeleteCollectionProps> = ({
  collectionName,
  onConfirm,
  onCancel,
  menuItem = true
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmation(true);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
    setShowConfirmation(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
    setShowConfirmation(false);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      handleCancel(e);
    }
  };

  return (
    <>
      {menuItem ? (
        <DeleteButton onClick={handleDelete}>
          <FiTrash2 size={14} />
          Delete
        </DeleteButton>
      ) : (
        <Button $danger onClick={handleDelete}>
          <FiTrash2 size={14} />
          Delete Collection
        </Button>
      )}

      {showConfirmation && (
        <ConfirmationDialog onClick={handleClickOutside}>
          <DialogContent ref={dialogRef}>
            <DialogHeader>
              <h2>Delete Collection</h2>
            </DialogHeader>
            <DialogMessage>
              Are you sure you want to delete "{collectionName}"? This action cannot be undone.
            </DialogMessage>
            <DialogButtons>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button $danger onClick={handleConfirm}>Delete</Button>
            </DialogButtons>
          </DialogContent>
        </ConfirmationDialog>
      )}
    </>
  );
};

export default DeleteCollection;