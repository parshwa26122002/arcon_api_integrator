import { useState, useEffect, useRef, type JSX } from 'react';
import styled from 'styled-components';
import { FiChevronRight, FiChevronDown, FiFolder, FiFile, FiMoreVertical, FiPlay, FiPlus } from 'react-icons/fi';
import { useCollectionStore, type APIRequest, type APICollection } from '../../store/collectionStore';
import React from 'react';

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

const ItemName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface MoreOptionsProps {
  type: 'collection' | 'folder';
  onAddFolder: () => void;
  onAddRequest: () => void;
  onRun?: () => void;
}

const MoreOptions: React.FC<MoreOptionsProps> = ({ type, onAddFolder, onAddRequest, onRun }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
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
      setPosition({
        top: rect.bottom + 4,
        left: rect.right
      });
    }
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    callback();
    setIsOpen(false);
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
          left: `${position.left}px`
        }}
      >
        <MenuItem onClick={handleOptionClick(onAddFolder)}>
          <FiFolder size={14} />
          Add Folder
        </MenuItem>
        <MenuItem onClick={handleOptionClick(onAddRequest)}>
          <FiPlus size={14} />
          Add Request
        </MenuItem>
        {type === 'collection' && (
          <MenuItem onClick={handleOptionClick(onRun!)}>
            <FiPlay size={14} />
            Run Collection
          </MenuItem>
        )}
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

  const handleAddFolder = () => {
    // TODO: Implement folder addition
    console.log('Add folder');
  };

  const handleAddRequest = () => {
    // TODO: Implement request addition
    console.log('Add request');
  };

  const handleRunCollection = () => {
    // TODO: Implement collection run
    console.log('Run collection');
  };

  // Handle collection (top-level)
  if ('requests' in item) {
    return (
      <>
        <TreeItem depth={depth} onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          <FiFolder size={14} />
          <ItemName>{item.name}</ItemName>
          <MoreOptions 
            type="collection"
            onAddFolder={handleAddFolder}
            onAddRequest={handleAddRequest}
            onRun={handleRunCollection}
          />
        </TreeItem>
        {isExpanded && item.requests.map((request) => (
          <TreeItem 
            key={request.id}
            depth={depth + 1}
            onClick={() => onSelect(request)}
            isActive={request.id === activeRequestId}
          >
            <FiFile size={14} />
            <MethodLabel method={request.method}>{request.method}</MethodLabel>
            <ItemName>{request.name}</ItemName>
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
        <ItemName>{item.name}</ItemName>
      </TreeItem>
    );
  }

  // Handle folder
  return (
    <>
      <TreeItem depth={depth} onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
        <FiFolder size={14} />
        <ItemName>{item.name}</ItemName>
        <MoreOptions 
          type="folder"
          onAddFolder={handleAddFolder}
          onAddRequest={handleAddRequest}
        />
      </TreeItem>
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

export default function CollectionSidebar(): JSX.Element {
  const {
    collections,
    setActiveRequest,
    setActiveCollection,
    activeRequestId,
    activeCollectionId
  } = useCollectionStore();

  console.log('Sidebar - Collections:', collections);
  console.log('Sidebar - Active Collection ID:', activeCollectionId);
  console.log('Sidebar - Active Request ID:', activeRequestId);

  const handleSelectRequest = (request: APIRequest, collectionId: string) => {
    console.log('Selecting request:', request);
    console.log('Collection ID:', collectionId);
    setActiveCollection(collectionId);
    setActiveRequest(request.id);
  };

  if (collections.length === 0) {
    return (
      <Container>
        <EmptyState>
          Create a collection for your requests
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <TreeWrapper>
        {collections.map((collection) => (
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
