import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import styled from 'styled-components';
import RequestPane from '../requestpane/RequestPane';
import CollectionPane from '../collectionpane/CollectionPane';
import FolderPane from '../folderpane/FolderPane';
import { AddButton } from '../../styled-component/AddButton';
import { Tab } from '../../styled-component/Tab';
import { useCollectionStore, type CollectionTabState, type RequestTabState, type FolderTabState } from '../../store/collectionStore';
import { convertRequestBodyToTabBody, convertTabBodyToRequestBody } from '../../utils/requestUtils';

interface TabBarWrapperProps {
  row?: boolean;
}

const TabBarWrapper = styled.div<TabBarWrapperProps>`
  display: flex;
  flex-direction: ${props => (props.row ? 'row' : 'column')};
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #1e1e1e;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #555 #1e1e1e;
  width: 100%;
  max-width: 1040px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #1e1e1e;
  }
`;

export const MainTab = styled(Tab)`
  flex: unset;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 160px;
  padding: 6px 12px;
  overflow: hidden;

  span.label {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &:hover span.close {
    visibility: visible;
  }
`;

const CloseIcon = styled.span`
  font-size: 14px;
  color: #999;
  cursor: pointer;
  visibility: hidden;
  padding-left: 4px;

  &:hover {
    color: #e1e1e1;
  }
`;

const MainContentTabs: React.FC = () => {
  const [tabs, setTabs] = useState<(RequestTabState | CollectionTabState | FolderTabState)[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [tabCounter, setTabCounter] = useState(1);

  const activeCollectionId = useCollectionStore(state => state.activeCollectionId);
  const activeRequestId = useCollectionStore(state => state.activeRequestId);
  const activeFolderId = useCollectionStore(state => state.activeFolderId);
  const getActiveRequest = useCollectionStore(state => state.getActiveRequest);
  const getActiveCollection = useCollectionStore(state => state.getActiveCollection);
  const getActiveFolder = useCollectionStore(state => state.getActiveFolder);
  const updateRequest = useCollectionStore(state => state.updateRequest);
  const updateCollection = useCollectionStore(state => state.updateCollection);
  const updateFolder = useCollectionStore(state => state.updateFolder);

  const createNewRequestTab = (collectionId?: string, requestId?: string) => {
    let newTab: RequestTabState;
    if (collectionId && requestId) {
      const request = getActiveRequest();
      if (!request) return null;
      newTab = {
        id: tabCounter,
        type: 'request',
        title: request.name || `New Request`,
        collectionId,
        requestId,
        method: request.method || 'GET',
        url: request.url || '',
        queryParams: request.queryParams || [],
        headers: request.headers || [],
        auth: request.auth || { type: 'none', credentials: {} },
        body: convertRequestBodyToTabBody(request.body)
      };
    } else {
      newTab = {
        id: tabCounter,
        type: 'request',
        title: `New Request`,
        method: 'GET',
        url: '',
        queryParams: [],
        headers: [],
        auth: { type: 'none', credentials: {} },
        body: { mode: 'none' }
      };
    }

    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
    setTabCounter(prev => prev + 1);
    return newTab;
  };

  const createNewCollectionTab = (collectionId: string) => {
    const collection = getActiveCollection();
    if (!collection) return null;
    
    const newTab: CollectionTabState = {
      id: tabCounter,
      type: 'collection',
      title: collection.name || 'New Collection',
      collectionId,
      description: collection.description || '',
      auth: collection.auth || { type: 'none', credentials: {} },
      variables: collection.variables || []
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
    setTabCounter(prev => prev + 1);
    return newTab;
  };

  const createNewFolderTab = (collectionId: string, folderId: string) => {
    console.log('createNewFolderTab called:', { collectionId, folderId });
    const folder = getActiveFolder();
    console.log('Active folder:', folder);
    if (!folder) return null;
    
    const newTab: FolderTabState = {
      id: tabCounter,
      type: 'folder',
      title: folder.name || 'New Folder',
      collectionId,
      folderId,
      description: folder.description || '',
      auth: folder.auth || { type: 'none', credentials: {} }
    };

    console.log('Creating new folder tab:', newTab);
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
    setTabCounter(prev => prev + 1);
    return newTab;
  };

  useEffect(() => {
    console.log('MainContentTabs useEffect:', {
      activeCollectionId,
      activeRequestId,
      activeFolderId
    });

    if (activeCollectionId && activeRequestId) {
      const existingTab = tabs.find(
        tab => 
          tab.type === 'request' &&
          tab.collectionId === activeCollectionId && 
          (tab as RequestTabState).requestId === activeRequestId
      );
      if (existingTab) {
        setActiveTab(existingTab.id);
      } else {
        createNewRequestTab(activeCollectionId, activeRequestId);
      }
    } else if (activeCollectionId && activeFolderId) {
      console.log('Creating/activating folder tab:', {
        collectionId: activeCollectionId,
        folderId: activeFolderId
      });
      const existingTab = tabs.find(
        tab => 
          tab.type === 'folder' &&
          tab.collectionId === activeCollectionId &&
          (tab as FolderTabState).folderId === activeFolderId
      );
      if (existingTab) {
        console.log('Found existing folder tab:', existingTab);
        setActiveTab(existingTab.id);
      } else {
        console.log('Creating new folder tab');
        createNewFolderTab(activeCollectionId, activeFolderId);
      }
    } else if (activeCollectionId && !activeRequestId && !activeFolderId) {
      const existingTab = tabs.find(
        tab => 
          tab.type === 'collection' &&
          tab.collectionId === activeCollectionId
      );
      if (existingTab) {
        setActiveTab(existingTab.id);
      } else {
        createNewCollectionTab(activeCollectionId);
      }
    }
  }, [activeCollectionId, activeRequestId, activeFolderId]);

  const handleAddTab = () => {
    createNewRequestTab();
  };

  const handleTabClick = (id: number) => {
    setActiveTab(id);
  };

  const handleCloseTab = (id: number) => {
    setTabs(prev => {
      const updatedTabs = prev.filter(tab => tab.id !== id);
      if (activeTab === id) {
        if (updatedTabs.length > 0) {
          setActiveTab(updatedTabs[updatedTabs.length - 1].id);
        } else {
          setActiveTab(null);
        }
      }
      return updatedTabs;
    });
  };

  const handleTabStateChange = (tabId: number, newState: Partial<RequestTabState | CollectionTabState | FolderTabState>) => {
    setTabs(prevTabs =>
      prevTabs.map(tab => {
        if (tab.id === tabId) {
          if (tab.type === 'request') {
            const requestTab = tab as RequestTabState;
            const requestState = newState as Partial<RequestTabState>;
            const updatedTab: RequestTabState = { ...requestTab, ...requestState };
            
            if (requestTab.collectionId && requestTab.requestId) {
              updateRequest(requestTab.collectionId, requestTab.requestId, {
                method: requestState.method,
                url: requestState.url,
                queryParams: requestState.queryParams,
                headers: requestState.headers,
                auth: requestState.auth,
                body: requestState.body ? convertTabBodyToRequestBody(requestState.body) : undefined
              });
            }
            return updatedTab;
          } else if (tab.type === 'collection') {
            const collectionTab = tab as CollectionTabState;
            const collectionState = newState as Partial<CollectionTabState>;
            const updatedTab: CollectionTabState = { ...collectionTab, ...collectionState };
            
            if (collectionTab.collectionId) {
              updateCollection(collectionTab.collectionId, {
                description: collectionState.description,
                auth: collectionState.auth,
                variables: collectionState.variables
              });
            }
            return updatedTab;
          } else if (tab.type === 'folder') {
            const folderTab = tab as FolderTabState;
            const folderState = newState as Partial<FolderTabState>;
            const updatedTab: FolderTabState = { ...folderTab, ...folderState };
            
            if (folderTab.collectionId && folderTab.folderId) {
              updateFolder(folderTab.collectionId, folderTab.folderId, {
                description: folderState.description,
                auth: folderState.auth
              });
            }
            return updatedTab;
          }
        }
        return tab;
      })
    );
  };

  const getCurrentTab = () => tabs.find(tab => tab.id === activeTab) || null;

  const renderTabContent = () => {
    const currentTab = getCurrentTab();
    if (!currentTab) return null;

    switch (currentTab.type) {
      case 'request':
        return <RequestPane tabState={currentTab} onStateChange={(state) => handleTabStateChange(currentTab.id, state)} />;
      case 'collection':
        return <CollectionPane tabState={currentTab} onStateChange={(state) => handleTabStateChange(currentTab.id, state)} />;
      case 'folder':
        const folder = getActiveFolder();
        if (!folder) return null;
        return (
          <FolderPane
            folder={folder}
            onUpdate={(updates) => {
              const folderState: Partial<FolderTabState> = {
                description: updates.description,
                auth: updates.auth
              };
              handleTabStateChange(currentTab.id, folderState);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TabBarWrapper row>
        {tabs.map((tab) => (
          <MainTab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
            title={tab.title}
          >
            <span className="label">{tab.title}</span>
            <CloseIcon
              className="close"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseTab(tab.id);
              }}
            >
              ×
            </CloseIcon>
          </MainTab>
        ))}
        <AddButton onClick={handleAddTab}>
          <FiPlus />
        </AddButton>
      </TabBarWrapper>
      {renderTabContent()}
    </div>
  );
};

export default MainContentTabs;
