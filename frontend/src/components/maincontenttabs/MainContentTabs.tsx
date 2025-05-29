import React, { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import styled from 'styled-components';
import RequestPane from '../requestpane/RequestPane';
import CollectionPane from '../collectionpane/CollectionPane';
import FolderPane from '../folderpane/FolderPane';
import { AddButton } from '../../styled-component/AddButton';
import { Tab } from '../../styled-component/Tab';
import { useCollectionStore, type CollectionTabState, type RequestTabState, type FolderTabState, type APIFolder, type DocumentationTabState } from '../../store/collectionStore';
import { convertRequestBodyToTabBody, convertTabBodyToRequestBody } from '../../utils/requestUtils';
import UnsavedChangesModal from '../modals/UnsavedChangesModal';
import SaveToCollectionModal from '../modals/SaveToCollectionModal';
import PaneHeader from '../paneheader/PaneHeader';
import DocumentationPane from '../documentationpane/DocumentationPane';


const ScrollbarArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px 10px;
  gap:2px;
`
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
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #555 #1e1e1e;
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

const UnsavedDot = styled.span`
  position: absolute;
  top: 3px; /* Adjust vertically for centering */
  left: 3px; /* Adjust horizontally for centering */
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #fca130;
  padding-left: 4px;
`;

const MainTab = styled(Tab)`
  flex: unset;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 150px;
  max-width: 150px;
  flex-shrink: 0;    
  padding: 6px 12px;
  overflow: hidden;

  span.label {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
  }
`;

const CloseIcon = styled.span`
  font-size: 14px;
  position: absolute;
  top: 0;
  left: 0;
  color: #999;
  cursor: pointer;
  visibility: hidden;
  padding-left: 4px;

  &:hover {
    color: #e1e1e1;
  }
`;

const TabWrapper = styled.div`
  position: relative;
  width: 14px;
  height: 14px;

  &:hover ${CloseIcon} {
    visibility: visible;
  }

  &:hover ${UnsavedDot} {
    visibility: hidden;
  }
`;

type TabState = RequestTabState | CollectionTabState | FolderTabState | DocumentationTabState;

const isRequestTab = (tab: TabState): tab is RequestTabState => tab.type === 'request';
const isCollectionTab = (tab: TabState): tab is CollectionTabState => tab.type === 'collection';
const isFolderTab = (tab: TabState): tab is FolderTabState => tab.type === 'folder';

const MainContentTabs: React.FC = () => {
  const [tabs, setTabs] = useState<TabState[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [tabCounter, setTabCounter] = useState(1);
  const [tabToClose, setTabToClose] = useState<number | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const activeCollectionId = useCollectionStore(state => state.activeCollectionId);
  const activeRequestId = useCollectionStore(state => state.activeRequestId);
  const activeFolderId = useCollectionStore(state => state.activeFolderId);
  const getActiveRequest = useCollectionStore(state => state.getActiveRequest);
  const getActiveCollection = useCollectionStore(state => state.getActiveCollection);
  const getActiveFolder = useCollectionStore(state => state.getActiveFolder);
  const setActiveRequest = useCollectionStore(state => state.setActiveRequest);
  const setActiveCollection = useCollectionStore(state => state.setActiveCollection);
  const setActiveFolder = useCollectionStore(state => state.setActiveFolder);
  const updateRequest = useCollectionStore(state => state.updateRequest);
  const updateCollection = useCollectionStore(state => state.updateCollection);
  const updateFolder = useCollectionStore(state => state.updateFolder);
  const addRequestToLocation = useCollectionStore(state => state.addRequestToLocation);

  const updateTabWithChanges = (tab: TabState, newState: Partial<TabState>): TabState => {
    if (isRequestTab(tab) && ('method' in newState || 'url' in newState || 'queryParams' in newState || 'headers' in newState || 'auth' in newState || 'body' in newState || 'response' in newState)) {
      return { ...tab, ...newState } as RequestTabState;
    } else if (isCollectionTab(tab) && ('description' in newState || 'auth' in newState || 'variables' in newState)) {
      return { ...tab, ...newState } as CollectionTabState;
    } else if (isFolderTab(tab) && ('description' in newState || 'auth' in newState)) {
      return { ...tab, ...newState } as FolderTabState;
    }
    return tab;
  };

  const checkForChanges = (tab: TabState, updatedTab: TabState): boolean => {
    if (isRequestTab(tab) && isRequestTab(updatedTab) && tab.originalState) {
      const orig = tab.originalState;
      return (
        orig.method !== updatedTab.method ||
        orig.url !== updatedTab.url ||
        JSON.stringify(orig.queryParams) !== JSON.stringify(updatedTab.queryParams) ||
        JSON.stringify(orig.headers) !== JSON.stringify(updatedTab.headers) ||
        JSON.stringify(orig.auth) !== JSON.stringify(updatedTab.auth) ||
        JSON.stringify(orig.body) !== JSON.stringify(updatedTab.body)
      );
    } else if (isCollectionTab(tab) && isCollectionTab(updatedTab) && tab.originalState) {
      const orig = tab.originalState;
      return (
        JSON.stringify(orig.description) !== JSON.stringify(updatedTab.description) ||
        JSON.stringify(orig.auth) !== JSON.stringify(updatedTab.auth) ||
        JSON.stringify(orig.variables) !== JSON.stringify(updatedTab.variables)
      );
    } else if (isFolderTab(tab) && isFolderTab(updatedTab) && tab.originalState) {
      const orig = tab.originalState;
      return (
        JSON.stringify(orig.description) !== JSON.stringify(updatedTab.description) ||
        JSON.stringify(orig.auth) !== JSON.stringify(updatedTab.auth)
      );
    }
    return false;
  };

  const handleTabStateChange = (tabId: number, newState: Partial<TabState>) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id !== tabId) return tab;

      const updatedTab = updateTabWithChanges(tab, newState);
      const hasChanges = checkForChanges(tab, updatedTab);

      return { ...updatedTab, hasUnsavedChanges: hasChanges };
    }));
  };

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
        body: convertRequestBodyToTabBody(request.body),
        response: request.response || [],
        hasUnsavedChanges: false,
        originalState: {
          method: request.method || 'GET',
          url: request.url || '',
          queryParams: request.queryParams || [],
          headers: request.headers || [],
          auth: request.auth || { type: 'none', credentials: {} },
          body: convertRequestBodyToTabBody(request.body),
          response: request.response || []
        }
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
        body: { mode: 'none' },
        hasUnsavedChanges: false,
        originalState: {
          method: 'GET',
          url: '',
          queryParams: [],
          headers: [],
          auth: { type: 'none', credentials: {} },
          body: { mode: 'none' }
        }
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
      variables: collection.variables || [],
      hasUnsavedChanges: false,
      originalState: {
        description: collection.description || '',
        auth: collection.auth || { type: 'none', credentials: {} },
        variables: collection.variables || []
      }
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
    setTabCounter(prev => prev + 1);
    return newTab;
  };

  const createNewFolderTab = (collectionId: string, folderId: string) => {
    const folder = getActiveFolder();
    if (!folder) return null;
    
    const newTab: FolderTabState = {
      id: tabCounter,
      type: 'folder',
      title: folder.name || 'New Folder',
      collectionId,
      folderId,
      description: folder.description || '',
      auth: folder.auth || { type: 'none', credentials: {} },
      hasUnsavedChanges: false,
      originalState: {
        description: folder.description || '',
        auth: folder.auth || { type: 'none', credentials: {} }
      }
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
    setTabCounter(prev => prev + 1);
    return newTab;
  };

  const createDocumentationTab = (collectionId: string, title: string, content: string = '') => {
    const newTab: DocumentationTabState = {
      id: tabCounter,
      type: 'documentation',
      title,
      collectionId,
      content,
      hasUnsavedChanges: false,

    };
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
    const tab = tabs.find(t => t.id === id);
    if (tab?.hasUnsavedChanges) {
      setTabToClose(id);
      setShowUnsavedModal(true);
    } else {
      closeTab(id);
    }
  };

  const closeTab = (id: number) => {
    setTabs(prevTabs => {
      const tabIndex = prevTabs.findIndex(t => t.id === id);
      const closingTab = prevTabs.find(t => t.id === id);
      const newTabs = prevTabs.filter(t => t.id !== id);
  
      // Update active tab
      if (activeTab === id) {
        const nextTab = newTabs[tabIndex] || newTabs[tabIndex - 1] || null;
        setActiveTab(nextTab ? nextTab.id : null);
  
        // 🧠 Reset sidebar state based on the closed tab type
        if (closingTab?.type === 'request') {
          setActiveRequest(null);
          setActiveFolder(null);
          setActiveCollection(null);
        } else if (closingTab?.type === 'folder') {
          setActiveFolder(null);
          setActiveCollection(null);
        } else if (closingTab?.type === 'collection') {
          setActiveCollection(null);
        }
      }
  
      return newTabs;
    });
  };
  
  
  const handleSaveTab = async (tab: TabState) => {
    if (!tab.collectionId) {
      setShowSaveModal(true);
      return;
    }

    // Save to existing location
    if (isRequestTab(tab) && tab.requestId) {
      const requestBody = convertTabBodyToRequestBody(tab.body);
      await updateRequest(tab.collectionId, tab.requestId, {
        method: tab.method,
        url: tab.url,
        queryParams: tab.queryParams,
        headers: tab.headers,
        auth: tab.auth,
        body: requestBody,
        response: tab.response || []
      });
    } else if (isCollectionTab(tab)) {
      await updateCollection(tab.collectionId, {
        description: tab.description,
        auth: tab.auth,
        variables: tab.variables
      });
    } else if (isFolderTab(tab) && tab.folderId) {
      await updateFolder(tab.collectionId, tab.folderId, {
        description: tab.description,
        auth: tab.auth
      });
    }

    // Update tab state
    setTabs(prev => prev.map(t => {
      if (t.id !== tab.id) return t;
      
      const updatedTab = { ...t, hasUnsavedChanges: false };
      if (isRequestTab(updatedTab)) {
        return {
          ...updatedTab,
          originalState: {
            method: updatedTab.method,
            url: updatedTab.url,
            queryParams: updatedTab.queryParams,
            headers: updatedTab.headers,
            auth: updatedTab.auth,
            body: updatedTab.body
          }
        };
      } else if (isCollectionTab(updatedTab)) {
        return {
          ...updatedTab,
          originalState: {
            description: updatedTab.description,
            auth: updatedTab.auth,
            variables: updatedTab.variables
          }
        };
      } else if (isFolderTab(updatedTab)) {
        return {
          ...updatedTab,
          originalState: {
            description: updatedTab.description,
            auth: updatedTab.auth
          }
        };
      }
      return updatedTab;
    }));

    //close tab
    closeTab(tab.id);
  };

  const getCurrentTab = () => tabs.find(tab => tab.id === activeTab) || null;

  const renderTabContent = () => {
    const currentTab = getCurrentTab();
    if (!currentTab) return null;

    const content = (() => {
      switch (currentTab.type) {
        case 'request':
          return (
            <RequestPane
              tabState={currentTab}
              onStateChange={(newState: Partial<RequestTabState>) => handleTabStateChange(currentTab.id, newState)}
            />
          );
        case 'collection':
          return (
            <CollectionPane
              tabState={currentTab}
              onStateChange={(newState: Partial<CollectionTabState>) => handleTabStateChange(currentTab.id, newState)}
              openDocumentationTab={(collectionId, title, content) => createDocumentationTab(collectionId, title, content)}

            />
          );
        case 'folder': {
          // Convert FolderTabState to APIFolder
          const folderData: APIFolder = {
            id: currentTab.folderId,
            name: currentTab.title,
            description: currentTab.description || '',
            auth: currentTab.auth || { type: 'none', credentials: {} },
            folders: [],
            requests: []
          };

          return (
            <FolderPane
              folder={folderData}
              onUpdate={(updates: Partial<APIFolder>) => {
                const tabUpdates: Partial<FolderTabState> = {
                  description: updates.description,
                  auth: updates.auth
                };
                handleTabStateChange(currentTab.id, tabUpdates);
              }}
            />
          );
        }
        case 'documentation':
            return (
                <DocumentationPane
                    tabState={currentTab as DocumentationTabState}
                />
            );
      }
    })();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <PaneHeader
          title={currentTab.title}
          hasUnsavedChanges={currentTab.hasUnsavedChanges}
          onSave={() => handleSaveTab(currentTab)}
        />
        {content}
      </div>
    );
  };

  return (
    <>
      <ScrollbarArea>
        {tabs.length > 0 && <TabBarWrapper row>
          {tabs.map((tab) => (
            <MainTab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className="label">
              {tab.title}
            </span>
            <TabWrapper>
              {tab.hasUnsavedChanges && <UnsavedDot />}
              <CloseIcon className="close" onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}>
                <FiX />
                </CloseIcon>
            </TabWrapper>
          </MainTab>
        ))}
        </TabBarWrapper>}
        <AddButton style={{marginTop: '8px'}} onClick={handleAddTab}>
          <FiPlus />
        </AddButton>
      </ScrollbarArea>

      {renderTabContent()}

      {showUnsavedModal && (
        <UnsavedChangesModal
          isOpen={showUnsavedModal}
          onClose={() => setShowUnsavedModal(false)}
        onSave={() => {
          if (tabToClose !== null) {
            const tab = tabs.find(t => t.id === tabToClose);
            if (tab) {
              handleSaveTab(tab);
              // closeTab(tabToClose);
            }
          }
          setShowUnsavedModal(false);
          setTabToClose(null);
        }}
        onDiscard ={() => {
          const tab = tabs.find(t => t.id === tabToClose);
          if (!tab) return;
        
          // Revert store
          if (isRequestTab(tab) && tab.originalState && tab.collectionId && tab.requestId) {
            updateRequest(tab.collectionId, tab.requestId, {
              method: tab.originalState.method,
              url: tab.originalState.url,
              queryParams: tab.originalState.queryParams,
              headers: tab.originalState.headers,
              auth: tab.originalState.auth,
              body: {
                mode: tab.originalState.body.mode,
                raw: tab.originalState.body.raw,
                options: tab.originalState.body.options,
                formData: tab.originalState.body.formData,
                urlencoded: tab.originalState.body.urlencoded,
                file: tab.originalState.body.file,
              },
              response: tab.originalState.response || [],
            });
          }
          
          // Close the tab after discard
          // setTabs(prev => prev.filter(t => t.id !== tabToClose));
          closeTab(tab.id);
          // Hide modal
          setShowUnsavedModal(false);
        }}
        
        />
      )}

      {showSaveModal && (
        <SaveToCollectionModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
        onSave={(name, selectedLocationId) => {
          // Handle saving to new location
          const currentTab = getCurrentTab();
          if (currentTab) {
            // TODO: Implement saving to new location
            addRequestToLocation(selectedLocationId, name, currentTab as RequestTabState);
            closeTab(currentTab.id);
          }
          setShowSaveModal(false);
        }}
          type={getCurrentTab()?.type || 'request'}
        />
      )}
    </>
  );
};

export default MainContentTabs;
