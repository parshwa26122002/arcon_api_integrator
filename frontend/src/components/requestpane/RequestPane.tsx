import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import styled from 'styled-components';
import QueryParams from './QueryParams';
import Authorization from './Authorization';
import Headers from './Headers';
import RequestBody from './RequestBody';
import { useCollectionStore, type APIRequest } from '../../store/collectionStore';

// HTTP Methods with their corresponding colors
const HTTP_METHODS = {
  GET: '#61affe',
  POST: '#49cc90',
  PUT: '#fca130',
  DELETE: '#f93e3e'
} as const;

type HttpMethod = APIRequest['method'];

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
  // Subscribe only to specific state values we need
  const activeCollectionId = useCollectionStore(state => state.activeCollectionId);
  const activeRequestId = useCollectionStore(state => state.activeRequestId);
  const updateRequest = useCollectionStore(state => state.updateRequest);
  const request = useCollectionStore(state => {
    const collection = state.collections.find(c => c.id === state.activeCollectionId);
    return collection?.requests.find(r => r.id === state.activeRequestId) || null;
  });

  const [activeTab, setActiveTab] = useState<'params' | 'auth' | 'headers' | 'body'>('params');
  const [response, setResponse] = useState<string>('// Response will appear here');

  const handleMethodChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, {
        method: e.target.value as HttpMethod
      });
    }
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, {
        url: e.target.value
      });
    }
  };

  const handleSend = async () => {
    if (!request) return;

    if (!request.url) {
      setResponse('Error: Please enter a URL');
      return;
    }

    try {
      // Prepare request body and determine content type
      let bodyToSend = undefined;
      let contentTypeHeader = request.contentType;

      if (request.body) {
        switch (request.body.mode) {
          case 'raw':
            bodyToSend = request.body.raw;
            // Set content type based on raw body language
            if (request.body.options?.raw?.language === 'json') {
              contentTypeHeader = 'application/json';
            } else if (request.body.options?.raw?.language === 'xml') {
              contentTypeHeader = 'application/xml';
            } else if (request.body.options?.raw?.language === 'html') {
              contentTypeHeader = 'text/html';
            } else {
              contentTypeHeader = 'text/plain';
            }
            break;
          case 'formdata':
            const formData = new FormData();
            request.body.formdata?.forEach(item => {
              if (item.key && item.value) {
                formData.append(item.key, item.value);
              }
            });
            bodyToSend = formData;
            // Don't set Content-Type for FormData, browser will set it automatically with boundary
            contentTypeHeader = '';  // Use empty string instead of undefined
            break;
          case 'urlencoded':
            const params = new URLSearchParams();
            request.body.urlencoded?.forEach(item => {
              if (item.key && item.value) {
                params.append(item.key, item.value);
              }
            });
            bodyToSend = params.toString();
            contentTypeHeader = 'application/x-www-form-urlencoded';
            break;
        }
      }

      // Initialize headers object
      const headers: Record<string, string> = {};

      // Add authorization headers based on auth type
      if (request.auth.type === 'basic') {
        const { username, password } = request.auth.credentials;
        if (username && password) {
          const base64Credentials = btoa(`${username}:${password}`);
          headers['Authorization'] = `Basic ${base64Credentials}`;
        }
      } else if (request.auth.type === 'bearer') {
        const { token } = request.auth.credentials;
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else if (request.auth.type === 'apiKey') {
        const { key, value } = request.auth.credentials;
        if (key && value) {
          headers[key] = value;
        }
      }

      // Add custom headers from the Headers tab
      request.headers.forEach(header => {
        if (header.key && header.value) {
          headers[header.key] = header.value;
        }
      });

      // Set content type if not already set and we have a content type to set
      if (!headers['Content-Type'] && contentTypeHeader) {
        headers['Content-Type'] = contentTypeHeader;
      }

      // Build URL with query parameters
      let finalUrl: URL;
      try {
        finalUrl = new URL(request.url);
        request.queryParams.forEach(param => {
          if (param.key) {
            finalUrl.searchParams.append(param.key, param.value || '');
          }
        });
      } catch (error) {
        setResponse(`Error: Invalid URL - ${request.url}`);
        return;
      }

      console.log('Sending request through proxy:', {
        url: finalUrl.toString(),
        method: request.method,
        headers,
        body: bodyToSend
      });

      // Prepare the proxy request body
      let proxyBody: any = {
        url: finalUrl.toString(),
        method: request.method,
        headers,
      };

      // Only add body if it exists and method is not GET
      if (bodyToSend !== undefined && request.method !== 'GET') {
        if (bodyToSend instanceof FormData) {
          // Convert FormData to an object
          const formDataObj: Record<string, string> = {};
          bodyToSend.forEach((value, key) => {
            formDataObj[key] = value.toString();
          });
          proxyBody.body = formDataObj;
        } else {
          proxyBody.body = bodyToSend;
        }
      }

      // Make the request through the proxy
      const response = await fetch('http://localhost:4000/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': 'identity'
        },
        body: JSON.stringify(proxyBody)
      });

      // Handle different response types
      try {
        const contentType = response.headers.get('content-type');
        const responseText = await response.text();
        
        if (contentType?.includes('application/json')) {
          try {
            const jsonData = JSON.parse(responseText);
            setResponse(JSON.stringify(jsonData, null, 2));
          } catch {
            setResponse(responseText);
          }
        } else {
          setResponse(responseText);
        }

        console.log('Response received:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
      } catch (error) {
        console.error('Failed to process response:', error);
        setResponse(`Error: ${(error as Error).message}`);
      }
    } catch (error) {
      console.error('Request failed:', error);
      setResponse(`Error: ${(error as Error).message}`);
    }
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
          value={request?.method || 'GET'} 
          onChange={handleMethodChange}
          method={(request?.method || 'GET') as HttpMethod}
          disabled={!request}
        >
          {Object.keys(HTTP_METHODS).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </MethodSelect>
        <UrlInput 
          type="text" 
          placeholder="Enter request URL"
          value={request?.url || ''}
          onChange={handleUrlChange}
          disabled={!request}
        />
        <ButtonGroup>
          <SendButton onClick={handleSend} disabled={!request}>Send</SendButton>
        </ButtonGroup>
      </TopBar>

      <SplitContainer>
        <RequestSection>
          <TabList>
            <Tab
              active={activeTab === 'params'}
              onClick={() => setActiveTab('params')}
            >
              Query Params
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
            {response}
          </ResponseContent>
        </ResponseSection>
      </SplitContainer>
    </Container>
  );
};

export default RequestPane;
