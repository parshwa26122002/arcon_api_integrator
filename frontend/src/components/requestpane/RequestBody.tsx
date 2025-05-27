import React, { useEffect } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';
import { FiFile, FiTrash2 } from 'react-icons/fi';
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
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
`;

const Select = styled.select`
  padding: 6px 8px;
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
  gap: 8px;
  padding: 6px 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  cursor: pointer;
  color: #e1e1e1;
  font-size: 12px;
  width: 100%;
  
  &:hover {
    background-color: #333333;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Table = styled.div`
  display: table;
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.div`
  display: table-row;
  &:hover {
    background-color: #333333;
  }
`;

const TableHeader = styled.div`
  display: table-cell;
  padding: 8px;
  font-weight: 600;
  color: #e1e1e1;
  border-bottom: 1px solid #4a4a4a;
  font-size: 12px;
`;

const TableCell = styled.div`
  display: table-cell;
  padding: 8px;
  border-bottom: 1px solid #4a4a4a;
  vertical-align: middle;
  width: 50%;
`;

const CheckboxCell = styled(TableCell)`
  width: 40px;
  text-align: center;
`;

const KeyContainer = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
`;

interface StyledInputProps {
  $isKeyInput?: boolean;
}

const Input = styled.input<StyledInputProps>`
  width: 100%;
  padding: 6px 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: ${props => props.$isKeyInput ? '4px 0 0 4px' : '4px'};
  color: #e1e1e1;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }

  &::placeholder {
    color: #888;
  }
`;

const TypeSelect = styled.select`
  padding: 6px 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-left: none;
  border-radius: 0 4px 4px 0;
  color: #e1e1e1;
  font-size: 12px;
  width: 80px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
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
  padding: 6px 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 12px;
  width: 100%;
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

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #7d4acf;
`;

const DeleteButton = styled.button`
  visibility: hidden;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  ${TableRow}:hover & {
    visibility: visible;
  }

  &:hover {
    background-color: #4a4a4a;
    color: #e1e1e1;
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
  const [isPretty, setIsPretty] = React.useState(false);
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
        newBody.formData = [{ key: '', value: '', type: 'text', isSelected: false }];
        break;
      case 'urlencoded':
        newBody.urlencoded = [{ key: '', value: '', isSelected: false }];
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
    type: 'text',
    isSelected: false
  });

  const createEmptyUrlEncodedItem = (): UrlEncodedItem => ({
    key: '',
    value: '',
    isSelected: false
  });

  const handleFormDataChange = (
    index: number,
    field: 'key' | 'value' | 'type' | 'isSelected',
    value: string | boolean
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
    } else if (field === 'isSelected') {
      newFormData[index].isSelected = value as boolean;
    } else {
      newFormData[index][field] = value as string;
      // Auto-select when content is added
      newFormData[index].isSelected = Boolean(newFormData[index].key || newFormData[index].value);
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

  const handleUrlEncodedChange = (
    index: number,
    field: 'key' | 'value' | 'isSelected',
    value: string | boolean
  ) => {
    const existingUrlEncoded = body.urlencoded || [];
    const newUrlEncoded: UrlEncodedItem[] = [];

    // Copy existing items
    for (let i = 0; i < existingUrlEncoded.length; i++) {
      newUrlEncoded[i] = {...existingUrlEncoded[i]};
    }

    // Ensure the target index exists
    while (newUrlEncoded.length <= index) {
      newUrlEncoded.push(createEmptyUrlEncodedItem());
    }

    // Update the target item
    if (field === 'isSelected') {
      newUrlEncoded[index].isSelected = value as boolean;
    } else {
      newUrlEncoded[index][field] = value as string;
      // Auto-select when content is added
      newUrlEncoded[index].isSelected = Boolean(newUrlEncoded[index].key || newUrlEncoded[index].value);
    }

    // Add new empty item if needed
    if (
      index === newUrlEncoded.length - 1 &&
      (newUrlEncoded[index].key || newUrlEncoded[index].value)
    ) {
      newUrlEncoded.push(createEmptyUrlEncodedItem());
    }

    const newBody: RequestBody = {
      ...body,
      urlencoded: newUrlEncoded
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleDeleteFormDataItem = (index: number) => {
    const formData = body.formData || [];
    let newFormData = formData.filter((_, i) => i !== index);

    // Ensure there's always at least one row
    if (newFormData.length === 0) {
      newFormData = [createEmptyFormDataItem()];
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

  const handleDeleteUrlEncodedItem = (index: number) => {
    const urlencoded = body.urlencoded || [];
    let newUrlEncoded = urlencoded.filter((_, i) => i !== index);

    // Ensure there's always at least one row
    if (newUrlEncoded.length === 0) {
      newUrlEncoded = [createEmptyUrlEncodedItem()];
    }

    const newBody: RequestBody = {
      ...body,
      urlencoded: newUrlEncoded
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleSelectAllFormData = (checked: boolean) => {
    const formData = body.formData || [];
    const newFormData = formData.map(item => ({
      ...item,
      isSelected: checked
    }));

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

  const handleSelectAllUrlEncoded = (checked: boolean) => {
    const urlencoded = body.urlencoded || [];
    const newUrlEncoded = urlencoded.map(item => ({
      ...item,
      isSelected: checked
    }));

    const newBody: RequestBody = {
      ...body,
      urlencoded: newUrlEncoded
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
    const formData = body.formData || [createEmptyFormDataItem()];
    
    return (
      <FormContainer>
        <Table>
          <TableRow>
            <CheckboxCell>
              <Checkbox
                checked={formData.every(item => item.isSelected)}
                onChange={(e) => handleSelectAllFormData(e.target.checked)}
              />
            </CheckboxCell>
            <TableHeader>Key</TableHeader>
            <TableHeader>Value</TableHeader>
            <TableHeader style={{ width: '40px' }}></TableHeader>
          </TableRow>
          {formData.map((item: FormDataItem, index: number) => (
            <TableRow key={index}>
              <CheckboxCell>
                <Checkbox
                  checked={item.isSelected}
                  onChange={(e) => handleFormDataChange(index, 'isSelected', e.target.checked)}
                />
              </CheckboxCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell style={{ width: '40px' }}>
                <DeleteButton
                  onClick={() => handleDeleteFormDataItem(index)}
                  title="Delete item"
                >
                  <FiTrash2 />
                </DeleteButton>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </FormContainer>
    );
  };

  const renderUrlEncoded = () => {
    const urlencoded = body.urlencoded || [createEmptyUrlEncodedItem()];
    
    return (
      <FormContainer>
        <Table>
          <TableRow>
            <CheckboxCell>
              <Checkbox
                checked={urlencoded.every(item => item.isSelected)}
                onChange={(e) => handleSelectAllUrlEncoded(e.target.checked)}
              />
            </CheckboxCell>
            <TableHeader>Key</TableHeader>
            <TableHeader>Value</TableHeader>
            <TableHeader style={{ width: '40px' }}></TableHeader>
          </TableRow>
          {urlencoded.map((item: UrlEncodedItem, index: number) => (
            <TableRow key={index}>
              <CheckboxCell>
                <Checkbox
                  checked={item.isSelected}
                  onChange={(e) => handleUrlEncodedChange(index, 'isSelected', e.target.checked)}
                />
              </CheckboxCell>
              <TableCell>
                <Input
                  placeholder="Key"
                  value={item.key}
                  onChange={(e) => handleUrlEncodedChange(index, 'key', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) => handleUrlEncodedChange(index, 'value', e.target.value)}
                />
              </TableCell>
              <TableCell style={{ width: '40px' }}>
                <DeleteButton
                  onClick={() => handleDeleteUrlEncodedItem(index)}
                  title="Delete item"
                >
                  <FiTrash2 />
                </DeleteButton>
              </TableCell>
            </TableRow>
          ))}
        </Table>
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
            {body.options?.raw?.language === 'json' && <label style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px' }}>
              <input type="checkbox" checked={isPretty} onChange={() => setIsPretty(!isPretty)} />
              Pretty Print
            </label>}

            <Editor
              height="400px"
              defaultLanguage={body.options?.raw?.language || 'json'}
              value={
                isPretty && body.options?.raw?.language === 'json'
                  ? (() => {
                      try {
                        return JSON.stringify(JSON.parse(body.raw || ''), null, 2);
                      } catch {
                        return body.raw || '';
                      }
                    })()
                  : body.raw || ''
              }
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
        return renderUrlEncoded();

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