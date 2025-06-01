import React from 'react';
import styled from 'styled-components';
import { FiSave } from 'react-icons/fi';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
`;

const TabTitle = styled.span`
  color: var(--color-text);
  font-size: 14px;
  font-weight: 600;
`;

const SaveButton = styled(FiSave)<{ disabled: boolean }>`
  font-size: 18px;
  color: ${props => props.disabled ? '#6a6a6a' : 'var(--color-text)'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: color 0.2s;

  &:hover {
    color: var(--color-success);
  }
`;

interface PaneHeaderProps {
  title: string;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}

const PaneHeader: React.FC<PaneHeaderProps> = ({ title, hasUnsavedChanges, onSave }) => {
  return (
    <HeaderContainer>
      <TabTitle>{title}</TabTitle>
      <SaveButton 
        disabled={!hasUnsavedChanges} 
        onClick={() => hasUnsavedChanges && onSave()}
        title={hasUnsavedChanges ? 'Save changes' : 'No changes to save'}
      />
    </HeaderContainer>
  );
};

export default PaneHeader;