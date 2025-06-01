import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCollectionStore, type APIRequest, type APIFolder, type RunnerTabState, type APICollection, getNearestParentAuth, type FormDataItem, type UrlEncodedItem, type Header, type QueryParam } from '../../store/collectionStore';
import { styled } from 'styled-components';
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { FiX } from 'react-icons/fi';
import { FiCopy, FiSave, FiSearch } from 'react-icons/fi';
import { processRequestWithVariables } from '../../utils/variableUtils';

const SplitContainer = styled.div`
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
`;

const RequestSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-panel-alt);
  border-radius: 6px;
  border: 1px solid var(--color-border);
  padding: 8px;
  height: 530px;
  overflow-y: auto;
`;

const ScheduleSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-panel-alt);
  border-radius: 6px;
  border: 1px solid var(--color-border);
  padding: 16px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 12px;
  color: var(--color-text);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const Label = styled.label`  color: var(--color-muted);
  font-size: 14px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-panel);
  color: var(--color-text);
  font-size: 14px;
`;

const Button = styled.button`
  padding: 10px 16px;
  background-color: var(--color-tab-active);  color: var(--color-primary-text);
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: var(--color-primary-hover);
  }
`;

const HeaderRow = styled.div`
  display: flex;
  padding: 8px 12px;
  background-color: var(--color-tab-active);
  font-weight: bold;
  color: #var(--color-text);
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
`;

const Row = styled.div`
  display: flex;
  padding: 8px 12px;
  align-items: center;
  border-bottom: 1px solid var(--color-border);  &:hover {
    background-color: var(--color-panel-alt);
  }
  font-size: 12px;
`;

const Cell = styled.div<{ width?: string }>`
  flex: ${({ width }) => width || '1'};
  padding-right: 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: var(--color-panel);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 80px);
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  margin-right: 12px;
  cursor: pointer;
  accent-color: var(--color-tab-active);
`;

const ResultContainer = styled.div`
  display: flex;
  height: calc(100vh - 80px);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: 'Segoe UI', sans-serif;
`;


const ResultCard = styled.div`
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  background-color: var(--color-bg);
  margin-bottom: 8px;
  gap: 18px;  &:hover {
    background-color: var(--color-panel-alt);
  }
`;

const LeftPane = styled.div`
  flex: 1;
  padding: 16px;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
`;

const RightPane = styled.div<{ isOpen: boolean }>`
  width: ${({ isOpen }) => (isOpen ? '50%' : '0')};
  overflow: hidden;
  transition: width 0.3s ease;
  background-color: var(--color-bg);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
`;

const StatusTag = styled.span<{ code: number }>`
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;  color: var(--color-primary-text);
  background-color: ${({ code }) => {
    if (code >= 200 && code < 300) return 'var(--color-success)';
    if (code >= 400 && code < 500) return 'var(--color-error)';
    return 'var(--color-muted)';
  }};
`;

const ResponseContent = styled.div`
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  color: var(--color-text);
  background-color: var(--color-panel);
  border-radius: 0 0 6px 6px;
`;

const MethodTag = styled.span<{ method: string }>`
  font-weight: bold;
  font-size: 13px;
  color: ${({ method }) => {
    switch (method) {
      case 'GET': return '#61affe';
      case 'POST': return '#49cc90';
      case 'PUT': return '#fca130';
      case 'DELETE': return '#f93e3e';
      case 'PATCH': return '#f582ea';
      default: return '#959da5';
    }
  }};
  margin-right: 8px;
`;

const ResponseHeader = styled.div`
  padding: 6px 16px;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  color: var(--color-text);
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
    if (props.code >= 200 && props.code < 300) return 'var(--color-success)';
    if (props.code >= 400) return 'var(--color-error)';
    return 'var(--color-text)';
  }};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;

  &:hover {
    color: var(--color-success);
  }
`;

const ResponseActions = styled.div`
  display: flex;
  gap: 8px;
`;

interface RequestItem extends APIRequest {
  isSelected: boolean;
}

const getAllRequestsFromCollection = (collection: APICollection): APIRequest[] => {
  const allRequests: APIRequest[] = [];
  allRequests.push(...(collection.requests || []));
  const traverseFolders = (folders: APIFolder[]) => {
    for (const folder of folders) {
      if (folder.requests) {
        allRequests.push(...folder.requests);
      }
      if (folder.folders) {
        traverseFolders(folder.folders);
      }
    }
  };
  traverseFolders(collection.folders || []);
  return allRequests;
};

const getAllRequestsFromFolder = (folder: APIFolder): APIRequest[] => {
  const allRequests: APIRequest[] = [];
  allRequests.push(...(folder.requests || []));
  const traverseFolders = (folders: APIFolder[]) => {
    for (const folder of folders) {
      if (folder.requests) {
        allRequests.push(...folder.requests);
      }
      if (folder.folders) {
        traverseFolders(folder.folders);
      }
    }
  };
  traverseFolders(folder.folders || []);
  return allRequests;
};

interface RunnerPaneProps {
  tabState: RunnerTabState;
  onStateChange: (newState: Partial<RunnerTabState>) => void;
}

const RunnerPane = ({ tabState, onStateChange }: RunnerPaneProps) => {
  const collection = useCollectionStore(
    useCallback(
      state => state.collections.find(c => c.id === tabState.collectionId),
      [tabState.collectionId]
    )
  );

  const selectedResult = tabState.resultsByIteration?.find(r => r.results.find(r => r.requestId === tabState.selectedResultId))
  const [requestList, setRequestList] = useState<RequestItem[]>([]);
  const activeFolderId = useCollectionStore(state => state.activeFolderId);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [, setShowSearch] = useState(false);

  const getFolder = () => {
    const updateFolders = (folders: APIFolder[]): APIFolder[] => {
      return folders.map((folder) => {
        if (folder.id === tabState.folderId) {
          return folder;
        }
        return {
          ...folder,
          folders: updateFolders(folder.folders || []),
        };
      });
    };
    return updateFolders(collection?.folders || [])[0];
  }

  let allRequests: APIRequest[] = [];
  if (!collection) return null;
  else if(collection && !activeFolderId) {
    allRequests = getAllRequestsFromCollection(collection);
  }
  else if(collection && activeFolderId) {
    allRequests = getAllRequestsFromFolder(getFolder());
  }

  useEffect(() => {
    if (!collection) return;   
    const selectedIds = tabState.selectedRequestIds || [];
    const withSelection = allRequests.map(r => ({ ...r, isSelected: selectedIds.includes(r.id) }));
    setRequestList(withSelection);
  }, [collection?.id, tabState.selectedRequestIds]);

  const handleSelectAll = (checked: boolean) => {
    const updated = requestList.map(r => ({ ...r, isSelected: checked }));
    setRequestList(updated);
    const selectedIds = checked ? updated.map(r => r.id) : [];
    onStateChange({ selectedRequestIds: selectedIds });
  };

  const handleSingleSelect = (id: string, checked: boolean) => {
    const updated = requestList.map(r => (r.id === id ? { ...r, isSelected: checked } : r));
    setRequestList(updated);
    const selectedIds = updated.filter(r => r.isSelected).map(r => r.id);
    onStateChange({ selectedRequestIds: selectedIds });
  };

  const handleRun = async () => {
    console.log('handleRun');
    const selectedRequests = requestList.filter(r => r.isSelected);
    const resultsByIteration: RunnerTabState["resultsByIteration"] = [];

    onStateChange({ resultsByIteration: resultsByIteration, started: true });

    for (let iter = 1; iter <= tabState.iterations; iter++) {
      for (const req of selectedRequests) {
        const iterationResults: NonNullable<RunnerTabState["resultsByIteration"]>[number]["results"] = [];
        try {
          const clonedReq: APIRequest = JSON.parse(JSON.stringify(req));
          clonedReq.response = [];
          await handleSend(clonedReq);
          iterationResults.push({
            requestId: req.id,
            name: req.name,
            code: clonedReq.response[0].code,
            status: clonedReq.response[0].status,
            body: clonedReq.response[0].body,
            isResponseSaved: false,
            durationSeconds: clonedReq.response[0].durationSeconds || 0
          });
        } catch (err) {
          iterationResults.push({
            requestId: req.id,
            name: req.name,
            code: 0,
            status: 'Error',
            body: String(err),
            isResponseSaved: false,
            durationSeconds: 0
          });
        }
        resultsByIteration.push({ iteration: iter, results: iterationResults });
        onStateChange({ resultsByIteration: [...resultsByIteration] });
        await new Promise(res => setTimeout(res, tabState.delay));
      }
    }

    onStateChange({ resultsByIteration: resultsByIteration });
  };

  const handleSend = async (request: APIRequest) => {
  // if (!tabState) return;

  if (!request.url) {
    request.response.push({
    status: 'Error',
    code: 0,
    body: 'Error: Please enter a URL',
    durationSeconds: 0
  });
    return;
  }

  try {
        const requestbody = {
        ...request.body,
        mode: request.body?.mode ?? 'none', 
        };
        if(requestbody.mode == 'formdata'){
          requestbody.formData = request.body?.formData?.filter((item: FormDataItem) => item.isSelected == true);
        }
        else if(requestbody.mode == 'urlencoded'){ 
          requestbody.urlencoded = request.body?.urlencoded?.filter((item: UrlEncodedItem) => item.isSelected == true);
        }
        const queryParams = request.queryParams.filter(x => x.isSelected);
        const selheaders = request.headers.filter(x => x.isSelected);

      const apiRequest = {
        id: request.id || '',
        name: request.name || 'Untitled Request',
        method: request.method,
        url: request.url,
        queryParams: queryParams || [],
        headers: selheaders || [],
        auth: request.auth || { type: 'none', credentials: {} },
        body: requestbody || {mode:'none'},
        contentType: request.headers.find(h => h.key?.toLowerCase() === 'content-type')?.value || '',
        response: request.response || [],
      };
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
          //const formData = new FormData();
          //processedRequest.body.formData?.forEach((item: FormDataItem) => {
          //  if (item.key && item.value) {
          //    formData.append(item.key, item.value);
          //  }
              //});
          bodyToSend = processedRequest.body.formData;
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
    if (request.auth.type === 'inheritCollection') {
      parentAuth = request.id ? getNearestParentAuth(request.id, true) : undefined;
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
    if (request.auth.type === 'basic') {
      const { username, password } = request.auth.credentials;
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
      if (request.auth.credentials.in === "query") {
        // Add API key to query parameters if specified
        const { key, value } = request.auth.credentials;
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
              request.response.push({
              status: 'Error',
              code: 0,
              body: `Error: Invalid URL - ${request.url}`,
              durationSeconds: 0
            });
            return;
    }

    console.log('Sending request through proxy:', {
      url: finalUrl.toString(),
      method: processedRequest.method,
      headers,
      body: bodyToSend
    });

    // Prepare the proxy request body
    let proxyBody: any = {
      url: finalUrl.toString(),
      method: processedRequest.method,
      headers,
    };

    // Only add body if it exists and method is not GET
    if (bodyToSend !== undefined && processedRequest.method !== 'GET') {
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
    const response = await fetch('https://arcon-api-integrator-wic7.onrender.com/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'identity'
      },
      body: JSON.stringify(proxyBody)
    });

    try {
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      let formattedResponse = responseText;
      let jsonData: any = null;
      if (contentType?.includes('application/json')) {
        try {
          jsonData = JSON.parse(responseText);
          formattedResponse = JSON.stringify(jsonData.body, null, 2);
        } catch {
          formattedResponse = responseText;
        }
      }

      request.response.push({
        status: response.statusText,
        code: response.status,
        body: formattedResponse,
        durationSeconds: jsonData?.durationSeconds || 0});

    } catch (error) {
      console.error('Failed to process response:', error);
      request.response.push({
        status: 'Error',
        code: 0,
        body: `Error: ${(error as Error).message}`,
        durationSeconds: 0
      });
    }
  } catch (error) {
    console.error('Request failed:', error);
    request.response.push({
      status: 'Error',
      code: 0,
      body: `Error: ${(error as Error).message}`,
      durationSeconds: 0
    });
  }
};


  const handleCardClick = (res: any) => {
    onStateChange({ selectedResultId: res.requestId, isOpen: true });
    console.log(tabState.selectedResultId, tabState.isOpen);
  };

  const SaveResponse = () => {
    console.log('SaveResponse');
    const request = requestList.find(r => r.id === selectedResult?.results[0].requestId);
    if (request) {
      const tempresponse = selectedResult?.results[0];
      request.response.push({
        code: tempresponse?.code || 0,
        status: tempresponse?.status || '',
        body: tempresponse?.body || '',
        durationSeconds: tempresponse?.durationSeconds || 0,
      });
      if (tabState.resultsByIteration) {
        const result = tabState.resultsByIteration.find(r => r.results.find(r => r.requestId === request.id));
        if (result) {
          result.results[0].isResponseSaved = true;
        }
      }
      onStateChange({ resultsByIteration: tabState.resultsByIteration });
    }
  }
  
  const allSelected = requestList.length > 0 && requestList.every(r => r.isSelected);


  return (
    <>
    { !tabState.started ? ( 
    <Container>
      <SplitContainer>
        <RequestSection>
          <HeaderRow>
            <Cell width="0.1">
              <Checkbox checked={allSelected} onChange={() => handleSelectAll(!allSelected)} />
            </Cell>
            <Cell width="0.2">METHOD</Cell>
            <Cell>Request Name</Cell>
          </HeaderRow>

          {requestList.map((req) => (
            <Row key={req.id}>
              <Cell width="0.1">
                <Checkbox
                  checked={req.isSelected}
                  onChange={() => handleSingleSelect(req.id, !req.isSelected)}
                />
              </Cell>
              <Cell width="0.2">
                <MethodTag method={req.method}>{req.method}</MethodTag>
              </Cell>
              <Cell>{req.name}</Cell>
            </Row>
          ))}
        </RequestSection>

        <ScheduleSection>
          <SectionTitle>Choose how to run your collection</SectionTitle>
          <FieldGroup>
            <Label>Iterations</Label>
            <Input type="number" min={1} value={tabState.iterations}
                onChange={(e) => { const value = parseInt(e.target.value, 10) || 1;
                onStateChange({ iterations: value });
            }}/>
          </FieldGroup>
          <FieldGroup>
            <Label>Delay (ms)</Label>
            <Input
              type="number"
              min={1}
              value={tabState.delay}
              onChange={(e) => { const value = parseInt(e.target.value, 10) || 0;
                onStateChange({ delay: value });
            }}
            />
          </FieldGroup>
          <Button onClick={handleRun}>Run Collection</Button>
        </ScheduleSection>
      </SplitContainer>
    </Container>
    ) : (
      <ResultContainer>
        <LeftPane>
          {tabState.resultsByIteration?.map((res, idx) => {
            const latest = res.results?.[res.results.length - 1];
            const request = requestList.find(r => r.id === res.results[0].requestId);
            return (
              <div>
                <ResultCard key={idx} onClick={() => handleCardClick(res.results[0])}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      {res.iteration + " "}
                      <MethodTag method={request?.method ?? 'GET'}>{request?.method}</MethodTag>
                      {request?.name}
                    </div>
                    <div>
                    <StatusTag code={latest?.code ?? 0}>
                    {latest?.code ?? 'Pending'} </StatusTag>
                    </div>
                  </div>
                  <div style={{fontSize: '12px', color: '#666666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', padding: '10px 0'}}>
                    <span>{request?.url}</span>
                  </div>
                </ResultCard>
              </div>
            );
          })}
        </LeftPane>

        <RightPane isOpen={tabState.isOpen}>
          <ResponseHeader>
            <ResponseLeftSection>
              <span>Response</span>
              {selectedResult?.results && selectedResult?.results.length > 0 ? (
                <ResponseStatus code={selectedResult.results[0].code}>
                  {`${selectedResult.results[0].code} ${selectedResult.results[0].status}`}
                </ResponseStatus>
              ) : (
                ''
              )}
            </ResponseLeftSection>

            <ResponseActions>
            <IconButton title="Search" onClick={() => { setShowSearch(prev => !prev);
                setTimeout(() => { if (editorRef.current) { editorRef.current?.getAction('actions.find')?.run();}
                }, 100); // Give time for the input to render
                }}>
                <FiSearch />
              </IconButton>
              <IconButton title="Copy" onClick={() => navigator.clipboard.writeText(selectedResult?.results?.[0]?.body || '')}><FiCopy /></IconButton>
              {selectedResult?.results?.[0]?.code !== 0 && (
                <IconButton title="Save" style={{ opacity: selectedResult?.results?.[0]?.isResponseSaved ? 0.5 : 1, pointerEvents: selectedResult?.results?.[0]?.isResponseSaved ? 'none' : 'auto',
                }} onClick={SaveResponse}><FiSave /></IconButton>
              )}
              <IconButton title="Close" onClick={() => onStateChange({ isOpen: false })}><FiX /></IconButton>
            </ResponseActions>
          </ResponseHeader>
          <ResponseContent>
            <Editor
              onMount={(editor) => (editorRef.current = editor)}
              defaultLanguage="json"
              value={
                (() => {
                  try {
                    const raw = selectedResult?.results?.length
                    ? selectedResult.results[selectedResult.results.length - 1].body
                    : '';
                    return JSON.stringify(JSON.parse(raw), null, 2);
                  } catch {
                    return selectedResult?.results?.[0]?.body || '';
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
                wordWrap: 'on'
              }}
            />
          </ResponseContent>
        </RightPane>
      </ResultContainer>
    )}
    </>
  );
};

export default React.memo(RunnerPane);
