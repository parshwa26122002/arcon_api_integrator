import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--color-panel);
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h2`
  color: var(--color-text);
  margin: 0;
  font-size: 18px;
`;

const Message = styled.p`
  color: var(--color-text);
  margin: 0;
  font-size: 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background-color: ${props => props.primary ? 'var(--color-tab-active)' : 'var(--color-panel-alt)'};
  color: var(--color-text);
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--color-button-hover)' : 'var(--color-border)'};
  }
`;

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDiscard
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Title>Unsaved Changes</Title>
        <Message>
          You have unsaved changes. Would you like to save them before closing?
        </Message>
        <ButtonContainer>
          <Button onClick={onDiscard}>Don't Save</Button>
          <Button onClick={onClose}>Cancel</Button>
          <Button primary onClick={onSave}>Save</Button>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UnsavedChangesModal;