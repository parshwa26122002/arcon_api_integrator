import React, { useEffect } from 'react';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { useCollectionStore } from '../../store/collectionStore';

interface QueryParam {
  id: string;
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

const QueryParams: React.FC = () => {
  const {
    activeCollectionId,
    activeRequestId,
    updateRequest,
    getActiveRequest,
  } = useCollectionStore();

  const request = getActiveRequest();

  // Initialize params array with at least one empty row
  let params = request?.queryParams || [{
    id: uuid(),
    key: '',
    value: '',
    description: '',
    isSelected: false
  }];
  
  // Add empty row if the last row has content
  const lastParam = params[params.length - 1];
  if (lastParam && (lastParam.key || lastParam.value || lastParam.description)) {
    params = [
      ...params,
      {
        id: uuid(),
        key: '',
        value: '',
        description: '',
        isSelected: false
      }
    ];
  }

  // Parse query params from URL when request changes
  useEffect(() => {
    if (!request?.url || !activeCollectionId || !activeRequestId) return;

    try {
      const url = new URL(request.url.startsWith('http') ? request.url : `http://dummy.com${request.url}`);
      const urlParams = Array.from(url.searchParams.entries()).map(([key, value]) => ({
        id: uuid(),
        key,
        value,
        description: '',
        isSelected: true  // Set to true for params from URL
      }));

      // Add an empty row if there are no params
      if (urlParams.length === 0) {
        urlParams.push({
          id: uuid(),
          key: '',
          value: '',
          description: '',
          isSelected: false
        });
      }

      // Only update if params are different
      if (JSON.stringify(urlParams) !== JSON.stringify(request.queryParams)) {
        updateRequest(activeCollectionId, activeRequestId, {
          queryParams: urlParams
        });
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
    }
  }, [request?.url, activeCollectionId, activeRequestId]);

  const handleParamChange = (
    id: string,
    field: keyof Omit<QueryParam, 'id'>,
    value: string | boolean
  ) => {
    if (!activeCollectionId || !activeRequestId) return;

    const updatedParams = params.map(param => {
      if (param.id === id) {
        // Always update the specified field
        const updatedParam = { ...param, [field]: value };
        
        // If we're not explicitly changing isSelected, update it based on content
        if (field !== 'isSelected') {
          updatedParam.isSelected = Boolean(updatedParam.key || updatedParam.value);
        }
        
        return updatedParam;
      }
      return param;
    });

    // Update the request with new params
    updateRequest(activeCollectionId, activeRequestId, {
      queryParams: updatedParams
    });

    // Only update URL if we're changing key or value and we have a request
    if ((field === 'key' || field === 'value') && request?.url) {
      try {
        const url = new URL(request.url.startsWith('http') ? request.url : `http://dummy.com${request.url}`);
        url.search = ''; // Clear existing query params
        
        // Add all selected params to URL
        updatedParams.forEach(param => {
          if (param.isSelected && param.key) {
            url.searchParams.append(param.key, param.value || '');
          }
        });

        // Update the request URL, preserving the original protocol if it was relative
        const newUrl = request.url.startsWith('http') ? url.toString() : url.toString().replace('http://dummy.com', '');
        updateRequest(activeCollectionId, activeRequestId, {
          url: newUrl
        });
      } catch (error) {
        console.error('Error updating URL:', error);
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeCollectionId || !activeRequestId) return;

    const nonEmptyParams = params.filter(param => param.key || param.value || param.description);
    const updatedParams = params.map(param => ({
      ...param,
      isSelected: nonEmptyParams.includes(param) ? e.target.checked : param.isSelected
    }));

    updateRequest(activeCollectionId, activeRequestId, {
      queryParams: updatedParams
    });
  };

  return (
    <Container>
      <Title>Query Params</Title>
      <Table>
        <TableRow>
          <CheckboxCell>
            <Checkbox
              checked={params.length > 1 && params.slice(0, -1).every(param => param.isSelected)}
              onChange={handleSelectAll}
            />
          </CheckboxCell>
          <TableHeader>Key</TableHeader>
          <TableHeader>Value</TableHeader>
          <TableHeader>Description</TableHeader>
        </TableRow>
        {params.map((param) => (
          <TableRow key={param.id}>
            <CheckboxCell>
              <Checkbox
                checked={param.isSelected}
                onChange={(e) => handleParamChange(param.id, 'isSelected', e.target.checked)}
              />
            </CheckboxCell>
            <TableCell>
              <Input
                type="text"
                value={param.key || ''}
                onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
                placeholder="Parameter name"
              />
            </TableCell>
            <TableCell>
              <Input
                type="text"
                value={param.value || ''}
                onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
                placeholder="Parameter value"
              />
            </TableCell>
            <TableCell>
              <Input
                type="text"
                value={param.description || ''}
                onChange={(e) => handleParamChange(param.id, 'description', e.target.value)}
                placeholder="Parameter description"
              />
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </Container>
  );
};

export default QueryParams; 