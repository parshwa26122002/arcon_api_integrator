import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import styled from 'styled-components';
import RequestPane from '../requestpane/RequestPane';
import CollectionPane from '../collectionpane/CollectionPane';
import { AddButton } from '../../styled-component/AddButton';
import { Tab } from '../../styled-component/Tab';
import { useCollectionStore, type CollectionTabState, type RequestTabState } from '../../store/collectionStore';
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
  const [tabs, setTabs] = useState<(RequestTabState | CollectionTabState)[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [tabCounter, setTabCounter] = useState(1);

  const activeCollectionId = useCollectionStore(state => state.activeCollectionId);
  const activeRequestId = useCollectionStore(state => state.activeRequestId);
  const getActiveRequest = useCollectionStore(state => state.getActiveRequest);
  const getActiveCollection = useCollectionStore(state => state.getActiveCollection);
  const updateRequest = useCollectionStore(state => state.updateRequest);
  const updateCollection = useCollectionStore(state => state.updateCollection);

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

  useEffect(() => {
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
    } else if (activeCollectionId && !activeRequestId) {
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
  }, [activeCollectionId, activeRequestId]);

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

  const handleTabStateChange = (tabId: number, newState: Partial<RequestTabState | CollectionTabState>) => {
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
          }
        }
        return tab;
      })
    );
  };

  const getCurrentTab = () => tabs.find(tab => tab.id === activeTab) || null;

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
              title="Close"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseTab(tab.id);
              }}
            >
              ×
            </CloseIcon>
          </MainTab>
        ))}
        <AddButton onClick={handleAddTab} title="New Request">
          <FiPlus />
        </AddButton>
      </TabBarWrapper>

      <div className="flex-1 p-4 bg-white overflow-auto">
        {activeTab && getCurrentTab() ? (
          getCurrentTab()?.type === 'request' ? (
            <RequestPane
              tabState={getCurrentTab() as RequestTabState}
              onStateChange={(newState: Partial<RequestTabState>) => handleTabStateChange(activeTab, newState)}
            />
          ) : (
            <CollectionPane
              tabState={getCurrentTab() as CollectionTabState}
              onStateChange={(newState: Partial<CollectionTabState>) => handleTabStateChange(activeTab, newState)}
            />
          )
        ) : (
          <div className="text-gray-500 text-lg">Create a new Request</div>
        )}
      </div>
    </div>
  );
};

export default MainContentTabs;
