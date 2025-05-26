import React, { useEffect } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';
import { FiFile } from 'react-icons/fi';
import { useCollectionStore } from '../../store/collectionStore';
import type { 
  RequestBody,
  FormDataItem,
  UrlEncodedItem,
} from '../../store/collectionStore';

interface RequestBodyProps {
  body: RequestBody;
  onChange: (body: RequestBody) => void;
}

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

const RequestBodyComponent: React.FC<RequestBodyProps> = ({ body, onChange }) => {
  const {
    activeCollectionId,
    activeRequestId,
    updateRequest,
    getActiveRequest
  } = useCollectionStore();

  const [, setLocalBody] = React.useState<RequestBody>(body);
  const request = getActiveRequest();
  
  // Update local body when request changes
  useEffect(() => {
    if (request?.body) {
      setLocalBody(request.body);
    } else {
      setLocalBody({ mode: 'none' });
    }
  }, [request]);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as RequestBody['mode'];
    let newBody: RequestBody = { mode: newMode };

    switch (newMode) {
      case 'raw':
        newBody.raw = '';
        newBody.options = { raw: { language: 'json' } };
        break;  
      case 'form-data':
        newBody.formData = [{ key: '', value: '', type: 'text' }];
        break;
      case 'urlencoded':
        newBody.urlencoded = [{ key: '', value: '' }];
        break;
      case 'file':
        newBody.file = { name: '', content: '', src: '' };
        break;
    }

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const createEmptyFormDataItem = (): FormDataItem => ({
    key: '',
    value: '',
    type: 'text'
  });

  const handleFormDataChange = (
    index: number,
    field: 'key' | 'value' | 'type',
    value: string
  ) => {
    const existingFormData = body.formData || [];
    const newFormData: FormDataItem[] = [];

    // Copy existing items
    for (let i = 0; i < existingFormData.length; i++) {
      newFormData[i] = {...existingFormData[i]};
    }

    // Ensure the target index exists
    while (newFormData.length <= index) {
      newFormData.push(createEmptyFormDataItem());
    }

    // Update the target item
    if (field === 'type') {
      newFormData[index].type = value === 'file' ? 'file' : 'text';
    } else {
      newFormData[index][field] = value;
    }

    // Add new empty item if needed
    if (
      index === newFormData.length - 1 &&
      (newFormData[index].key || newFormData[index].value)
    ) {
      newFormData.push(createEmptyFormDataItem());
    }

    const newBody: RequestBody = {
      ...body,
      formData: newFormData
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleRawChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    const newBody: RequestBody = {
      ...body,
      raw: value,
      options: {  
        ...body.options!,
        raw: {
          language: body.options?.raw?.language || 'json'
        }
      }
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleLanguageChange = (language: string) => {
    const newBody: RequestBody = {
      ...body,
      raw: body.raw || '',
      options: { 
        ...body.options!,
        raw: {
          language: language as 'json' | 'html' | 'xml' | 'text' | 'javascript',
        }
      }
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newBody: RequestBody = {
        ...body,
        file: {
          name: file.name,
          content: reader.result as string,
          src: file.name
        }
      };

      setLocalBody(newBody);
      onChange(newBody);

      if (activeCollectionId && activeRequestId) {
        updateRequest(activeCollectionId, activeRequestId, { body: newBody });
      }
    };
    reader.readAsDataURL(file);
  };

  const renderFormData = () => {
    const formData = body.formData || [];
    
    return (
      <FormContainer>
        {formData.map((item: FormDataItem, index: number) => (
          <KeyValueRow key={index}>
            <KeyContainer>
              <Input
                $isKeyInput
                placeholder="Key"
                value={item.key}
                onChange={(e) => handleFormDataChange(index, 'key', e.target.value)}
              />
              <TypeSelect
                value={item.type}
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
                        src: undefined,
                        value: ''
                      };
                      const newBody: RequestBody = {
                        ...body,
                        formData: newFormData
                      };
                      setLocalBody(newBody);
                      onChange(newBody);
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
                    onChange={handleFileChange}
                  />
                </FileButton>
              )
            ) : (
              <Input
                placeholder="Value"
                value={item.value}
                onChange={(e) => handleFormDataChange(index, 'value', e.target.value)}
              />
            )}
          </KeyValueRow>
        ))}
        <AddButton onClick={() => {
          const newFormData = [...formData, createEmptyFormDataItem()];
          const newBody: RequestBody = { ...body, formData: newFormData };
          setLocalBody(newBody);
          onChange(newBody);
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
    if (!body || body.mode === 'none') {
      return <NoBodyText>This request does not have a body</NoBodyText>;
    }

    switch (body.mode) {
      case 'form-data':
        return renderFormData();

      case 'raw':
        return (
          <EditorContainer>
            <Select 
              value={body.options?.raw?.language || 'json'} 
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="text">Text</option>
              <option value="json">JSON</option>
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="xml">XML</option>
              <option value="text">Plain Text</option>
            </Select>
            <Editor
              height="400px"
              defaultLanguage={body.options?.raw?.language || 'json'}
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

      case 'file':
        return (
          <FormContainer>
            <FileButton>
              <FiFile /> {body.file?.name || 'Select File'}
              <FileInput
                type="file"
                onChange={handleFileChange}
              />
            </FileButton>
          </FormContainer>
        );

      case 'urlencoded':
        return (
          <FormContainer>
            {Array.isArray(body.urlencoded) && body.urlencoded.map((item: UrlEncodedItem, index: number) => (
              <KeyValueRow key={index}>
                <Input
                  placeholder="Key"
                  value={item.key}
                  onChange={(e) => {
                    const newUrlencoded = [...(body.urlencoded || [])];
                    newUrlencoded[index] = { ...item, key: e.target.value };
                    const newBody: RequestBody = {
                      ...body,
                      urlencoded: newUrlencoded
                    };
                    setLocalBody(newBody);
                    onChange(newBody);
                    if (activeCollectionId && activeRequestId) {
                      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
                    }
                  }}
                />
                <Input
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) => {
                    const newUrlencoded = [...(body.urlencoded || [])];
                    newUrlencoded[index] = { ...item, value: e.target.value };
                    const newBody: RequestBody = {
                      ...body,
                      urlencoded: newUrlencoded
                    };
                    setLocalBody(newBody);
                    onChange(newBody);
                    if (activeCollectionId && activeRequestId) {
                      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
                    }
                  }}
                />
              </KeyValueRow>
            ))}
            <AddButton onClick={() => {
              const newUrlencoded = [...(body.urlencoded || []), { key: '', value: '' }];
              const newBody: RequestBody = { ...body, urlencoded: newUrlencoded };
              setLocalBody(newBody);
              onChange(newBody);
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
      <Select value={body.mode} onChange={handleModeChange}>
        <option value="none">none</option>
        <option value="form-data">form-data</option>
        <option value="urlencoded">urlencoded</option>
        <option value="raw">raw</option>
        <option value="file">file</option>
      </Select>
      {renderBodyContent()}
    </Container>
  );
};

export default RequestBodyComponent; 