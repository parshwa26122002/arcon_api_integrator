import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useCollectionStore, type APICollection } from '../../store/collectionStore';
import { FiChevronRight, FiFolder } from 'react-icons/fi';
import { v4 as uuid } from 'uuid';

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
  width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
`;

const Title = styled.h2`
  color: var(--color-text);
  margin: 0;
  font-size: 18px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: var(--color-panel-alt);
  color: var(--color-text);
  font-size: 14px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: var(--color-tab-active);
  }

  &::placeholder {
    color: var(--color-input-placeholder);
  }
`;

const TreeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 150px;
  max-height: 300px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
`;

const ScrollContainer = styled.div`
  overflow-y: auto;
  padding-right: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TreeItem = styled.div<{ depth: number; isSelected: boolean }>`
  padding: 8px 8px 8px ${props => props.depth * 16 + 8}px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--color-text);
  background-color: ${props => props.isSelected ? 'var(--color-panel-alt)' : 'transparent'};
  
  &:hover {
    background-color: var(--color-panel-alt);
  }
`;

const FolderIconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--color-border);
  }

  svg {
    transition: transform 0.2s ease;
  }
`;

const ChevronIcon = styled.div<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  color: var(--color-muted);
  
  svg {
    transform: rotate(${props => props.isExpanded ? '90deg' : '0deg'});
  }
`;

const FolderIcon = styled(FiFolder)<{ isExpanded?: boolean }>`
  color: ${props => props.isExpanded ? 'var(--color-success)' : 'var(--color-text)'};
  transition: color 0.2s;
`;

const EditableTreeItem = styled(TreeItem)`
  input {
    background: transparent;
    border: none;
    color: var(--color-text);
    font-size: inherit;
    padding: 0;
    margin: 0;
    width: 100%;
    
    &:focus {
      outline: none;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: ${props => props.primary ? 'var(--color-button-hover)' : 'var(--color-border)'};
  }
`;

interface TreeNodeProps {
  node: { id: string; name: string; folders?: any[]; isNew?: boolean };
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (id: string) => void;
  onCollapseOthers: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ 
  node, 
  depth, 
  selectedId, 
  onSelect,
  expandedNodes,
  onToggleExpand,
  onCollapseOthers,
  onRename
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasChildren = node.folders && node.folders.length > 0;
  const isExpanded = expandedNodes.has(node.id);

  useEffect(() => {
    if (node.isNew && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [node.isNew]);

  const handleItemClick = () => {
    onSelect(node.id);
  };

  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpand(node.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onRename) {
      onRename(node.id, e.currentTarget.value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onRename) {
      onRename(node.id, e.target.value);
    }
  };

  return (
    <>
      {node.isNew ? (
        <EditableTreeItem
          depth={depth}
          isSelected={selectedId === node.id}
        >
          <FolderIconWrapper onClick={handleFolderClick}>
            <ChevronIcon isExpanded={isExpanded}>
              <FiChevronRight size={14} />
            </ChevronIcon>
            <FolderIcon isExpanded={isExpanded} />
          </FolderIconWrapper>
          <input
            ref={inputRef}
            defaultValue={node.name}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
        </EditableTreeItem>
      ) : (
        <TreeItem 
          depth={depth}
          isSelected={selectedId === node.id}
          onClick={handleItemClick}
        >
          <FolderIconWrapper onClick={handleFolderClick}>
            <ChevronIcon isExpanded={isExpanded}>
              <FiChevronRight size={14} />
            </ChevronIcon>
            <FolderIcon isExpanded={isExpanded} />
          </FolderIconWrapper>
          {node.name}
        </TreeItem>
      )}
      {hasChildren && isExpanded && node.folders && node.folders.map((child: any) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand}
          onCollapseOthers={onCollapseOthers}
          onRename={onRename}
        />
      ))}
    </>
  );
};

interface SaveToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, LocationId: string) => void;
  type: 'request' | 'folder' | 'collection' | 'runner' | 'documentation';
}

const SaveToCollectionModal: React.FC<SaveToCollectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  type
}) => {
  const [name, setName] = useState('');
  const [selectedLocationId, setselectedLocationId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const collections = useCollectionStore(state => state.collections);
  const addCollection = useCollectionStore(state => state.addCollection);  
  const updateCollection = useCollectionStore(state => state.updateCollection);

  const handleToggleExpand = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCollapseOthers = (id: string) => {
    setExpandedNodes(new Set([id]));
  };

  const handleNewCollection = async () => {
    const newCollection: APICollection = {
      id: uuid(),
      name: 'New Collection',
      folders: [],
      requests: [],
      isNew: true,
    };
    await addCollection(newCollection); // directly saves + updates store
    setselectedLocationId(newCollection.id);
    console.log('newCollection', newCollection);
  };
  

  const handleRename = async (id: string, newName: string) => {
    const collection = collections.find(c => c.id === id);
    if (!collection) return;
  
    const updatedCollection = {
      ...collection,
      name: newName,
      isNew: undefined, // strip the flag
    };
  
    await updateCollection(id, updatedCollection); // this will update + persist
  };
  

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Title>Save {type}</Title>
        
        <ScrollContainer>
          <div>
            <label htmlFor="name" style={{ color: 'var(--color-text)', marginBottom: '4px', display: 'block' }}>
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`Enter ${type} name`}
            />
          </div>

          <div>
            <label style={{ color: 'var(--color-text)', marginBottom: '4px', display: 'block' }}>
              Select location
            </label>
            <TreeContainer>
              {collections.map(collection => (
                <TreeNode
                  key={collection.id}
                  node={collection}
                  depth={0}
                  selectedId={selectedLocationId}
                  onSelect={setselectedLocationId}
                  expandedNodes={expandedNodes}
                  onToggleExpand={handleToggleExpand}
                  onCollapseOthers={handleCollapseOthers}
                  onRename={handleRename}
                />
              ))}
            </TreeContainer>
          </div>
        </ScrollContainer>

        <ButtonContainer>
          <Button onClick={handleNewCollection}>New Collection</Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              primary 
              disabled={!name || !selectedLocationId}
              onClick={() => {
                if (name && selectedLocationId) {
                  onSave(name, selectedLocationId);
                  onClose();
                }
              }}
            >
              Save
            </Button>
          </div>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SaveToCollectionModal;