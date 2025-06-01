import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCollectionStore, type APIRequest, type APIFolder, type RunnerTabState, type APICollection } from '../../store/collectionStore';
import { styled } from 'styled-components';
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { FiX } from 'react-icons/fi';
import { FiCopy, FiSave, FiSearch } from 'react-icons/fi';

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
  background-color: #383838;
  border-radius: 6px;
  border: 1px solid #4a4a4a;
  padding: 8px;
  height: 530px;
  overflow-y: auto;
`;

const ScheduleSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #383838;
  border-radius: 6px;
  border: 1px solid #4a4a4a;
  padding: 16px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 12px;
  color: #ffffff;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  color: #cccccc;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  background-color: #2d2d2d;
  color: #ffffff;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 10px 16px;
  background-color: #7d4acf;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background-color: #6a3dcf;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  padding: 8px 12px;
  background-color: #2d2d2d;
  font-weight: bold;
  color: #cccccc;
  border-bottom: 1px solid #444;
  font-size: 14px;
`;

const Row = styled.div`
  display: flex;
  padding: 8px 12px;
  align-items: center;
  border-bottom: 1px solid #444;
  &:hover {
    background-color: #333;
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
  background-color: #2d2d2d;
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
  accent-color: #7d4acf;
`;

const ResultContainer = styled.div`
  display: flex;
  height: calc(100vh - 80px);
  background-color: #1e1e1e;
  color: #ffffff;
  font-family: 'Segoe UI', sans-serif;
`;


const ResultCard = styled.div`
  padding: 8px 10px;
  border-bottom: 1px solid #444;
  cursor: pointer;
  background-color: #1e1e1e;
  margin-bottom: 8px;
  gap: 18px;
  &:hover {
    background-color: #2a2a2a;
  }
`;

const LeftPane = styled.div`
  flex: 1;
  padding: 16px;
  border-right: 1px solid #333;
  overflow-y: auto;
`;

const RightPane = styled.div<{ isOpen: boolean }>`
  width: ${({ isOpen }) => (isOpen ? '50%' : '0')};
  overflow: hidden;
  transition: width 0.3s ease;
  background-color: #1e1e1e;
  border-left: 1px solid #444;
  display: flex;
  flex-direction: column;
`;

const StatusTag = styled.span<{ code: number }>`
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background-color: ${({ code }) => {
    if (code >= 200 && code < 300) return '#49cc90';
    if (code >= 400 && code < 500) return '#f93e3e';
    return '#999';
  }};
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
      default: return '#999';
    }
  }};
  margin-right: 8px;
`;

const ResponseHeader = styled.div`
  padding: 6px 16px;
  border-bottom: 1px solid #4a4a4a;
  font-weight: 600;
  color: #e1e1e1;
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
  color: #ccc;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;

  &:hover {
    color: #49cc90;
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

const handleSend = async (request: APIRequest) => {
    if (!request) return;

    if (!request.url) {
      request.response.push({
        status: 'Error',
        code: 0,
        body: 'Error: Please enter a URL'
      });
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
          case 'form-data':
            const formData = new FormData();
            request.body.formData?.forEach(item => {
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
        request.response.push({
          status: 'Error',
          code: 0,
          body: `Error: Invalid URL - ${request.url}`
        });
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

      try {
        const contentType = response.headers.get('content-type');
        const responseText = await response.text();
        
        let formattedResponse = responseText;
        if (contentType?.includes('application/json')) {
          try {
            const jsonData = JSON.parse(responseText);
            formattedResponse = JSON.stringify(jsonData, null, 2);
          } catch {
            formattedResponse = responseText;
          }
        }

        request.response.push({
          status: response.statusText,
          code: response.status,
          body: formattedResponse
        });
      } catch (error) {
        console.error('Failed to process response:', error);
        request.response.push({
          status: 'Error',
          code: 0,
          body: `Error: ${(error as Error).message}`
        });
      }
    } catch (error) {
      console.error('Request failed:', error);
      request.response.push({
        status: 'Error',
        code: 0,
        body: `Error: ${(error as Error).message}`
      });
    }
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
            isResponseSaved: false
          });
        } catch (err) {
          iterationResults.push({
            requestId: req.id,
            name: req.name,
            code: 0,
            status: 'Error',
            body: String(err),
            isResponseSaved: false
          });
        }
        resultsByIteration.push({ iteration: iter, results: iterationResults });
        onStateChange({ resultsByIteration: [...resultsByIteration] });
        await new Promise(res => setTimeout(res, tabState.delay));
      }
    }

    onStateChange({ resultsByIteration: resultsByIteration });
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
              min={100}
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
