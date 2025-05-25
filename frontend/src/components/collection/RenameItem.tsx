import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';

const TreeItem = styled.div<{ depth: number; isActive?: boolean }>`
  padding: 6px 8px 6px ${props => props.depth * 16 + 8}px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border-radius: 4px;
  color: ${props => props.isActive ? '#e1e1e1' : '#999'};
  position: relative;
  margin-right: 8px;
  
  &:hover {
    background-color: #383838;
    color: #e1e1e1;

    .more-options {
      visibility: visible;
    }
  }
`;

const InlineInput = styled.input`
  background-color: #383838;
  border: 1px solid #7d4acf;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 12px;
  padding: 4px 8px;
  width: 100%;
  margin: -4px 0;

  &:focus {
    outline: none;
    border-color: #9d6ae0;
    box-shadow: 0 0 0 2px rgba(125, 74, 207, 0.2);
  }
`;

const ItemName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0; // Ensures text truncation works properly
`;

interface RenameItemProps {
  name: string;
  depth: number;
  isExpanded?: boolean;
  isEditing: boolean;
  isActive?: boolean;
  icon?: React.ReactNode;
  moreOptions?: React.ReactNode;
  onToggleExpand?: () => void;
  onStartEdit: () => void;
  onFinishEdit: (newName: string) => void;
  onCancelEdit: () => void;
}

const RenameItem: React.FC<RenameItemProps> = ({
  name,
  depth,
  isExpanded,
  isEditing,
  isActive,
  icon,
  moreOptions,
  onToggleExpand,
  onFinishEdit,
  onCancelEdit
}) => {
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    // Update editValue when name prop changes
    setEditValue(name);
  }, [name]);

  const handleSubmit = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue !== '' && trimmedValue !== name) {
      onFinishEdit(trimmedValue);
    } else {
      onCancelEdit();
    }
  };

  return (
    <TreeItem 
      depth={depth}
      isActive={isActive}
      onClick={() => {
        if (!isEditing) {
          onToggleExpand?.();
        }
      }}
    >
      {onToggleExpand && (
        isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />
      )}
      {icon}
      {isEditing ? (
        <InlineInput
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              handleSubmit();
            } else if (e.key === 'Escape') {
              onCancelEdit();
            }
          }}
          onBlur={handleSubmit}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <ItemName>{name}</ItemName>
      )}
      {moreOptions}
    </TreeItem>
  );
};

export default RenameItem; 