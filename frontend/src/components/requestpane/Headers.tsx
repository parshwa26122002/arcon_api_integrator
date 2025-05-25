import React, { useState } from 'react';
import styled from 'styled-components';
import { FiTrash2 } from 'react-icons/fi';

interface Header {
  key: string;
  value: string;
  description: string;
  isSelected: boolean;
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

const ActionCell = styled(TableCell)`
  width: 40px;
  text-align: center;
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

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #7d4acf;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #808080;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    color: #ff4d4d;
    background-color: rgba(255, 77, 77, 0.1);
  }
`;

const Headers: React.FC = () => {
  const [headers, setHeaders] = useState<Header[]>([
    { key: '', value: '', description: '', isSelected: false }
  ]);

  const handleHeaderChange = (
    index: number,
    field: keyof Header,
    value: string | boolean
  ) => {
    const newHeaders = [...headers];
    if (field === 'isSelected') {
      newHeaders[index][field] = value as boolean;
    } else {
      newHeaders[index][field] = value as string;
    }

    // Add new row if the last row has any content
    if (
      index === headers.length - 1 &&
      (newHeaders[index].key || newHeaders[index].value || newHeaders[index].description)
    ) {
      newHeaders.push({ key: '', value: '', description: '', isSelected: false });
    }

    setHeaders(newHeaders);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeaders = headers.map(header => ({
      ...header,
      isSelected: e.target.checked
    }));
    setHeaders(newHeaders);
  };

  const handleDelete = (index: number) => {
    if (headers.length > 1) {
      const newHeaders = headers.filter((_, i) => i !== index);
      // Ensure there's always at least one empty row
      if (newHeaders.every(header => header.key || header.value || header.description)) {
        newHeaders.push({ key: '', value: '', description: '', isSelected: false });
      }
      setHeaders(newHeaders);
    }
  };

  return (
    <Container>
      <Title>Headers</Title>
      <Table>
        <TableRow>
          <CheckboxCell>
            <Checkbox
              checked={headers.every(header => header.isSelected)}
              onChange={handleSelectAll}
            />
          </CheckboxCell>
          <TableHeader>Key</TableHeader>
          <TableHeader>Value</TableHeader>
          <TableHeader>Description</TableHeader>
          <TableHeader></TableHeader>
        </TableRow>
        {headers.map((header, index) => (
          <TableRow key={index}>
            <CheckboxCell>
              <Checkbox
                checked={header.isSelected}
                onChange={(e) => handleHeaderChange(index, 'isSelected', e.target.checked)}
              />
            </CheckboxCell>
            <TableCell>
              <Input
                type="text"
                value={header.key}
                onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                placeholder="Header name"
              />
            </TableCell>
            <TableCell>
              <Input
                type="text"
                value={header.value}
                onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                placeholder="Header value"
              />
            </TableCell>
            <TableCell>
              <Input
                type="text"
                value={header.description}
                onChange={(e) => handleHeaderChange(index, 'description', e.target.value)}
                placeholder="Header description"
              />
            </TableCell>
            <ActionCell>
              <DeleteButton
                onClick={() => handleDelete(index)}
                title="Delete header"
              >
                <FiTrash2 size={16} />
              </DeleteButton>
            </ActionCell>
          </TableRow>
        ))}
      </Table>
    </Container>
  );
};

export default Headers; 