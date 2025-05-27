import React from 'react';
import styled from 'styled-components';
import { FiSave } from 'react-icons/fi';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #2d2d2d;
  border-bottom: 1px solid #4a4a4a;
`;

const TabTitle = styled.span`
  color: #e1e1e1;
  font-size: 14px;
  font-weight: 600;
`;

const SaveButton = styled(FiSave)<{ disabled: boolean }>`
  font-size: 18px;
  color: ${props => props.disabled ? '#6a6a6a' : '#e1e1e1'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: color 0.2s;

  &:hover {
    color: ${props => props.disabled ? '#6a6a6a' : '#49cc90'};
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