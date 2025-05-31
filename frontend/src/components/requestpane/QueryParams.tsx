import React from 'react';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { FiTrash2 } from 'react-icons/fi';
import { type QueryParam } from '../../store/collectionStore';

interface QueryParamsProps {
  params: QueryParam[];
  onChange: (params: QueryParam[]) => void;
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

const QueryParams: React.FC<QueryParamsProps> = ({ params: initialParams, onChange }) => {
  // Initialize params array with at least one empty row
  let params = initialParams.length > 0 ? initialParams : [{
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

  const handleParamChange = (
    id: string,
    field: keyof Omit<QueryParam, 'id'>,
    value: string | boolean
  ) => {
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

    onChange(updatedParams);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedParams = params.map(param => ({
      ...param,
      isSelected: e.target.checked
    }));
    onChange(updatedParams);
  };

  const handleDeleteParam = (id: string) => {
    let updatedParams = params.filter(param => param.id !== id);
    
    // Ensure there's always at least one row
    if (updatedParams.length === 0) {
      updatedParams = [{
        id: uuid(),
        key: '',
        value: '',
        description: '',
        isSelected: false
      }];
    }

    onChange(updatedParams);
  };

  return (
    <Container>
      <Title>Query Parameters</Title>
      <Table>
        <TableRow>
          <CheckboxCell>
            <Checkbox
              checked={params.every(p => p.isSelected)}
              onChange={handleSelectAll}
            />
          </CheckboxCell>
          <TableHeader>Key</TableHeader>
          <TableHeader>Value</TableHeader>
          <TableHeader>Description</TableHeader>
          <TableHeader></TableHeader>
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
                value={param.key}
                onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
                placeholder="Parameter name"
              />
            </TableCell>
            <TableCell>
              <Input
                type="text"
                value={param.value}
                onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
                placeholder="Parameter value"
              />
            </TableCell>
            <TableCell>
              <Input
                type="text"
                value={param.description}
                onChange={(e) => handleParamChange(param.id, 'description', e.target.value)}
                placeholder="Parameter description"
              />
            </TableCell>
            <TableCell>
              <DeleteButton 
                onClick={() => handleDeleteParam(param.id)}
                title="Delete parameter"
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

export default QueryParams;