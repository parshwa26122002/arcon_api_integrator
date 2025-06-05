import React, { useState, useCallback, useMemo, useRef } from 'react';
import type { ChangeEvent } from 'react';
import styled from 'styled-components';
import QueryParams from './QueryParams';
import Authorization from './Authorization';
import Headers from './Headers';
import RequestBody from './RequestBody';
import { getNearestParentAuth, useCollectionStore, type FormDataItem, type Header, type HttpMethod, type QueryParam, type RequestTabState, type UrlEncodedItem } from '../../store/collectionStore';
import { Tab } from '../../styled-component/Tab';
import { Editor } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { FiCheckCircle, FiCopy, FiSave, FiSearch, FiTrash2, FiX } from 'react-icons/fi';
import { processRequestWithVariables } from '../../utils/variableUtils';
import { isElectron } from '../../utils/env';

// HTTP Methods with their corresponding colors
const HTTP_METHODS = {
    GET: '#61affe',
    POST: '#49cc90',
    PUT: '#fca130',
    DELETE: '#f93e3e',
    PATCH: '#f582ea',
    OPTIONS: '#959da5',
    HEAD: '#959da5'
} as const;



interface StyledMethodSelectProps {
    method: HttpMethod;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: var(--color-panel);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 80px);
  min-height: 0;
`;

const TopBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  background-color: var(--color-panel-alt);
  padding: 8px;
  border-radius: 6px;
  flex-shrink: 0;
`;

const MethodSelect = styled.select<StyledMethodSelectProps>`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: ${({ method }) => HTTP_METHODS[method] || 'var(--color-tab-active)'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  min-width: 100px;
  &:hover {
    opacity: 0.9;
  }
  option {
    background-color: var(--color-panel);
    color: black;
  }
`;

const UrlInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: var(--color-panel);
  color: var(--color-text);
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  &:focus {
    outline: none;
    border-color: var(--color-tab-active);
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
  background-color: var(--color-tab-active);
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  &:hover {
    background-color: var(--color-button-hover);
  }
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-border);
  padding: 0 16px;
`;

const SplitContainer = styled.div`
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const RequestSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-panel);
  border-radius: 6px;
  border: 1px solid var(--color-border);
  min-height: 0;
  overflow: hidden;
`;

const ResponseSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-panel);
  border-radius: 6px;
  border: 1px solid var(--color-border);
  min-height: 0;
  overflow: hidden;
`;

const ResponseHeader = styled.div`
  padding: 6px 16px;
  border-bottom: 1px var(--color-border) solid;
  font-weight: 600;
  color:var(--color-text);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResponseLeftSection = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ResponseStatus = styled.span<{ code: number }>`
  color: ${props => {
        if (props.code >= 200 && props.code < 300) return '#49cc90'; // Success - Green
        if (props.code >= 400) return '#f93e3e'; // Error - Red
        return '#e1e1e1'; // Default color
    }};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;

  &:hover {
    color:var(--color-link-hover);
    background: none;
  }
`;

const ResponseActions = styled.div`
  display: flex;
  gap: 8px;
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
  min-height: 0;
`;

const SchemaBox = styled.textarea`
  width: 100%; height: 150px; margin-top: 10px; background: #1e1e1e; color: #ddd;
  border: 1px solid #555; padding: 8px; font-size: 14px; resize: none;
`;
const ValidationBox = styled.div`
  background: #2c2c2c; color: #eee; margin-top: 12px; padding: 8px; font-size: 13px;
  border-left: 4px solid #49cc90;
`;

const Button = styled.button`
  background-color: #7d4acf; color: white; padding: 4px 8px;
  border: none; border-radius: 4px; font-size: 12px;
  display: flex; align-items: center; gap: 6px;
  cursor: pointer;
  &:hover { background-color: #6a3dcf; }
  margin-left: 8px;
  width: 80px;
`;

const SchemaButton = styled.button`
  background-color: transparent;
  border: none;
  color: #49cc90;
  font-size: 14px;
  cursor: pointer;
  &:hover { color:rgb(255, 255, 255); }
  font-size: 12px;
`;

interface RequestPaneProps {
    tabState: RequestTabState;
    onStateChange: (newState: RequestTabState) => void;
}

const RequestPane: React.FC<RequestPaneProps> = ({ tabState, onStateChange }) => {
    // const request = useCollectionStore(state => {
    //   // Recursively search for the request in collections and folders
    //   function findRequestInFolders(folders: any[], requestId: string): any | null {
    //     for (const folder of folders) {
    //       // Search in this folder's requests
    //       if (folder.requests) {
    //         const found = folder.requests.find((r: any) => r.id === requestId);
    //         if (found) return found;
    //       }
    //       // Recurse into subfolders
    //       if (folder.folders) {
    //         const found = findRequestInFolders(folder.folders, requestId);
    //         if (found) return found;
    //       }
    //     }
    //     return null;
    //   }
    //   const collection = state.collections.find(c => c.id === state.activeCollectionId);
    //   if (!collection) return null;
    //   // Search in collection root requests
    //   let req = collection.requests.find(r => r.id === state.activeRequestId) || null;
    //   if (req) return req;
    //   // Search in folders recursively
    //   if (collection.folders && state.activeRequestId) {
    //     req = findRequestInFolders(collection.folders, state.activeRequestId);
    //   }
    //   return req || null;
    // });
    const [activeTab, setActiveTab] = useState<'params' | 'auth' | 'headers' | 'body'>('params');
    const [isResponseSaved, setIsResponseSaved] = useState(true);
    const [, setShowSearch] = useState(false);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    // Move response state into tabState updates
    const updateTabResponse = useCallback((responseText: string, status: string, code: number, durationSeconds: number) => {
        const newState = {
            ...tabState,
            response: [{
                body: responseText,
                status: status,
                code: code,
                durationSeconds: durationSeconds,
                timestamp: new Date().toISOString(),
                expectedSchema: tabState.response?.[0]?.expectedSchema,
                expectedCode: tabState.response?.[0]?.expectedCode,
                expectedStatus: tabState.response?.[0]?.expectedStatus

            }]
        };
        onStateChange(newState);
    }, [tabState, onStateChange]);

    const updateRequest = useCollectionStore(state => state.updateRequest);

    const handleMethodChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        const newState = { ...tabState, method: e.target.value as HttpMethod };
        onStateChange(newState);

        // If this tab is linked to a collection, update collection state too
        if (tabState.collectionId && tabState.requestId) {
            updateRequest(tabState.collectionId, tabState.requestId, {
                method: e.target.value as HttpMethod
            });
        }
    }, [tabState, onStateChange, updateRequest]);

    const handleUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const newState = { ...tabState, url: input };
        onStateChange(newState);
        const queryParams: typeof tabState.queryParams = [];

        const queryStart = input.indexOf('?');
        if (queryStart !== -1) {
            const queryString = input.substring(queryStart + 1);
            const pairs = queryString.split('&');

            for (const pair of pairs) {
                const [key, value = ''] = pair.split('=');
                if (key) {
                    queryParams.push({
                        id: crypto.randomUUID(),
                        key: decodeURIComponent(key),
                        value: decodeURIComponent(value),
                        isSelected: true,
                        description: ''
                    });
                }
            }
        }

        const updatedState = { ...tabState, url: input, queryParams };
        onStateChange(updatedState);
        // If this tab is linked to a collection, update collection state too
        if (tabState.collectionId && tabState.requestId) {
            updateRequest(tabState.collectionId, tabState.requestId, {
                url: e.target.value
            });
        }
    }, [tabState, onStateChange, updateRequest]);

    const handleSend = async () => {
        // if (!tabState) return;

        if (!tabState.url) {
            updateTabResponse('Error: Please enter a URL', 'Error', 0, 0);
            return;
        }
        const requestbody = { ...tabState.body };
        if (requestbody.mode == 'formdata') {
            requestbody.formData = tabState.body.formData?.filter((item: FormDataItem) => item.isSelected == true);
        }
        else if (requestbody.mode == 'urlencoded') {
            requestbody.urlencoded = tabState.body.urlencoded?.filter((item: UrlEncodedItem) => item.isSelected == true);
        }
        const queryParams = tabState.queryParams.filter(x => x.isSelected);
        const selheaders = tabState.headers.filter(x => x.isSelected);

        try {
            // Build an APIRequest object from tabState
            const apiRequest = {
                id: tabState.requestId || '',
                name: tabState.title || '',
                method: tabState.method,
                url: tabState.url,
                queryParams: queryParams || [],
                headers: selheaders || [],
                auth: tabState.auth || { type: 'none', credentials: {} },
                body: requestbody,
                contentType: tabState.headers.find(h => h.key?.toLowerCase() === 'content-type')?.value || '',
                formData: tabState.body?.formData || [],
                response: tabState.response || [],
            };

            // Get collection variables if this request belongs to a collection
            const collection = useCollectionStore.getState().collections.find(
                c => c.id === tabState.collectionId
            );
            const variables = collection?.variables || [];

            // Process request with variables
            const processedRequest = processRequestWithVariables(apiRequest, variables);

            // Prepare request body and determine content type
            let bodyToSend = undefined;
            let contentTypeHeader = processedRequest.contentType;

            if (processedRequest.body) {

                switch (processedRequest.body.mode) {
                    case 'raw':
                        bodyToSend = processedRequest.body.raw;
                        // Set content type based on raw body language
                        if (processedRequest.body.options?.raw?.language === 'json') {
                            contentTypeHeader = 'application/json';
                        } else if (processedRequest.body.options?.raw?.language === 'xml') {
                            contentTypeHeader = 'application/xml';
                        } else if (processedRequest.body.options?.raw?.language === 'html') {
                            contentTypeHeader = 'text/html';
                        } else {
                            contentTypeHeader = 'text/plain';
                        }
                        break;
                    case 'formdata':
                        bodyToSend = JSON.stringify(processedRequest.body.formData?.filter((item: FormDataItem) => item.key?.trim() && item.type?.trim()) || []);
                        contentTypeHeader = '';  // Browser will set it automatically with boundary
                        break;
                    case 'urlencoded':
                        const params = new URLSearchParams();
                        processedRequest.body.urlencoded?.forEach((item: UrlEncodedItem) => {
                            if (item.key && item.value) {
                                params.append(item.key, item.value);
                            }
                        });
                        bodyToSend = params.toString();
                        contentTypeHeader = 'application/x-www-form-urlencoded';
                        break;
                    case 'graphql':
                        bodyToSend = JSON.stringify({
                            query: processedRequest.body.graphql?.query || '',
                            variables: processedRequest.body.graphql?.variables ? JSON.parse(processedRequest.body.graphql.variables) : {}
                        });
                        contentTypeHeader = 'application/json';
                        break;
                    case 'file':
                        bodyToSend = JSON.stringify(processedRequest.body.file);
                        break;
                }
            }

            // Initialize headers object
            const headers: Record<string, string> = {};

            // Add authorization headers based on auth type
            let parentAuth = null;
            if (tabState.auth.type === 'inheritCollection') {
                parentAuth = tabState.requestId ? getNearestParentAuth(tabState.requestId, true) : undefined;
                if (parentAuth) {
                    if (parentAuth.type === 'basic') {
                        const { username, password } = parentAuth.credentials;
                        if (username && password) {
                            const base64Credentials = btoa(`${username}:${password}`);
                            headers['Authorization'] = `Basic ${base64Credentials}`;
                        }
                    } else if (parentAuth.type === 'bearer') {
                        const { token } = parentAuth.credentials;
                        if (token) {
                            headers['Authorization'] = `Bearer ${token}`;
                        }
                    } else if (parentAuth.type === 'apiKey' && parentAuth.credentials.in === "header") {
                        const { key, value } = parentAuth.credentials;
                        if (key && value) {
                            headers[key] = value;
                        }
                    }
                }
            }
            if (tabState.auth.type === 'basic') {
                const { username, password } = tabState.auth.credentials;
                if (username && password) {
                    const base64Credentials = btoa(`${username}:${password}`);
                    headers['Authorization'] = `Basic ${base64Credentials}`;
                }
            } else if (processedRequest.auth.type === 'bearer') {
                const { token } = processedRequest.auth.credentials;
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            } else if (processedRequest.auth.type === 'apiKey') {
                const { key, value } = processedRequest.auth.credentials;
                if (key && value) {
                    headers[key] = value;
                }
            }

            // Add custom headers from the Headers tab
            processedRequest.headers.forEach((header: Header) => {
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
                finalUrl = new URL(processedRequest.url);
                processedRequest.queryParams.forEach((param: QueryParam) => {
                    if (param.key) {
                        finalUrl.searchParams.append(param.key, param.value || '');
                    }
                });
                if (tabState.auth.credentials.in === "query") {
                    // Add API key to query parameters if specified
                    const { key, value } = tabState.auth.credentials;
                    if (key && value) {
                        finalUrl.searchParams.append(key, value);
                    }
                }
                else if (parentAuth && parentAuth.credentials.in === "query") {
                    // Add API key to query parameters if specified in parent auth
                    const { key, value } = parentAuth.credentials;
                    if (key && value) {
                        finalUrl.searchParams.append(key, value);
                    }

                }
            } catch (error) {
                updateTabResponse(`Error: Invalid URL - ${tabState.url}`, 'Error', 0, 0);
                return;
            }

            console.log('Sending request through proxy:', {
                url: finalUrl.toString(),
                method: processedRequest.method,
                headers,
                body: bodyToSend,
                checkBodyType: processedRequest.body?.mode
            });

            // Prepare the proxy request body
            let proxyBody: any = {
                url: finalUrl.toString(),
                method: processedRequest.method,
                headers,
                checkBodyType: processedRequest.body?.mode
            };

            // Only add body if it exists and method is not GET
            if (bodyToSend !== undefined && processedRequest.method !== 'GET') {
                //if (bodyToSend instanceof FormData) {
                //  // Convert FormData to an object
                //  const formDataObj: Record<string, string> = {};
                //  bodyToSend.forEach((value, key) => {
                //    formDataObj[key] = value.toString();
                //  });
                //  proxyBody.body = formDataObj;
                //} else {
                proxyBody.body = bodyToSend;
                //}
            }

            let response: any;
            const isElectronn = isElectron();
            let responseTimeFromELectron = 0;
            if (isElectron()) {
                /*try{
                  // 👇 Direct API request (from desktop app)
                  responseTimeFromELectron = performance.now();
                  response = await fetch(proxyBody.url, {
                    method: proxyBody.method,
                    headers: proxyBody.headers,
                    body: JSON.stringify(proxyBody.body)
                  });
                  responseTimeFromELectron = (performance.now() - responseTimeFromELectron) / 1000; // Convert to seconds
                  console.log('isElectron', isElectron());
                  if (response.status === 400) {
                    // If 400, fallback to proxy
        
                    isElectronn = false;
                    response = await fetch('https://arcon-api-integrator-wic7.onrender.com/api/proxy', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Accept-Encoding': 'identity'
                      },
                      body: JSON.stringify(proxyBody)
                    });
                  }
                }catch(error){
                  isElectronn = false;
                  console.log('Electron request failed:');          
                  response = await fetch('https://arcon-api-integrator-wic7.onrender.com/api/proxy', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'identity'
                  },
                  body: JSON.stringify(proxyBody)
                });
                }*/
                responseTimeFromELectron = performance.now();
                response = await window.electron?.sendRequest(proxyBody.url, proxyBody.method, proxyBody.headers, proxyBody.body);
                responseTimeFromELectron = (performance.now() - responseTimeFromELectron) / 1000; // Convert to seconds
            } else {
                // Make the request through the proxy
                response = await fetch('https://arcon-api-integrator-wic7.onrender.com/api/proxy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Encoding': 'identity'
                    },
                    body: JSON.stringify(proxyBody)
                });
            }
            console.log('Response received:', response);
            try {
                let contentType;
                let responseText;
                //responseTimeFromELectron = isElectronn ? response.responseTime : 0;
                if (isElectronn) {
                    contentType = response.headers['content-type'];
                    responseText = response.body;
                } else {
                    contentType = response.headers.get('content-type');
                    responseText = await response.text();
                }
                let formattedResponse = responseText;
                let jsonData: any = null;
                if (contentType?.includes('application/json')) {
                    try {
                        jsonData = JSON.parse(responseText);
                        formattedResponse = JSON.stringify(isElectronn ? jsonData : jsonData.body, null, 2);
                    } catch {
                        formattedResponse = responseText;
                    }
                }

                updateTabResponse(
                    formattedResponse,
                    response.statusText,
                    response.status,
                    isElectronn ? responseTimeFromELectron : jsonData?.durationSeconds || 0
                );

            } catch (error) {
                console.error('Failed to process response:', error);
                updateTabResponse(`Error: ${(error as Error).message}`, 'Error', 0, 0);
            }
        } catch (error) {
            console.error('Request failed:', error);
            updateTabResponse(`Error: ${(error as Error).message}`, 'Error', 0, 0);
        }
        setIsResponseSaved(false);
    };

    const SaveResponse = useCallback(() => {
        if (!tabState.collectionId || !tabState.requestId || !tabState.response) return;

        const latestResponse = {
            status: tabState.response[0].status,
            code: tabState.response[0].code,
            body: tabState.response[0].body,
            durationSeconds: tabState.response[0].durationSeconds,
            timestamp: new Date().toISOString(),
            expectedResponse: {}
        };

        // Overwrite response array with just the latest response
        updateRequest(tabState.collectionId, tabState.requestId, {
            response: [latestResponse],
        });
        setIsResponseSaved(true);
    }, [tabState, updateRequest]);

    const renderTabContent = useMemo(() => {
        switch (activeTab) {
            case 'params':
                return (
                    <QueryParams
                        params={tabState.queryParams}
                        onChange={(newParams) => {
                            // Update queryParams in state as before
                            let newState = { ...tabState, queryParams: newParams };

                            // --- Begin: Sync URL input with Query Params ---
                            try {
                                // Parse the base URL (without query params)
                                let urlObj;
                                try {
                                    urlObj = new URL(tabState.url);
                                } catch {
                                    // If invalid, don't update URL
                                    onStateChange(newState);
                                    if (tabState.collectionId && tabState.requestId) {
                                        updateRequest(tabState.collectionId, tabState.requestId, { queryParams: newParams });
                                    }
                                    return;
                                }
                                // Remove all existing search params
                                urlObj.search = '';
                                // Add all selected query params
                                newParams.forEach(param => {
                                    if (param.isSelected && param.key) {
                                        urlObj.searchParams.append(param.key, param.value || '');
                                    }
                                });
                                // Update the URL in state
                                newState.url = urlObj.toString();
                            } catch {
                                // If any error, fallback to just updating params
                            }
                            // --- End: Sync URL input with Query Params ---

                            onStateChange(newState);
                            if (tabState.collectionId && tabState.requestId) {
                                updateRequest(tabState.collectionId, tabState.requestId, { queryParams: newParams, url: newState.url });
                            }
                        }}
                    />
                );
            case 'auth':
                return (
                    <Authorization
                        Id={tabState.requestId}
                        isRequest={true}
                        auth={tabState.auth}
                        onChange={(newAuth) => {
                            const newState = { ...tabState, auth: newAuth };
                            onStateChange(newState);
                            if (tabState.collectionId && tabState.requestId) {
                                updateRequest(tabState.collectionId, tabState.requestId, { auth: newAuth });
                            }
                        }}
                    />
                );
            case 'headers':
                return (
                    <Headers
                        headers={tabState.headers}
                        onChange={(newHeaders) => {
                            const newState = { ...tabState, headers: newHeaders };
                            onStateChange(newState);
                            if (tabState.collectionId && tabState.requestId) {
                                updateRequest(tabState.collectionId, tabState.requestId, { headers: newHeaders });
                            }
                        }}
                    />
                );
            case 'body':
                return (
                    <RequestBody
                        body={tabState.body}
                        onChange={(newBody) => {
                            const newState = { ...tabState, body: newBody };
                            onStateChange(newState);

                            if (tabState.collectionId && tabState.requestId) {
                                updateRequest(tabState.collectionId, tabState.requestId, { body: newBody });
                            }
                        }}
                    />
                );
            default:
                return null;
        }
    }, [activeTab, tabState, onStateChange, updateRequest]);

    const handleValidate = () => {
        try {
            if (!tabState.response?.[0]?.expectedSchema && !tabState.showSchemaInput && !tabState.showSchemaOutput) {
                onStateChange({ ...tabState, showSchemaInput: true });
                return;
            }
            const schema = JSON.parse(tabState.response?.[0]?.expectedSchema || '{}');
            const responseRaw = tabState.response?.[0]?.body || '{}';
            const response = JSON.parse(responseRaw);
            const mismatches: string[] = [];

            if (tabState.response?.[0]?.expectedCode != tabState.response?.[0]?.code) {
                mismatches.push(`Expected code: ${tabState.response?.[0]?.expectedCode}, got: ${tabState.response?.[0]?.code}`);
            }
            if (tabState.response?.[0]?.expectedStatus != tabState.response?.[0]?.status) {
                mismatches.push(`Expected status: ${tabState.response?.[0]?.expectedStatus}, got: ${tabState.response?.[0]?.status}`);
            }
            Object.keys(schema).forEach(key => {
                const expectedType = schema[key];
                const actual = response[key];
                const actualType = typeof actual;
                if (!(key in response)) {
                    mismatches.push(`Missing key: "${key}"`);
                } else if (actualType !== expectedType) {
                    mismatches.push(`[${key}] => expected: ${expectedType}, got: ${actualType}`);
                }
            });

            const result = mismatches.length
                ? 'Schema Mismatches:\n' + mismatches.join('\n')
                : 'All keys matched!';

            const updatedResponse = [...(tabState.response || [])];
            if (updatedResponse.length > 0) {
                updatedResponse[0].validationResult = result;
            }

            onStateChange({ ...tabState, response: updatedResponse, showSchemaOutput: true });
        } catch (err) {
            const updatedResponse = [...(tabState.response || [])];
            if (updatedResponse.length > 0) {
                updatedResponse[0].validationResult = 'Error parsing JSON: ' + (err as Error).message;
            }
            onStateChange({ ...tabState, response: updatedResponse, showSchemaOutput: true });
        }
    };

    const handleSchemaChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        onStateChange({
            ...tabState,
            response: tabState.response?.map(response => ({ ...response, expectedSchema: e.target.value }))
        })

    }, [tabState, onStateChange]);

    const handleCodeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onStateChange({
            ...tabState,
            response: tabState.response?.map(response => ({ ...response, expectedCode: parseInt(e.target.value) }))
        })
    }, [tabState, onStateChange]);

    const handleStatusChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onStateChange({
            ...tabState,
            response: tabState.response?.map(response => ({ ...response, expectedStatus: e.target.value }))
        })
    }, [tabState, onStateChange]);


    const saveSchema = () => {
        if (!tabState.collectionId || !tabState.requestId) return;
        updateRequest(tabState.collectionId, tabState.requestId, {
            response: [...(tabState.response || [])].map(response => ({
                ...response,
                expectedSchema: tabState.response?.[0]?.expectedSchema,
                expectedCode: tabState.response?.[0]?.expectedCode,
                expectedStatus: tabState.response?.[0]?.expectedStatus
            }))
        });
        onStateChange({ ...tabState, showSchemaInput: false });
    };

    const AddEditSchema = () => {
        onStateChange({ ...tabState, showSchemaInput: true });
    }

    const existingValidation = tabState.response?.[0]?.validationResult;

    return (
        <Container>
            <TopBar>
                <MethodSelect
                    value={tabState.method}
                    onChange={handleMethodChange}
                    method={tabState.method as HttpMethod}
                >
                    {Object.keys(HTTP_METHODS).map(method => (
                        <option key={method} value={method}>
                            {method}
                        </option>
                    ))}
                </MethodSelect>
                <UrlInput
                    type="text"
                    value={tabState.url}
                    onChange={handleUrlChange}
                    placeholder="Enter request URL"
                />
                <ButtonGroup>
                    <SendButton onClick={handleSend}>Send</SendButton>
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
                        {renderTabContent}
                    </TabContent>
                </RequestSection>

                <ResponseSection>
                    <ResponseHeader>
                        <ResponseLeftSection>
                            <span>Response</span>
                            {tabState.response && tabState.response.length > 0 ? (
                                <ResponseStatus code={tabState.response[0].code}>
                                    {`${tabState.response[0].code} ${tabState.response[0].status}`}
                                </ResponseStatus>
                            ) : (
                                ''
                            )}
                            {tabState.response && tabState.response.length > 0 && typeof tabState.response[0] === 'object' &&
                                tabState.response[0].durationSeconds !== undefined ? (
                                <span style={{ marginLeft: 16, color: '#aaa', fontSize: 13 }}>
                                    {`Time: ${tabState.response[0].durationSeconds.toFixed(3)}s`}
                                </span>
                            ) : null}
                        </ResponseLeftSection>

                        <ResponseActions>
                            <IconButton title="Search" onClick={() => {
                                setShowSearch(prev => !prev);
                                setTimeout(() => {
                                    if (editorRef.current) { editorRef.current?.getAction('actions.find')?.run(); }
                                }, 100); // Give time for the input to render
                            }}>
                                <FiSearch />
                            </IconButton>
                            <IconButton title="Copy" onClick={() => navigator.clipboard.writeText(tabState.response?.[0]?.body || '')}><FiCopy /></IconButton>
                            <IconButton title="Clear" onClick={() => { onStateChange({ ...tabState, response: [] }); setIsResponseSaved(false); }}><FiTrash2 /></IconButton>
                            {tabState.response?.[0]?.code !== 0 && (
                                <IconButton title="Save" style={{
                                    opacity: isResponseSaved ? 0.5 : 1, pointerEvents: isResponseSaved ? 'none' : 'auto',
                                }} onClick={!isResponseSaved ? SaveResponse : undefined}><FiSave /></IconButton>
                            )}
                            <IconButton title="Validate" onClick={handleValidate}>
                                <FiCheckCircle />
                            </IconButton>
                        </ResponseActions>
                    </ResponseHeader>
                    {tabState.showSchemaInput && (
                        <div>
                            <div style={{ fontSize: 12, marginBottom: 8 }}>No schema found. Kindly add a schema to validate the response.</div>
                            <input type="number" placeholder='Expected code' value={tabState.response?.[0]?.expectedCode} onChange={handleCodeChange} />
                            <input type="text" placeholder='Expected status' value={tabState.response?.[0]?.expectedStatus} onChange={handleStatusChange} />
                            <SchemaBox
                                placeholder='Enter expected schema, e.g. { "token": "string", "id": "number" }'
                                value={tabState.response?.[0]?.expectedSchema}
                                onChange={handleSchemaChange}
                            />
                            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                <Button onClick={saveSchema}><FiSave /> Save</Button>
                                <Button onClick={() => onStateChange({ ...tabState, showSchemaInput: false })}><FiX /> Cancel</Button>
                            </div>
                        </div>
                    )}
                    {!tabState.showSchemaInput && tabState.showSchemaOutput && existingValidation &&
                        <div>
                            <SchemaButton title="Edit Schema" onClick={AddEditSchema}>Edit Schema</SchemaButton>
                            <ValidationBox>{existingValidation}</ValidationBox>
                        </div>
                    }
                    <ResponseContent>
                        <Editor
                            onMount={(editor) => {
                                editorRef.current = editor;
                                editor.updateOptions({ readOnly: true });
                            }}
                            defaultLanguage="json"
                            value={
                                (() => {
                                    try {
                                        const raw = tabState.response?.[0]?.body || '';
                                        return JSON.stringify(JSON.parse(raw), null, 2);
                                    } catch {
                                        return tabState.response?.[0]?.body || '';
                                    }
                                })()
                            }
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 12,
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                                padding: { top: 8, bottom: 8 },
                                lineHeight: 18,
                                wordWrap: 'on',
                                readOnly: true
                            }}
                        />
                    </ResponseContent>
                </ResponseSection>
            </SplitContainer>
        </Container>
    );
};

export default React.memo(RequestPane);
