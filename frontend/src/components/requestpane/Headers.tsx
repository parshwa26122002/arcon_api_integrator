import React from 'react';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { FiTrash2 } from 'react-icons/fi';
import { type Header } from '../../store/collectionStore';

interface HeadersProps {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #e1e1e1;
  margin-bottom: 8px;
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
`;

const CheckboxCell = styled(TableCell)`
  width: 40px;
  text-align: center;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #7d4acf;
`;

const Input = styled.input`
  width: 100%;
  padding: 6px 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 12px;
  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }
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

const Headers: React.FC<HeadersProps> = ({ headers: initialHeaders, onChange }) => {
  // Initialize headers array with at least one empty row
  let headers = initialHeaders.length > 0 ? initialHeaders : [{
    id: uuid(),
    key: '',
    value: '',
    description: '',
    isSelected: false
  }];
  
  // Add empty row if the last row has content
  const lastHeader = headers[headers.length - 1];
  if (lastHeader && (lastHeader.key || lastHeader.value)) {
    headers = [
      ...headers,
      {
        id: uuid(),
        key: '',
        value: '',
        description: '',
        isSelected: false
      }
    ];
  }

  const handleHeaderChange = (
    id: string,
    field: keyof Omit<Header, 'id'>,
    value: string | boolean
  ) => {
    const updatedHeaders = headers.map(header => {
      if (header.id === id) {
        const updatedHeader = { ...header, [field]: value };
        
        // If we're not explicitly changing isSelected, update it based on content
        if (field !== 'isSelected') {
          updatedHeader.isSelected = Boolean(updatedHeader.key || updatedHeader.value);
        }
        return updatedHeader;
      }
      return header;
    });

    onChange(updatedHeaders);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedHeaders = headers.map(header => ({
      ...header,
      isSelected: e.target.checked
    }));

    onChange(updatedHeaders);
  };

  const handleDeleteHeader = (id: string) => {
    let updatedHeaders = headers.filter(header => header.id !== id);
    
    // Ensure there's always at least one row
    if (updatedHeaders.length === 0) {
      updatedHeaders = [{
        id: uuid(),
        key: '',
        value: '',
        description: '',
        isSelected: false
      }];
    }

    onChange(updatedHeaders);
  };

  return (
    <Container>
      <Title>Headers</Title>
      <Table>
        <TableRow>
          <CheckboxCell>
            <Checkbox
              checked={headers.every(h => h.isSelected)}
              onChange={handleSelectAll}
            />
          </CheckboxCell>
          <TableHeader>Key</TableHeader>
          <TableHeader>Value</TableHeader>
          <TableHeader>Description</TableHeader>
          <TableHeader></TableHeader>
        </TableRow>
        {headers.map((header) => (
          <TableRow key={header.id}>
            <CheckboxCell>
              <Checkbox
                checked={header.isSelected}
                onChange={(e) => handleHeaderChange(header.id, 'isSelected', e.target.checked)}
              />
            </CheckboxCell>
            <TableCell>
              <Input
                type="text"
                value={header.key}
                onChange={(e) => handleHeaderChange(header.id, 'key', e.target.value)}
                placeholder="Header name"
              />
            </TableCell>
            <TableCell>
              <Input
                type="text"
                value={header.value}
                onChange={(e) => handleHeaderChange(header.id, 'value', e.target.value)}
                placeholder="Header value"
              />
            </TableCell>
            <TableCell>
              <Input
                type="text"
                value={header.description}
                onChange={(e) => handleHeaderChange(header.id, 'description', e.target.value)}
                placeholder="Header description"
              />
            </TableCell>
            <TableCell>
              <DeleteButton 
                onClick={() => handleDeleteHeader(header.id)}
                title="Delete header"
              >
                <FiTrash2 />
              </DeleteButton>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </Container>
  );
};

export default Headers; 