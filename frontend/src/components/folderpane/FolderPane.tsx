import React, { useState } from 'react';
import styled from 'styled-components';
import Authorization from '../requestpane/Authorization';
import { Tab } from '../../styled-component/Tab';
import { type APIFolder } from '../../store/collectionStore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 50px);
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid #4a4a4a;
  padding: 0 16px;
`;

const TabContent = styled.div`
  padding: 20px;
  color: #e1e1e1;
  flex: 1;
  overflow-y: auto;
`;

const FolderTitle = styled.h2`
  color: #e1e1e1;
  margin: 0 0 16px 0;
  font-size: 24px;
`;

const Description = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 12px;
  background-color: #383838;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }

  &::placeholder {
    color: #888;
  }
`;

interface FolderPaneProps {
  folder: APIFolder;
  onUpdate: (updates: Partial<APIFolder>) => void;
}

const FolderPane: React.FC<FolderPaneProps> = ({ folder, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'auth'>('overview');

  const handleDescriptionChange = (description: string) => {
    onUpdate({ description });
  };

  const handleAuthChange = (auth: { type: string; credentials: Record<string, string> }) => {
    onUpdate({ auth });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <TabContent>
            <FolderTitle>{folder.name}</FolderTitle>
            <Description
              value={folder.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Add a description for this folder..."
            />
          </TabContent>
        );
      case 'auth':
        return (
          <TabContent>
            <Authorization
              auth={folder.auth || { type: 'none', credentials: {} }}
              onChange={handleAuthChange}
            />
          </TabContent>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <TabList>
        <Tab
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Tab>
        <Tab
          active={activeTab === 'auth'}
          onClick={() => setActiveTab('auth')}
        >
          Authorization
        </Tab>
      </TabList>
      {renderTabContent()}
    </Container>
  );
};

export default FolderPane; 