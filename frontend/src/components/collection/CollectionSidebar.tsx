import { useState, useEffect, useRef, type JSX } from 'react';
import styled from 'styled-components';
import { useCollectionStore, type APIRequest, type APICollection } from '../../store/collectionStore';
import React from 'react';
import RenameItem from './RenameItem';
import DeleteCollection from './DeleteCollection';
import { FiFolder, FiFile, FiPlus, FiPlay, FiEdit, FiMoreVertical } from 'react-icons/fi';
import { AddButton } from '../../styled-component/AddButton';

interface TreeRequest extends APIRequest {
  type: 'request';
}

interface TreeFolder {
  id: string;
  name: string;
  type: 'folder';
  items: (TreeFolder | TreeRequest)[];
}

const Container = styled.div`
  padding: 16px;
  color: #e1e1e1;
  height: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;

  /* Customize scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #2d2d2d;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #5a5a5a;
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 20px;
`;

const TreeWrapper = styled.div`
  min-height: min-content;
  width: 100%;
`;

const TreeItemLabel = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
  display: block;
  font-size: 13px;
`;

const TreeItem = styled.div<{ depth: number; isActive?: boolean }>`
  padding: 6px 8px 6px ${props => props.depth * 16 + 8}px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border-radius: 4px;
  color: ${props => props.isActive ? '#e1e1e1' : '#999'};
  position: relative;
  
  &:hover {
    background-color: #383838;
    color: #e1e1e1;

    .more-options {
      visibility: visible;
    }
  }
`;

const MoreOptionsButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  padding: 4px;
  cursor: pointer;
  visibility: hidden;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;

  &:hover {
    background-color: #4a4a4a;
    border-radius: 4px;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  margin-left: 4px;
  margin-top: -12px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  z-index: 9999;
  min-width: 150px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const MenuItem = styled.div`
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e1e1e1;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background-color: #383838;
  }

  svg {
    font-size: 12px;
  }
`;

const MethodLabel = styled.span<{ method: string }>`
  color: ${props => {
    switch (props.method.toUpperCase()) {
      case 'GET': return '#61affe';
      case 'POST': return '#49cc90';
      case 'PUT': return '#fca130';
      case 'DELETE': return '#f93e3e';
      case 'PATCH': return '#50e3c2';
      default: return '#999999';
    }
  }};
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
`;

interface MoreOptionsProps {
  type: 'collection' | 'folder';
  onAddFolder?: () => void;
  onAddRequest?: () => void;
  onRun?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}

const MoreOptions: React.FC<MoreOptionsProps> = ({ 
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, isTop: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current &&
        menuRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const menuHeight = 120; // Approximate height of the menu

      // If not enough space below, show above
      const isTop = spaceBelow < menuHeight;
      
      setPosition({
        top: isTop ? rect.top - menuHeight : rect.bottom + 4,
        left: rect.right,
        isTop
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: 'relative' }}>
      <MoreOptionsButton ref={buttonRef} className="more-options" onClick={handleClick}>
        <FiMoreVertical size={14} />
      </MoreOptionsButton>
      <DropdownMenu 
        ref={menuRef}
        isOpen={isOpen} 
        style={{ 
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          transformOrigin: position.isTop ? 'bottom right' : 'top right'
        }}
      >
        {children}
      </DropdownMenu>
    </div>
  );
};

const TreeNode: React.FC<{
  item: TreeFolder | TreeRequest | APICollection;
  depth: number;
  onSelect: (item: APIRequest) => void;
  activeRequestId?: string;
}> = ({ item, depth, onSelect, activeRequestId }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const { removeCollection, renameCollection } = useCollectionStore();

  const handleAddFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement folder addition
    console.log('Add folder');
  };

  const handleAddRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement request addition
    console.log('Add request');
  };

  const handleRunCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement collection run
    console.log('Run collection');
  };

  const handleRenameSubmit = (newName: string) => {
    if ('requests' in item) {
      renameCollection(item.id, newName);
      setIsRenaming(false);
    }
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
  };

  const handleDeleteCollection = () => {
    if ('requests' in item) {
      removeCollection(item.id);
    }
  };
  
  const handleExportCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement collection export
    console.log('Export collection');
  };

  // Handle collection (top-level)
  if ('requests' in item) {
    return (
      <>
        <RenameItem
          name={item.name}
          depth={depth}
          isExpanded={isExpanded}
          isEditing={isRenaming}
          icon={<FiFolder size={14} />}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          onStartEdit={() => setIsRenaming(true)}
          onFinishEdit={handleRenameSubmit}
          onCancelEdit={() => setIsRenaming(false)}
          moreOptions={
            <MoreOptions type="collection">
              <MenuItem onClick={handleAddFolder}>
                <FiFolder size={14} />
                Add Folder
              </MenuItem>
              <MenuItem onClick={handleAddRequest}>
                <FiPlus size={14} />
                Add Request
              </MenuItem>
              <MenuItem onClick={handleRunCollection}>
                <FiPlay size={14} />
                Run Collection
              </MenuItem>
              <MenuItem onClick={handleStartRename}>
                <FiEdit size={14} />
                Rename
              </MenuItem>
              <DeleteCollection
                collectionName={item.name}
                onConfirm={handleDeleteCollection}
                onCancel={() => {}}
              />
              <MenuItem onClick={handleExportCollection}>
                <FiEdit size={14} />
                Export
              </MenuItem>
            </MoreOptions>
          }
        />
        {isExpanded && item.requests.map((request) => (
          <TreeItem 
            key={request.id}
            depth={depth + 1}
            onClick={() => onSelect(request)}
            isActive={request.id === activeRequestId}
          >
            <FiFile size={14} />
            <MethodLabel method={request.method}>{request.method}</MethodLabel>
            <TreeItemLabel>{request.name}</TreeItemLabel>
          </TreeItem>
        ))}
      </>
    );
  }

  // Handle request
  if ('method' in item) {
    return (
      <TreeItem 
        depth={depth}
        onClick={() => onSelect(item)}
        isActive={item.id === activeRequestId}
      >
        <FiFile size={14} />
        <MethodLabel method={item.method}>{item.method}</MethodLabel>
        <TreeItemLabel>{item.name}</TreeItemLabel>
      </TreeItem>
    );
  }

  // Handle folder
  return (
    <>
      <RenameItem
        name={item.name}
        depth={depth}
        isExpanded={isExpanded}
        isEditing={isRenaming}
        icon={<FiFolder size={14} />}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        onStartEdit={() => setIsRenaming(true)}
        onFinishEdit={(newName) => {
          // TODO: Implement folder rename
          console.log('Rename folder to:', newName);
          setIsRenaming(false);
        }}
        onCancelEdit={() => setIsRenaming(false)}
        moreOptions={
          <MoreOptions type="folder">
            <MenuItem onClick={handleAddFolder}>
              <FiFolder size={14} />
              Add Folder
            </MenuItem>
            <MenuItem onClick={handleAddRequest}>
              <FiPlus size={14} />
              Add Request
            </MenuItem>
          </MoreOptions>
        }
      />
      {isExpanded && item.items.map((childItem) => (
        <TreeNode
          key={childItem.id}
          item={childItem}
          depth={depth + 1}
          onSelect={onSelect}
          activeRequestId={activeRequestId}
        />
      ))}
    </>
  );
};

const SearchContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 8px;
  background-color: #383838;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 12px;
  flex: 1;

  &:focus {
    outline: none;
    border-color: #7d4acf;
  }

  &::placeholder {
    color: #999;
  }
`;

export default function CollectionSidebar(): JSX.Element {
  const {
    collections,
    addCollection,
    setActiveRequest,
    setActiveCollection,
    activeRequestId,
  } = useCollectionStore();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectRequest = (request: APIRequest, collectionId: string) => {
    setActiveCollection(collectionId);
    setActiveRequest(request.id);
  };

  const handleAddCollection = () => {
    const newCollection = {
      id: crypto.randomUUID(),
      name: 'New Collection',
      requests: []
      };
      addCollection(newCollection);
  };

  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredCollections.length === 0) {
    return (
      <Container>
        <SearchContainer>
          <SearchInput 
            type="text" 
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddButton onClick={handleAddCollection}>
            <FiPlus />
          </AddButton>
        </SearchContainer>
        <EmptyState>
          {searchTerm ? 'No collections found' : 'No collections yet'}
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <SearchContainer>
        <SearchInput 
          type="text"
          placeholder="Search collections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <AddButton onClick={handleAddCollection}>
          <FiPlus />
        </AddButton>
      </SearchContainer>
      <TreeWrapper>
        {filteredCollections.map((collection) => (
          <TreeNode
            key={collection.id}
            item={collection}
            depth={0}
            onSelect={(request) => handleSelectRequest(request, collection.id)}
            activeRequestId={activeRequestId || undefined}
          />
        ))}
      </TreeWrapper>
    </Container>
  );
}
