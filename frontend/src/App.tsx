import React from 'react';
import RequestPane from './components/requestpane/RequestPane';
import styled from 'styled-components';

const AppContainer = styled.div`
  background-color: #1e1e1e;
  min-height: 100vh;
  color: #e1e1e1;
  display: flex;
`;

const Sidebar = styled.div`
  width: 300px;
  background-color: #252525;
  border-right: 1px solid #383838;
  padding: 16px;
  /* Future scope for collections */
`;

const MainContent = styled.div`
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  padding: 16px;
`;

const App: React.FC = () => {
  return (
    <AppContainer>
      <Sidebar>
        {/* Future scope for collections */}
      </Sidebar>
      <MainContent>
        <RequestPane />
      </MainContent>
    </AppContainer>
  );
};

export default App;
