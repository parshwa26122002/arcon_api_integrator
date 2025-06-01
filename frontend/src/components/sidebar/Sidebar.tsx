import React, { useState } from 'react';
import styled from 'styled-components';
import CollectionSidebar from '../collection/CollectionSidebar';
import { Tab } from '../../styled-component/Tab';
// import CollectionSidebar2 from '../collection/CollectionSidebar2';

const SidebarContainer = styled.div`
  background-color: var(--color-panel);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100%;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-border);
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const HistoryContainer = styled.div`
  padding: 16px;
  color: var(--color-text);
`;

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'collection' | 'history'>('collection');

  return (
    <SidebarContainer>
      <TabContainer>
        <Tab
          active={activeTab === 'collection'}
          onClick={() => setActiveTab('collection')}
        >
          Collection
        </Tab>
        <Tab
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          History
        </Tab>
      </TabContainer>
      
      <ContentContainer>
        {activeTab === 'collection' ? (
          <CollectionSidebar />
        ) : (
          <HistoryContainer>
            {/* History content will be implemented later */}
            <p>Request history will appear here</p>
          </HistoryContainer>
        )}
      </ContentContainer>
    </SidebarContainer>
  );
};

export default Sidebar;