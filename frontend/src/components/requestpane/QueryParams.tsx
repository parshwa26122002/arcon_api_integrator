import React, { useState } from 'react';
import styled from 'styled-components';

interface QueryParam {
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
  const [params, setParams] = useState<QueryParam[]>([
    { key: '', value: '', description: '', isSelected: false }
  ]);

  const handleParamChange = (
    index: number,
    field: keyof QueryParam,
    value: string | boolean
  ) => {
    const newParams = [...params];
    if (field === 'isSelected') {
      newParams[index][field] = value as boolean;
    } else {
      newParams[index][field] = value as string;
    }

    // Add new row if the last row has any content
    if (
      index === params.length - 1 &&
      (newParams[index].key || newParams[index].value || newParams[index].description)
    ) {
      newParams.push({ key: '', value: '', description: '', isSelected: false });
    }

    setParams(newParams);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newParams = params.map(param => ({
      ...param,
      isSelected: e.target.checked
    }));
    setParams(newParams);
  };

  return (
    <Container>
      <Title>Query Params</Title>
      <Table>
        <TableRow>
          <CheckboxCell>
            <Checkbox
              checked={params.every(param => param.isSelected)}
              onChange={handleSelectAll}
            />
          </CheckboxCell>
          <TableHeader>Key</TableHeader>
          <TableHeader>Value</TableHeader>
          <TableHeader>Description</TableHeader>
        </TableRow>
        {params.map((param, index) => (
          <TableRow key={index}>
            <CheckboxCell>
              <Checkbox
                checked={param.isSelected}
                onChange={(e) => handleParamChange(index, 'isSelected', e.target.checked)}
              />
            </CheckboxCell>
            <TableCell>
              <Input
                type="text"
                value={param.key}
                onChange={(e) => handleParamChange(index, 'key', e.target.value)}
                placeholder="Parameter name"
              />
            </TableCell>
            <TableCell>
              <Input
                type="text"
                value={param.value}
                onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                placeholder="Parameter value"
              />
            </TableCell>
            <TableCell>
              <Input
                type="text"
                value={param.description}
                onChange={(e) => handleParamChange(index, 'description', e.target.value)}
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