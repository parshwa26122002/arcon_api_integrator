import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import styled from 'styled-components';
import { FiSave } from 'react-icons/fi';
import QueryParams from './QueryParams';
import Authorization from './Authorization';
import Headers from './Headers';
import RequestBody from './RequestBody';

// HTTP Methods with their corresponding colors
const HTTP_METHODS = {
  GET: '#61affe',
  POST: '#49cc90',
  PUT: '#fca130',
  DELETE: '#f93e3e',
  PATCH: '#50e3c2',
  HEAD: '#9012fe',
  OPTIONS: '#0d5aa7'
} as const;

type HttpMethod = keyof typeof HTTP_METHODS;

interface StyledMethodSelectProps {
  method: HttpMethod;
}

interface StyledTabProps {
  active: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 32px); // Full height minus padding
`;

const TopBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  background-color: #383838;
  padding: 8px;
  border-radius: 6px;
`;

const MethodSelect = styled.select<StyledMethodSelectProps>`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #4a4a4a;
  background-color: ${(props: StyledMethodSelectProps) => HTTP_METHODS[props.method]};
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  min-width: 100px;
  &:hover {
    opacity: 0.9;
  }
  option {
    background-color: #2d2d2d;
  }
`;

const UrlInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #4a4a4a;
  background-color: #1e1e1e;
  color: #e1e1e1;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const SendButton = styled.button`
  padding: 8px 20px;
  border-radius: 4px;
  border: none;
  background-color: #4a4a4a;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  &:hover {
    background-color: #5a5a5a;
  }
`;

const IconButton = styled.button`
  padding: 8px;
  border-radius: 4px;
  border: none;
  background-color: #4a4a4a;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  &:hover {
    background-color: #5a5a5a;
  }
`;

const TabContainer = styled.div`
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  background-color: #383838;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid #4a4a4a;
  padding: 0 16px;
`;

const Tab = styled.button<StyledTabProps>`
  padding: 12px 24px;
  border: none;
  background-color: transparent;
  color: ${props => props.active ? '#e1e1e1' : '#999999'};
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : 'normal'};
  font-size: 14px;
  border-bottom: 2px solid ${props => props.active ? '#7d4acf' : 'transparent'};
  transition: all 0.2s;
  &:hover {
    color: #e1e1e1;
    background-color: #404040;
  }
`;

const SplitContainer = styled.div`
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0; // Important for proper scrolling
`;

const RequestSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #383838;
  border-radius: 6px;
  border: 1px solid #4a4a4a;
`;

const ResponseSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #383838;
  border-radius: 6px;
  border: 1px solid #4a4a4a;
`;

const ResponseHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #4a4a4a;
  font-weight: 600;
  color: #e1e1e1;
`;

const ResponseContent = styled.div`
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  color: #e1e1e1;
  background-color: #2d2d2d;
  border-radius: 0 0 6px 6px;
`;

const TabContent = styled.div`
  padding: 20px;
  color: #e1e1e1;
  flex: 1;
  overflow-y: auto;
`;

const RequestPane: React.FC = () => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'params' | 'auth' | 'headers' | 'body'>('params');
  const [response, setResponse] = useState<string>('// Response will appear here');

  const handleSend = () => {
    // TODO: Implement actual API call
    setResponse(JSON.stringify({
      status: 200,
      statusText: 'OK',
      data: {
        message: 'This is a sample response'
      }
    }, null, 2));
  };

  const handleSave = () => {
    console.log('Saving request:', { method, url });
  };

  const handleMethodChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setMethod(e.target.value as HttpMethod);
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'params':
        return <QueryParams />;
      case 'auth':
        return <Authorization />;
      case 'headers':
        return <Headers />;
      case 'body':
        return <RequestBody />;
      default:
        return null;
    }
  };

  return (
    <Container>
      <TopBar>
        <MethodSelect
          value={method}
          onChange={handleMethodChange}
          method={method}
        >
          {Object.keys(HTTP_METHODS).map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </MethodSelect>
        <UrlInput
          type="text"
          placeholder="Enter request URL"
          value={url}
          onChange={handleUrlChange}
        />
        <ButtonGroup>
          <SendButton onClick={handleSend}>Send</SendButton>
          <IconButton onClick={handleSave} title="Save Request">
            <FiSave size={18} />
          </IconButton>
        </ButtonGroup>
      </TopBar>

      <SplitContainer>
        <RequestSection>
          <TabList>
            <Tab
              active={activeTab === 'params'}
              onClick={() => setActiveTab('params')}
            >
              Params
            </Tab>
            <Tab
              active={activeTab === 'auth'}
              onClick={() => setActiveTab('auth')}
            >
              Authorization
            </Tab>
            <Tab
              active={activeTab === 'headers'}
              onClick={() => setActiveTab('headers')}
            >
              Headers
            </Tab>
            <Tab
              active={activeTab === 'body'}
              onClick={() => setActiveTab('body')}
            >
              Body
            </Tab>
          </TabList>
          <TabContent>
            {renderTabContent()}
          </TabContent>
        </RequestSection>

        <ResponseSection>
          <ResponseHeader>Response</ResponseHeader>
          <ResponseContent>
            <pre>{response}</pre>
          </ResponseContent>
        </ResponseSection>
      </SplitContainer>
    </Container>
  );
};

export default RequestPane;
