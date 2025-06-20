import { useState, useEffect, useRef, type JSX } from 'react';
import styled from 'styled-components';
import { useCollectionStore, type APIRequest, type APICollection, type APIFolder } from '../../store/collectionStore';
import React from 'react';
import RenameItem from './RenameItem';
import DeleteCollection from './DeleteCollection';
import { FiFolder, FiFile, FiPlus, FiPlay, FiEdit, FiMoreVertical } from 'react-icons/fi';
import { AddButton } from '../../styled-component/AddButton';
import { exportCollectionAsJson } from '../../utils/exportUtility';

// Update store type
declare module '../../store/collectionStore' {
  interface CollectionStoreState {
    removeRequest: (collectionId: string, folderId: string | null, requestId: string) => void;
    renameRequest: (collectionId: string, folderId: string | null, requestId: string, newName: string) => void;
  }
}

interface TreeRequest extends APIRequest {
  type: 'request';
  collectionId: string;
}

interface TreeFolder extends APIFolder {
  type: 'folder';
  collectionId: string;
}

const Container = styled.div`
  padding: 16px;
  color: var(--color-sidebar-text);
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
    background: var(--color-sidebar-scrollbar-track);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-sidebar-scrollbar-thumb);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-sidebar-scrollbar-thumb-hover);
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-sidebar-empty-text);
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
  color: ${props => props.isActive ? 'var(--color-sidebar-item-active-text)' : 'var(--color-sidebar-item-text)'};
  position: relative;
  
  &:hover {
    background-color: var(--color-sidebar-item-hover-bg);
    color: var(--color-sidebar-item-active-text);

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
    background-color: var(--color-sidebar-moreoptions-hover-bg);
    border-radius: 4px;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  margin-left: 4px;
  margin-top: -12px;
  background-color: var(--color-sidebar-dropdown-bg);
  border: 1px solid var(--color-sidebar-dropdown-border);
  border-radius: 4px;
  z-index: 9999;
  min-width: 150px;
  box-shadow: 0 2px 8px var(--color-sidebar-dropdown-shadow);
`;

interface MenuItemProps {
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

const MenuItem = styled.div<MenuItemProps>`
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-sidebar-menuitem-text);
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background-color: var(--color-sidebar-menuitem-hover-bg);
  }

  svg {
    font-size: 12px;
  }
`;

const MethodLabel = styled.span<{ method: string }>`
  color: ${props => {
    switch (props.method?.toUpperCase()) {
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
  type: 'collection' | 'folder' | 'request';
  children?: React.ReactNode;
  id: string;
  activeMenu: string | null;
  onMenuClick: (id: string) => void;
}

const MoreOptions: React.FC<MoreOptionsProps> = ({ 
  type,
  children,
  id,
  activeMenu,
  onMenuClick
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, isTop: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const menuHeight = type === 'request' ? 50 : 200;

      const isTop = spaceBelow < menuHeight;
      
      setPosition({
        top: isTop ? rect.top - menuHeight : rect.bottom + 4,
        left: rect.right,
        isTop
      });
    }
    onMenuClick(id);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <MoreOptionsButton ref={buttonRef} className="more-options" onClick={handleClick}>
        <FiMoreVertical size={14} />
      </MoreOptionsButton>
      <DropdownMenu 
        ref={menuRef}
        isOpen={activeMenu === id}
        style={{ 
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          transformOrigin: position.isTop ? 'bottom right' : 'top right'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </DropdownMenu>
    </div>
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
  background-color: var(--color-sidebar-search-bg);
  border: 1px solid var(--color-sidebar-search-border);
  border-radius: 4px;
  color: var(--color-sidebar-search-text);
  font-size: 12px;
  flex: 1;

  &:focus {
    outline: none;
    border-color: var(--color-sidebar-search-focus-border);
  }

  &::placeholder {
    color: var(--color-sidebar-search-placeholder);
  }
`;

export default function CollectionSidebar(): JSX.Element {
  const {
    collections,
    addCollection,
    setActiveRequest,
    setActiveCollection,
    setActiveFolder,
    activeRequestId,
    activeCollectionId,
    activeFolderId,
    findRequestLocation,
    setRunnerTabRequest,
  } = useCollectionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Add click outside handler to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !(event.target as Element).closest('.more-options')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeMenu]);

  useEffect(() => {
    console.log('Renaming ID changed to:', renamingItemId);
  }, [renamingItemId]);
  

  const handleMenuClick = (id: string) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  // Pass these props to all MoreOptions components
  const moreOptionsProps = {
    activeMenu,
    onMenuClick: handleMenuClick
  };

  const handleSelectRequest = (request: APIRequest) => {
    const location = findRequestLocation(request.id);
    if (!location) return;
  
    const isSameRequest = activeRequestId === request.id;
  
    if (isSameRequest) {
      // Force refresh
      setActiveCollection(null);
      setActiveFolder(null);
      setActiveRequest(null);
      setRunnerTabRequest(null);
  
      setTimeout(() => {
        setActiveCollection(location.collectionId);
        setActiveFolder(location.folderId);
        setActiveRequest(request.id);
        setRunnerTabRequest(null);
      }, 0);
    } else {
      setActiveCollection(location.collectionId);
      setActiveFolder(location.folderId);
      setActiveRequest(request.id);
      setRunnerTabRequest(null);
    }
  };
  

  const handleSelectCollection = (collection: APICollection) => {
    if (activeCollectionId === collection.id && !activeRequestId && !activeFolderId) {
      // Force re-selection
      setActiveCollection(null);
      setActiveRequest(null);
      setActiveFolder(null);
      setRunnerTabRequest(null);
      setTimeout(() => {
        setActiveCollection(collection.id);
      }, 0);
    } else {
      setActiveCollection(collection.id);
      setActiveRequest(null);
      setActiveFolder(null);
      setRunnerTabRequest(null);
    }
  };
  
  const handleSelectFolder = (folder: TreeFolder) => {
    if (activeFolderId === folder.id) {
      // Force re-selection
      setActiveFolder(null);
      setActiveRequest(null);
      setActiveCollection(null);
      setRunnerTabRequest(null);
      setTimeout(() => {
        setActiveCollection(folder.collectionId);
        setActiveFolder(folder.id);
        setRunnerTabRequest(null);
      }, 0);
    } else {
      setActiveCollection(folder.collectionId);
      setActiveFolder(folder.id);
      setActiveRequest(null);
      setRunnerTabRequest(null);
    }
  };
  

  const handleAddCollection = () => {
    const newCollection = {
      id: crypto.randomUUID(),
      name: 'New Collection',
      requests: [],
      description: '',
      auth: {
        type: 'none',
        credentials: {}
      },
      variables: [],
      folders: []
    };
    addCollection(newCollection);
    setRenamingItemId(newCollection.id);
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
            onSelect={handleSelectRequest}
            onCollectionSelect={handleSelectCollection}
            onFolderSelect={handleSelectFolder}
            activeRequestId={activeRequestId || undefined}
            activeCollectionId={activeCollectionId}
            activeFolderId={activeFolderId}
            renamingItemId={renamingItemId}
            setRenamingItemId={setRenamingItemId}
            moreOptionsProps={moreOptionsProps}
          />
        ))}
      </TreeWrapper>
    </Container>
  );
}

const TreeNode: React.FC<{
  item: TreeFolder | TreeRequest | APICollection;
  depth: number;
  onSelect: (request: APIRequest) => void;
  onCollectionSelect?: (collection: APICollection) => void;
  onFolderSelect?: (folder: TreeFolder) => void;
  activeRequestId?: string;
  activeCollectionId?: string | null;
  activeFolderId?: string | null;
  renamingItemId: string | null;
  setRenamingItemId: (id: string | null) => void;
  moreOptionsProps: {
    activeMenu: string | null;
    onMenuClick: (id: string) => void;
  };
}> = ({ item, depth, onSelect, onCollectionSelect, onFolderSelect, activeRequestId, activeCollectionId, activeFolderId, renamingItemId, setRenamingItemId, moreOptionsProps }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    removeCollection, 
    renameCollection, 
    removeFolder, 
    renameFolder, 
    setActiveFolder, 
    addFolder,
    addRequestToFolder,
    addRequestToCollection,
    removeRequest,
    renameRequest,
    setRunnerTabRequest,
    setActiveRequest,
    setActiveCollection,
    runnerTabRequest
  } = useCollectionStore();

  const handleClick = () => {
    if ('type' in item) {
      if (item.type === 'request') {
        onSelect(item);
      } else if (item.type === 'folder') {
        setIsExpanded(!isExpanded);
        onFolderSelect?.(item);
      }
    } else {
      // It's a collection
      onCollectionSelect?.(item);
      setIsExpanded(!isExpanded);
    }
  };

  const handleAddFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();

    let newFolderID = '';
    if ('type' in item) {
      if (item.type === 'folder') {
        // Add folder inside another folder
        newFolderID = await addFolder(item.collectionId, item.id);
        setIsExpanded(true);
      }
    } else {
      // Add folder directly to collection
      newFolderID = await addFolder(item.id, null);
      setIsExpanded(true);
    }
    moreOptionsProps.onMenuClick(''); // Close menu
    setRenamingItemId(newFolderID);
  };

  const handleAddRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let newRequestID = '';
    if ('type' in item) {
      if (item.type === 'folder') {
        // Add request inside folder
        newRequestID = await addRequestToFolder(item.collectionId, item.id);
        setIsExpanded(true);
      }
    } else {
      // Add request directly to collection
      newRequestID = await addRequestToCollection(item.id);
      setIsExpanded(true);
    }
    moreOptionsProps.onMenuClick(''); // Close menu
    setRenamingItemId(newRequestID);
  };

  const handleRunCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement collection run
    if (runnerTabRequest === item.id) {
      // Force re-selection
      setActiveCollection(null);
      setActiveRequest(null);
      setActiveFolder(null);
      setRunnerTabRequest(null);
      setTimeout(() => {
        setRunnerTabRequest(item.id); // this updates Zustand state
        setActiveRequest(null);
        setActiveFolder(null);
        setActiveCollection(item.id);
      }, 0);
    } else {
      setActiveCollection(item.id);
      setActiveRequest(null);
      setActiveFolder(null);
      setRunnerTabRequest(item.id);
    }

    moreOptionsProps.onMenuClick(''); // Close menu
  };

  const handleRunFolder = (folderId: string, collectionId: string) => {
    // TODO: Implement folder run
    if (runnerTabRequest === folderId) {
      // Force re-selection
      setActiveCollection(null);
      setActiveRequest(null);
      setActiveFolder(null);
      setRunnerTabRequest(null);
      setTimeout(() => {
        setRunnerTabRequest(folderId); // this updates Zustand state
        setActiveRequest(null);
        setActiveFolder(folderId);
        setActiveCollection(collectionId);
      }, 0);
    } else {
      setActiveCollection(collectionId);
      setActiveRequest(null);
      setActiveFolder(folderId);
      setRunnerTabRequest(folderId);
    }
    console.log('Run folder');
    moreOptionsProps.onMenuClick(''); // Close menu
  };

  const handleRenameFinish = (newName: string) => {
    if ('type' in item) {
      if (item.type === 'folder') {
        renameFolder(item.collectionId, item.id, newName);
      }
    } else {
      renameCollection(item.id, newName);
    }
    setRenamingItemId(null);
  };

  const handleRenameClick = () => {
    setRenamingItemId(item.id);
    moreOptionsProps.onMenuClick(''); // Close menu
  };

  // Handle collection
  if (!('type' in item)) {
    return (
      <>
        <RenameItem
          name={item.name}
          depth={depth}
          isExpanded={isExpanded}
          isEditing={item.id === renamingItemId}
          isActive={item.id === activeCollectionId}
          icon={<FiFolder size={14} />}
          onToggleExpand={() => {
            setIsExpanded(!isExpanded);
            onCollectionSelect?.(item);
          }}
          onStartEdit={() => setRenamingItemId(item.id)}
          onFinishEdit={handleRenameFinish}
          onCancelEdit={() => setRenamingItemId(null)}
          moreOptions={
            <MoreOptions type="collection" id={item.id} activeMenu={moreOptionsProps.activeMenu} onMenuClick={moreOptionsProps.onMenuClick}>
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
              <MenuItem onClick={() => {
                setRenamingItemId(item.id);
                moreOptionsProps.onMenuClick('');
              }}>
                <FiEdit size={14} />
                Rename
              </MenuItem>
              <MenuItem onClick={() => {
                    exportCollectionAsJson(item.id);
                    moreOptionsProps.onMenuClick('');
              }}>
                <FiFile size={14} />
                Export
              </MenuItem>
              <DeleteCollection
                collectionName={item.name}
                onConfirm={() => {
                  removeCollection(item.id);
                  moreOptionsProps.onMenuClick('');
                }}
                onCancel={() => moreOptionsProps.onMenuClick('')}
              />
            </MoreOptions>
          }
        />

        {isExpanded && (
          <>
            {item.folders?.map((folder) => (
              <TreeNode
                key={folder.id}
                item={{
                  ...folder,
                  type: 'folder' as const,
                  collectionId: item.id
                }}
                depth={depth + 1}
                onSelect={onSelect}
                onFolderSelect={onFolderSelect}
                activeRequestId={activeRequestId}
                activeCollectionId={activeCollectionId}
                activeFolderId={activeFolderId}
                renamingItemId={renamingItemId}
                setRenamingItemId={setRenamingItemId}
                moreOptionsProps={moreOptionsProps}
              />
            ))}
            {item.requests?.map((request) => (
              <TreeNode
                key={request.id}
                item={{
                  ...request,
                  type: 'request' as const,
                  collectionId: item.id
                }}
                depth={depth + 1}
                onSelect={(req) => {
                  onSelect(req);
                  // Only clear folder selection if we're at collection level (depth === 0)
                  if (depth === 0) {
                    setActiveFolder(null);
                  }
                }}
                activeRequestId={activeRequestId}
                activeCollectionId={activeCollectionId}
                activeFolderId={activeFolderId}
                renamingItemId={renamingItemId}
                setRenamingItemId={setRenamingItemId}
                moreOptionsProps={moreOptionsProps}
              />
            ))}
          </>
        )}
      </>
    );
  }

  // Handle folder
  if (item.type === 'folder') {
    return (
      <>
        <RenameItem
          name={item.name}
          depth={depth}
          isExpanded={isExpanded}
          isEditing={item.id === renamingItemId}
          isActive={item.id === activeFolderId}
          icon={<FiFolder size={14} />}
          onToggleExpand={() => {
            setIsExpanded(!isExpanded);
            onFolderSelect?.(item);
          }}
          onStartEdit={() => setRenamingItemId(item.id)}
          onFinishEdit={handleRenameFinish}
          onCancelEdit={() => setRenamingItemId(null)}
          moreOptions={
            <MoreOptions type="folder" id={item.id} activeMenu={moreOptionsProps.activeMenu} onMenuClick={moreOptionsProps.onMenuClick}>
              <MenuItem onClick={handleAddFolder}>
                <FiFolder size={14} />
                Add Folder
              </MenuItem>
              <MenuItem onClick={handleAddRequest}>
                <FiPlus size={14} />
                Add Request
              </MenuItem>
              <MenuItem onClick={(e) => {handleRunFolder(item.id,item.collectionId); e.stopPropagation();}}>
                <FiPlay size={14} />
                Run Folder
              </MenuItem>
              <MenuItem onClick={() => {
                setRenamingItemId(item.id);
                moreOptionsProps.onMenuClick('');
              }}>
                <FiEdit size={14} />
                Rename
              </MenuItem>
              <DeleteCollection
                collectionName={item.name}
                onConfirm={() => {
                  removeFolder(item.collectionId, item.id);
                  moreOptionsProps.onMenuClick('');
                }}
                onCancel={() => moreOptionsProps.onMenuClick('')}
              />
            </MoreOptions>
          }
        />

        {isExpanded && (
          <>
            {item.folders?.map((folder) => (
              <TreeNode
                key={folder.id}
                item={{
                  ...folder,
                  type: 'folder' as const,
                  collectionId: item.collectionId
                }}
                depth={depth + 1}
                onSelect={onSelect}
                onFolderSelect={onFolderSelect}
                activeRequestId={activeRequestId}
                activeCollectionId={activeCollectionId}
                activeFolderId={activeFolderId}
                renamingItemId={renamingItemId}
                setRenamingItemId={setRenamingItemId}
                moreOptionsProps={moreOptionsProps}
              />
            ))}
            {item.requests?.map((request) => (
              <TreeNode
                key={request.id}
                item={{
                  ...request,
                  type: 'request' as const,
                  collectionId: item.collectionId
                }}
                depth={depth + 1}
                onSelect={(req) => {
                  onSelect(req);
                  // Only clear folder selection if we're at collection level (depth === 0)
                  if (depth === 0) {
                    setActiveFolder(null);
                  }
                }}
                activeRequestId={activeRequestId}
                activeCollectionId={activeCollectionId}
                activeFolderId={activeFolderId}
                renamingItemId={renamingItemId}
                setRenamingItemId={setRenamingItemId}
                moreOptionsProps={moreOptionsProps}
              />
            ))}
          </>
        )}
      </>
    );
  }

  // Handle request
  return (
    <TreeItem 
      depth={depth} 
      isActive={item.id === activeRequestId} 
      onClick={handleClick}
    >
      <FiFile size={14} />
      <MethodLabel method={item.method}>{item.method}</MethodLabel>
      {item.id === renamingItemId ? (
        <input
          type="text"
          defaultValue={item.name}
          autoFocus
          onBlur={(e) => {
            const newName = e.target.value.trim();
            if (newName && newName !== item.name) {
              renameRequest(activeCollectionId!, activeFolderId ?? null, item.id, newName);
            }
            setRenamingItemId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const newName = e.currentTarget.value.trim();
              if (newName && newName !== item.name) {
                renameRequest(activeCollectionId!, activeFolderId ?? null, item.id, newName);
              }
              setRenamingItemId(null);
              e.preventDefault();
            } else if (e.key === 'Escape') {
              setRenamingItemId(null);
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <TreeItemLabel>{item.name}</TreeItemLabel>
          <MoreOptions type="request" id={item.id} activeMenu={moreOptionsProps.activeMenu} onMenuClick={moreOptionsProps.onMenuClick}>
            <MenuItem onClick={handleRenameClick}>
              <FiEdit size={14} />
              Rename
            </MenuItem>
            <DeleteCollection
              collectionName={item.name}
              onConfirm={() => {
                removeRequest(activeCollectionId!, activeFolderId ?? null, item.id);
                moreOptionsProps.onMenuClick(''); // Close menu
              }}
              onCancel={() => moreOptionsProps.onMenuClick('')} // Close menu on cancel
            />
          </MoreOptions>
        </>
      )}
    </TreeItem>
  );
}

