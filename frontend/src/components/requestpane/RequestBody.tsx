import React, { useState } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';
import { FiFile } from 'react-icons/fi';

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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #4a4a4a;
  background-color: #2d2d2d;
  
  th, td {
    border: 1px solid #4a4a4a;
    padding: 0.35rem 0.5rem;
  }
  
  th {
    background-color: #383838;
    color: #e1e1e1;
    font-weight: 500;
    text-align: left;
    font-size: 12px;
  }

  td {
    background-color: #2d2d2d;
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

const Input = styled.input`
  padding: 0.35rem 0.5rem;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  background-color: #2d2d2d;
  color: #e1e1e1;
  font-size: 12px;
  flex: 1;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }
`;

const SmallSelect = styled.select`
  padding: 0.35rem 0.5rem;
  border: 1px solid #4a4a4a;
  border-radius: 0 4px 4px 0;
  background-color: #2d2d2d;
  color: #e1e1e1;
  font-size: 12px;
  cursor: pointer;
  margin-left: -1px;
  min-width: 80px;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
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

const FileInfo = styled.p`
  color: #e1e1e1;
  font-size: 12px;
  margin-top: 0.35rem;
  padding: 0.35rem 0.5rem;
  background-color: #2d2d2d;
  border-radius: 4px;
  border: 1px solid #4a4a4a;
`;

interface KeyValuePair {
  key: string;
  value: string;
  type?: 'text' | 'file';
}

const RequestBody: React.FC = () => {
  const [bodyType, setBodyType] = useState<string>('none');
  const [rawFormat, setRawFormat] = useState<string>('json');
  const [formData, setFormData] = useState<KeyValuePair[]>([{ key: '', value: '', type: 'text' }]);
  const [urlEncodedData, setUrlEncodedData] = useState<KeyValuePair[]>([{ key: '', value: '' }]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFormDataAdd = () => {
    setFormData([...formData, { key: '', value: '', type: 'text' }]);
  };

  const handleUrlEncodedAdd = () => {
    setUrlEncodedData([...urlEncodedData, { key: '', value: '' }]);
  };

  const handleFormDataChange = (index: number, field: keyof KeyValuePair, value: string) => {
    const newData = [...formData];
    newData[index] = { ...newData[index], [field]: value };
    setFormData(newData);
  };

  const handleUrlEncodedChange = (index: number, field: keyof KeyValuePair, value: string) => {
    const newData = [...urlEncodedData];
    newData[index] = { ...newData[index], [field]: value };
    setUrlEncodedData(newData);
  };

  const renderBodyContent = () => {
    switch (bodyType) {
      case 'none':
        return <NoBodyText>This request has no body</NoBodyText>;
        
      case 'form-data':
        return (
          <div>
            {formData.map((item, index) => (
              <KeyValueRow key={index}>
                <div style={{ display: 'flex', flex: 1 }}>
                  <Input
                    placeholder="Key"
                    value={item.key}
                    onChange={(e) => handleFormDataChange(index, 'key', e.target.value)}
                  />
                  <SmallSelect
                    value={item.type}
                    onChange={(e) => handleFormDataChange(index, 'type', e.target.value as 'text' | 'file')}
                  >
                    <option value="text">Text</option>
                    <option value="file">File</option>
                  </SmallSelect>
                </div>
                {item.type === 'text' ? (
                  <Input
                    placeholder="Value"
                    value={item.value}
                    onChange={(e) => handleFormDataChange(index, 'value', e.target.value)}
                  />
                ) : (
                  <FileButton as="label">
                    <FiFile /> Choose File
                    <FileInput
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFormDataChange(index, 'value', file.name);
                        }
                      }}
                    />
                  </FileButton>
                )}
              </KeyValueRow>
            ))}
            <AddButton onClick={handleFormDataAdd}>Add Row</AddButton>
          </div>
        );
        
      case 'x-www-form-urlencoded':
        return (
          <div>
            <Table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {urlEncodedData.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <Input
                        value={item.key}
                        onChange={(e) => handleUrlEncodedChange(index, 'key', e.target.value)}
                        placeholder="Key"
                      />
                    </td>
                    <td>
                      <Input
                        value={item.value}
                        onChange={(e) => handleUrlEncodedChange(index, 'value', e.target.value)}
                        placeholder="Value"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <AddButton onClick={handleUrlEncodedAdd}>Add Row</AddButton>
          </div>
        );
        
      case 'raw':
        return (
          <EditorContainer>
            <Select value={rawFormat} onChange={(e) => setRawFormat(e.target.value)}>
              <option value="json">JSON</option>
              <option value="text">Text</option>
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="xml">XML</option>
            </Select>
            <Editor
              height="400px"
              defaultLanguage={rawFormat === 'javascript' ? 'javascript' : rawFormat}
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
          <div>
            <FileButton as="label">
              <FiFile /> Select File
              <FileInput
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                  }
                }}
              />
            </FileButton>
            {selectedFile && <FileInfo>Selected file: {selectedFile.name}</FileInfo>}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container>
      <Select value={bodyType} onChange={(e) => setBodyType(e.target.value)}>
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

export default RequestBody; 