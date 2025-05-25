import React from 'react';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { useCollectionStore } from '../../store/collectionStore';

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

const Headers: React.FC = () => {
  const activeCollectionId = useCollectionStore(state => state.activeCollectionId);
  const activeRequestId = useCollectionStore(state => state.activeRequestId);
  const updateRequest = useCollectionStore(state => state.updateRequest);
  const request = useCollectionStore(state => {
    const collection = state.collections.find(c => c.id === state.activeCollectionId);
    return collection?.requests.find(r => r.id === state.activeRequestId) || null;
  });

  const handleHeaderChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    if (!activeCollectionId || !activeRequestId || !request) return;

    const newHeaders = [...(request.headers || [])];
    
    // Ensure the header exists
    if (!newHeaders[index]) {
      newHeaders[index] = {
        id: uuid(),
        key: '',
        value: ''
      };
    }

    // Update the field
    newHeaders[index] = {
      ...newHeaders[index],
      [field]: value
    };

    // Add new row if the last row has any content
    if (
      index === newHeaders.length - 1 &&
      (newHeaders[index].key || newHeaders[index].value)
    ) {
      newHeaders.push({
        id: uuid(),
        key: '',
        value: ''
      });
    }

    // Update the request in the store
    updateRequest(activeCollectionId, activeRequestId, {
      headers: newHeaders
    });
  };

  // Ensure there's always at least one empty row
  const headers = request?.headers || [{
    id: uuid(),
    key: '',
    value: ''
  }];

  if (headers.length === 0 || headers[headers.length - 1].key || headers[headers.length - 1].value) {
    headers.push({
      id: uuid(),
      key: '',
      value: ''
    });
  }

  return (
    <Container>
      <Title>Headers</Title>
      <Table>
        <TableRow>
          <TableHeader>Key</TableHeader>
          <TableHeader>Value</TableHeader>
        </TableRow>
        {headers.map((header, index) => (
          <TableRow key={header.id}>
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
          </TableRow>
        ))}
      </Table>
    </Container>
  );
};

export default Headers; 