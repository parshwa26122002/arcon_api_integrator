import React, { useEffect } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';
import { FiFile } from 'react-icons/fi';
import { useCollectionStore } from '../../store/collectionStore';
import type { RequestBody, FormDataItem } from '../../store/collectionStore';

const Container = styled.div`
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
`;

const Select = styled.select`
  padding: 0.35rem 0.5rem;
  width: 150px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  background-color: #2d2d2d;
  color: #e1e1e1;
  font-size: 12px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  background-color: #383838;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  cursor: pointer;
  color: #e1e1e1;
  font-size: 12px;
  
  &:hover {
    background-color: #404040;
  }
`;

const KeyValueRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
  align-items: center;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
`;

const KeyContainer = styled.div`
  display: flex;
  align-items: stretch;
  width: 200px;
`;

interface StyledInputProps {
  $isKeyInput?: boolean;
}

const Input = styled.input<StyledInputProps>`
  padding: 0.4rem 0.6rem;
  background-color: #383838;
  border: 1px solid #4a4a4a;
  border-radius: ${props => props.$isKeyInput ? '4px 0 0 4px' : '4px'};
  color: #e1e1e1;
  font-size: 12px;
  width: ${props => props.$isKeyInput ? '150px' : '200px'};

  &:focus {
    outline: none;
    border-color: #7d4acf;
  }

  &::placeholder {
    color: #888;
  }
`;

const TypeSelect = styled.select`
  padding: 0.4rem;
  background-color: #383838;
  border: 1px solid #4a4a4a;
  border-left: none;
  border-radius: 0 4px 4px 0;
  color: #e1e1e1;
  font-size: 12px;
  width: 50px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #7d4acf;
  }
`;

const AddButton = styled.button`
  padding: 0.35rem 0.75rem;
  background-color: #7d4acf;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #6a3eb2;
  }
`;

const NoBodyText = styled.p`
  color: #999;
  font-size: 12px;
  text-align: center;
  padding: 1rem;
  background-color: #2d2d2d;
  border-radius: 4px;
  border: 1px dashed #4a4a4a;
`;

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-height: 0;

  .monaco-editor {
    border-radius: 4px;
    overflow: hidden;
    flex: 1;
  }
`;

const FileDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background-color: #383838;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 12px;
  max-width: 100%;
`;

const FileNameText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; // Adjust this value based on your layout
  flex: 1;
`;

const FileIcon = styled(FiFile)`
  flex-shrink: 0;
`;

const DeleteFileButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #ff4444;
  }
`;

// Convert Postman mode to UI mode
const getUIMode = (postmanMode?: string): string => {
  switch (postmanMode) {
    case 'formdata': return 'form-data';
    case 'urlencoded': return 'x-www-form-urlencoded';
    case 'file': return 'binary';
    case 'raw': return 'raw';
    case 'none': return 'none';
    default: return 'none';
  }
};

// Convert UI mode to Postman mode
const getPostmanMode = (uiMode: string): RequestBody['mode'] => {
  switch (uiMode) {
    case 'form-data': return 'formdata';
    case 'x-www-form-urlencoded': return 'urlencoded';
    case 'binary': return 'file';
    case 'raw': return 'raw';
    case 'none': return 'none';
    default: return 'none';
  }
};

const RequestBodyComponent: React.FC = () => {
  const {
    activeCollectionId,
    activeRequestId,
    updateRequest,
    getActiveRequest
  } = useCollectionStore();

  const [localBody, setLocalBody] = React.useState<RequestBody>({ mode: 'none' });
  const request = getActiveRequest();
  
  console.log('Current request:', request);
  console.log('Request body:', request?.body);
  console.log('Request body mode:', request?.body?.mode);
  console.log('Request body formdata:', request?.body?.formdata);
  console.log('Request body urlencoded:', request?.body?.urlencoded);
  
  const body = request?.body || localBody;
  const bodyMode = getUIMode(body?.mode);

  // Update local body when request changes
  useEffect(() => {
    console.log('Request changed:', request?.body);
    if (request?.body) {
      setLocalBody(request.body);
    } else {
      setLocalBody({ mode: 'none' });
    }
  }, [request]);

  const handleModeChange = (newMode: string) => {
    const postmanMode = getPostmanMode(newMode);
    const newBody: RequestBody = {
      mode: postmanMode
    };

    // Initialize mode-specific properties
    switch (postmanMode) {
      case 'formdata':
        newBody.formdata = [{ key: '', value: '', type: 'text' }];
        break;
      case 'urlencoded':
        newBody.urlencoded = [{ key: '', value: '', type: 'text' }];
        break;
      case 'raw':
        newBody.raw = '';
        newBody.options = { raw: { language: 'text' } };
        break;
      case 'file':
        newBody.file = { src: '' };
        break;
    }

    setLocalBody(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, {
        body: newBody
      });
    }
  };

  const handleFormDataChange = (index: number, field: string, value: string) => {
    if (!body?.formdata) return;

    const newFormData = [...body.formdata];
    if (index >= newFormData.length) {
      newFormData.push({ key: '', value: '', type: 'text' });
    }

    if (field === 'type' && value === 'file') {
      newFormData[index] = {
        ...newFormData[index],
        [field]: value,
        value: '',
        src: ''
      };
    } else if (field === 'type' && value === 'text') {
      newFormData[index] = {
        ...newFormData[index],
        [field]: value,
        src: '',
        value: ''
      };
    } else if (field === 'file') {
      // Handle file selection
      newFormData[index] = {
        ...newFormData[index],
        src: value,
        value: value // Store filename in value as well
      };
    } else {
      newFormData[index] = {
        ...newFormData[index],
        [field]: value
      };
    }

    const newBody = {
      ...body,
      formdata: newFormData
    };

    setLocalBody(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, {
        body: newBody
      });
    }
  };

  const handleRawChange = (value: string | undefined) => {
    if (!body) return;

    const newBody = {
      ...body,
      raw: value || ''
    };

    setLocalBody(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, {
        body: newBody
      });
    }
  };

  const handleLanguageChange = (language: string) => {
    if (!body) return;

    const newBody = {
      ...body,
      options: {
        raw: { language: language as 'text' | 'html' | 'json' | 'xml' }
      }
    };

    setLocalBody(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, {
        body: newBody
      });
    }
  };

  const handleFileChange = (src: string) => {
    if (!body) return;

    const newBody = {
      ...body,
      file: { src }
    };

    setLocalBody(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, {
        body: newBody
      });
    }
  };

  const handleDeleteFormDataRow = (index: number) => {
    if (!body?.formdata) return;

    const newFormData = body.formdata.filter((_, i) => i !== index);
    const newBody = {
      ...body,
      formdata: newFormData
    };

    setLocalBody(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleAddFormDataRow = () => {
    if (!body) return;

    const newFormData = [...(body.formdata || []), { key: '', value: '', type: 'text' }];
    const newBody = {
      ...body,
      formdata: newFormData
    };

    setLocalBody(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const renderFormData = () => {
    const formData = body?.formdata || [];
    
    return (
      <FormContainer>
        {formData.map((item: FormDataItem, index: number) => (
          <KeyValueRow key={index}>
            <KeyContainer>
              <Input
                $isKeyInput
                placeholder="Key"
                value={item.key || ''}
                onChange={(e) => handleFormDataChange(index, 'key', e.target.value)}
              />
              <TypeSelect
                value={item.type || 'text'}
                onChange={(e) => handleFormDataChange(index, 'type', e.target.value)}
              >
                <option value="text">Text</option>
                <option value="file">File</option>
              </TypeSelect>
            </KeyContainer>
            {item.type === 'file' ? (
              item.src ? (
                <FileDisplay>
                  <FileIcon />
                  <FileNameText title={item.src}>{item.src}</FileNameText>
                  <DeleteFileButton
                    onClick={() => {
                      const newFormData = [...formData];
                      newFormData[index] = {
                        ...newFormData[index],
                        src: '',
                        value: ''
                      };
                      const newBody = {
                        ...body,
                        formdata: newFormData
                      };
                      setLocalBody(newBody);
                      if (activeCollectionId && activeRequestId) {
                        updateRequest(activeCollectionId, activeRequestId, { body: newBody });
                      }
                    }}
                  >
                    ×
                  </DeleteFileButton>
                </FileDisplay>
              ) : (
                <FileButton as="label" style={{ margin: 0 }}>
                  <FiFile /> Choose File
                  <FileInput
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFormDataChange(index, 'file', file.name);
                      }
                    }}
                  />
                </FileButton>
              )
            ) : (
              <Input
                placeholder="Value"
                value={item.value || ''}
                onChange={(e) => handleFormDataChange(index, 'value', e.target.value)}
              />
            )}
          </KeyValueRow>
        ))}
        <AddButton onClick={() => {
          const newFormData = [...formData, { key: '', value: '', type: 'text' }];
          const newBody = { ...body, formdata: newFormData };
          setLocalBody(newBody);
          if (activeCollectionId && activeRequestId) {
            updateRequest(activeCollectionId, activeRequestId, { body: newBody });
          }
        }}>
          Add Row
        </AddButton>
      </FormContainer>
    );
  };

  const renderBodyContent = () => {
    console.log('Rendering body content:', bodyMode, body);
    
    if (!body || bodyMode === 'none') {
      return <NoBodyText>This request does not have a body</NoBodyText>;
    }

    switch (bodyMode) {
      case 'form-data':
        return renderFormData();

      case 'raw':
        return (
          <EditorContainer>
            <Select 
              value={body.options?.raw?.language || 'text'} 
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="text">Text</option>
              <option value="json">JSON</option>
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="xml">XML</option>
            </Select>
            <Editor
              height="400px"
              defaultLanguage={body.options?.raw?.language || 'text'}
              value={body.raw || ''}
              onChange={handleRawChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 8, bottom: 8 },
                lineHeight: 18,
              }}
            />
          </EditorContainer>
        );

      case 'binary':
        return (
          <FormContainer>
            <FileButton>
              <FiFile /> {body.file?.src || 'Select File'}
              <FileInput
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileChange(file.name);
                  }
                }}
              />
            </FileButton>
          </FormContainer>
        );

      case 'x-www-form-urlencoded':
        return (
          <FormContainer>
            {Array.isArray(body.urlencoded) && body.urlencoded.map((item: any, index: number) => (
              <KeyValueRow key={index}>
                <Input
                  placeholder="Key"
                  value={item.key || ''}
                  onChange={(e) => {
                    const newUrlencoded = [...(body.urlencoded || [])];
                    newUrlencoded[index] = { ...item, key: e.target.value };
                    const newBody = { ...body, urlencoded: newUrlencoded };
                    setLocalBody(newBody);
                    if (activeCollectionId && activeRequestId) {
                      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
                    }
                  }}
                />
                <Input
                  placeholder="Value"
                  value={item.value || ''}
                  onChange={(e) => {
                    const newUrlencoded = [...(body.urlencoded || [])];
                    newUrlencoded[index] = { ...item, value: e.target.value };
                    const newBody = { ...body, urlencoded: newUrlencoded };
                    setLocalBody(newBody);
                    if (activeCollectionId && activeRequestId) {
                      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
                    }
                  }}
                />
              </KeyValueRow>
            ))}
            <AddButton onClick={() => {
              const newUrlencoded = [...(body.urlencoded || []), { key: '', value: '', type: 'text' }];
              const newBody = { ...body, urlencoded: newUrlencoded };
              setLocalBody(newBody);
              if (activeCollectionId && activeRequestId) {
                updateRequest(activeCollectionId, activeRequestId, { body: newBody });
              }
            }}>
              Add Row
            </AddButton>
          </FormContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <Select value={bodyMode} onChange={(e) => handleModeChange(e.target.value)}>
        <option value="none">none</option>
        <option value="form-data">form-data</option>
        <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
        <option value="raw">raw</option>
        <option value="binary">binary</option>
      </Select>
      {renderBodyContent()}
    </Container>
  );
};

export default RequestBodyComponent; 