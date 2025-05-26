import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import styled from 'styled-components';
import RequestPane from '../requestpane/RequestPane';
import { AddButton } from '../../styled-component/AddButton';
import { Tab } from '../../styled-component/Tab';
import { useCollectionStore, type APIRequest, type TabState } from '../../store/collectionStore';
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
  const [tabs, setTabs] = useState<TabState[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [tabCounter, setTabCounter] = useState(1);

  const activeCollectionId = useCollectionStore(state => state.activeCollectionId);
  const activeRequestId = useCollectionStore(state => state.activeRequestId);
  const getActiveRequest = useCollectionStore(state => state.getActiveRequest);
  const updateRequest = useCollectionStore(state => state.updateRequest);

  const createNewTab = (collectionId?: string, requestId?: string) => {
    let newTab: TabState;

    if (collectionId && requestId) {
      const request = getActiveRequest();
      if (!request) return null;
      newTab = {
        id: tabCounter,
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

  useEffect(() => {
    if (activeCollectionId && activeRequestId) {
      const existingTab = tabs.find(
        tab => tab.collectionId === activeCollectionId && tab.requestId === activeRequestId
      );
      if (existingTab) {
        setActiveTab(existingTab.id);
      } else {
        createNewTab(activeCollectionId, activeRequestId);
      }
    }
  }, [activeCollectionId, activeRequestId]);

  const handleAddTab = () => {
    createNewTab();
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

  const handleTabStateChange = (tabId: number, newState: Partial<TabState>) => {
    setTabs(prevTabs =>
      prevTabs.map(tab => {
        if (tab.id === tabId) {
          const updatedTab = { ...tab, ...newState };
          if (tab.collectionId && tab.requestId) {
            const collectionUpdate: Partial<APIRequest> = {
              method: newState.method,
              url: newState.url,
              queryParams: newState.queryParams,
              headers: newState.headers,
              auth: newState.auth,
              body: newState.body ? convertTabBodyToRequestBody(newState.body) : undefined
            };
            updateRequest(tab.collectionId, tab.requestId, collectionUpdate);
          }
          return updatedTab;
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
          <RequestPane
            tabState={getCurrentTab()!}
            onStateChange={(newState) => handleTabStateChange(activeTab, newState)}
          />
        ) : (
          <div className="text-gray-500 text-lg">Create a new Request</div>
        )}
      </div>
    </div>
  );
};

export default MainContentTabs;
