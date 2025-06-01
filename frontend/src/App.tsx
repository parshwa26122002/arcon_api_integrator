import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ImportAPI from './components/collection/ImportAPI';
import SidebarTabs from './components/sidebar/Sidebar';
import { useCollectionStore } from './store/collectionStore';
import MainContentTabs from './components/maincontenttabs/MainContentTabs';
import AuthFileUploader from './components/auth/AuthFileUploader';
import { isAuthenticated } from './components/auth/useAuth';
import { FiSun, FiMoon } from 'react-icons/fi';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: var(--color-bg);
  position: relative;
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-panel);
  border-right: 1px solid var(--color-border);
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

const ThemeToggleButton = styled.button`
  position: absolute;
  top: 16px;
  right: 24px;
  z-index: 100;
  background: var(--color-panel);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: var(--color-panel-alt);
  }
`;

function getPreferredTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

const App: React.FC = () => {
  const initialize = useCollectionStore(state => state.initialize);
  const [isLoading, setIsLoading] = useState(true);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [theme, setTheme] = useState(() => {
    const preferredTheme = getPreferredTheme();
    console.log('Initial theme:', preferredTheme); // Debug log
    return preferredTheme;
  });

  // Handle theme initialization
  useEffect(() => {
    console.log('Theme effect running, current theme:', theme); // Debug log
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
    setIsThemeLoaded(true);
  }, [theme]);

  // Handle authentication check after theme is loaded
  useEffect(() => {
    if (!isThemeLoaded) return;
    
    console.log('Checking authentication...'); // Debug log
    const auth = isAuthenticated();
    console.log('Authentication result:', auth); // Debug log
    setAuthenticated(auth);
    setIsLoading(false);
  }, [isThemeLoaded]);

  // Initialize store after authentication
  useEffect(() => {
    if (authenticated) {
      console.log('Initializing store...'); // Debug log
      initialize();
    }
  }, [authenticated, initialize]);

  if (isLoading || !isThemeLoaded) {
    console.log('Showing loading spinner...'); // Debug log
    return <LoadingSpinner />;
  }

  if (!authenticated) {
    console.log('Showing auth uploader...'); // Debug log
    return (
      <>
        <ThemeToggleButton 
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </ThemeToggleButton>
        <AuthFileUploader onAuthenticated={() => {
          console.log('Auth callback triggered'); // Debug log
          setAuthenticated(true);
        }} />
      </>
    );
  }
  
  return (
    <AppContainer>
      <ThemeToggleButton
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <FiSun /> : <FiMoon />}
      </ThemeToggleButton>
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
