import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ImportAPI from './components/collection/ImportAPI';
import SidebarTabs from './components/sidebar/Sidebar';
import { useCollectionStore } from './store/collectionStore';
import MainContentTabs from './components/maincontenttabs/MainContentTabs';
import AuthFileUploader from './components/auth/AuthFileUploader';
import { isAuthenticated } from './components/auth/useAuth';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #1e1e1e;
  position: relative;
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #2d2d2d;
  border-right: 1px solid #4a4a4a;
  position: relative;
  z-index: 2;
  height: 100%;
  min-width: 250px;
  max-width: 300px;
  overflow-y: auto;  
`;

const ImportSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #4a4a4a;
`;

const SidebarSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; 
`;

const MainContent = styled.div`
  flex: 1;
  height: 100%;
  overflow: hidden; 
  display: flex;
  flex-direction: column;
`;



const App: React.FC = () => {
  const initialize = useCollectionStore(state => state.initialize);

const [authenticated, setAuthenticated] = useState<boolean>(isAuthenticated());

  useEffect(() => {

    if (authenticated) {
      initialize();
    }
  }, [authenticated, initialize]);

  if (!authenticated) {
    return <AuthFileUploader onAuthenticated={() => setAuthenticated(true)} />;
  }
  
  return (
    <AppContainer>
      <LeftPanel>
        <ImportSection>
          <ImportAPI />
        </ImportSection>
        <SidebarSection>
          <SidebarTabs />
        </SidebarSection>
      </LeftPanel>
      <MainContent>
        <MainContentTabs />
      </MainContent>
    </AppContainer>

  );
};

export default App;
