import React, { useState } from 'react';
import styled from 'styled-components';
import CollectionSidebar from '../collection/CollectionSidebar';
import { Tab } from '../../styled-component/Tab';

const SidebarContainer = styled.div`
  background-color: #2d2d2d;
  border-right: 1px solid #4a4a4a;
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100%;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #4a4a4a;
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const HistoryContainer = styled.div`
  padding: 16px;
  color: #e1e1e1;
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