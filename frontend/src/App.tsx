import React from 'react';
import styled from 'styled-components';
import RequestPane from './components/requestpane/RequestPane';
import ImportAPI from './components/collection/ImportAPI';
import SidebarTabs from './components/sidebar/Sidebar';

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
`;

const ImportSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #4a4a4a;
`;

const SidebarSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100% - 65px); /* Subtract ImportSection height */
`;

const MainContent = styled.div`
  flex: 1;
  padding: 16px;
  overflow: hidden;
  position: relative;
  z-index: 1;
`;

const App: React.FC = () => {
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
        <RequestPane />
      </MainContent>
    </AppContainer>
  );
};

export default App;
