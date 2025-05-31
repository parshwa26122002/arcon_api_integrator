import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { FiTrash2 } from 'react-icons/fi';
import { type QueryParam } from '../../store/collectionStore';
import { getDynamicVariablesList } from '../../utils/dynamicVariables';

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

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  z-index: 1000;
`;

const SuggestionItem = styled.div`
  padding: 8px;
  cursor: pointer;
  color: #e1e1e1;
  
  &:hover {
    background-color: #3d3d3d;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
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

  // Variable suggestions state
  const [showSuggestions, setShowSuggestions] = React.useState<{ [key: string]: boolean }>({});
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [activeField, setActiveField] = React.useState<{ id: string, field: string } | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.suggestion-wrapper')) {
        setShowSuggestions({});
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleInputChange = (
    id: string,
    field: keyof Omit<QueryParam, 'id'>,
    value: string,
    cursorPosition: number
  ) => {
    // Check if we're typing a variable
    const beforeCursor = value.slice(0, cursorPosition);
    const isTypingVariable = /\$[a-zA-Z]*$/.test(beforeCursor);
    
    if (isTypingVariable) {
      const variablePrefix = beforeCursor.match(/\$[a-zA-Z]*$/)?.[0] || '';
      const dynamicVars = getDynamicVariablesList();
      const filteredSuggestions = dynamicVars.filter(v => 
        v.toLowerCase().startsWith(variablePrefix.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions({ ...showSuggestions, [id + field]: true });
      setActiveField({ id, field });
    } else {
      setShowSuggestions({ ...showSuggestions, [id + field]: false });
    }

    handleParamChange(id, field, value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!activeField) return;

    const { id, field } = activeField;
    const input = inputRefs.current[id + field];
    if (!input) return;

    const cursorPosition = input.selectionStart || 0;
    const currentValue = input.value;
    const beforeCursor = currentValue.slice(0, cursorPosition);
    const afterCursor = currentValue.slice(cursorPosition);
    const variableStart = beforeCursor.lastIndexOf('$');
    
    const newValue = beforeCursor.slice(0, variableStart) + suggestion + afterCursor;
    handleParamChange(id, field as keyof Omit<QueryParam, 'id'>, newValue);

    // Reset suggestions
    setShowSuggestions({ ...showSuggestions, [id + field]: false });
    setActiveField(null);

    // Set cursor position after the inserted suggestion
    setTimeout(() => {
      const newCursorPos = variableStart + suggestion.length;
      input.focus();
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleParamChange = (
    id: string,
    field: keyof Omit<QueryParam, 'id'>,
    value: string | boolean
  ) => {
    const updatedParams = params.map(param => {
      if (param.id === id) {
        const updatedParam = { ...param, [field]: value };
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
              <InputWrapper className="suggestion-wrapper">
                <Input
                  type="text"
                  ref={el => { if (el) inputRefs.current[param.id + 'key'] = el; }}
                  value={param.key}
                  onChange={(e) => handleInputChange(param.id, 'key', e.target.value, e.target.selectionStart || 0)}
                  placeholder="Parameter name"
                />
                {showSuggestions[param.id + 'key'] && suggestions.length > 0 && (
                  <SuggestionsContainer>
                    {suggestions.map((suggestion) => (
                      <SuggestionItem
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </SuggestionItem>
                    ))}
                  </SuggestionsContainer>
                )}
              </InputWrapper>
            </TableCell>
            <TableCell>
              <InputWrapper className="suggestion-wrapper">
                <Input
                  type="text"
                  ref={el => { if (el) inputRefs.current[param.id + 'value'] = el; }}
                  value={param.value}
                  onChange={(e) => handleInputChange(param.id, 'value', e.target.value, e.target.selectionStart || 0)}
                  placeholder="Parameter value"
                />
                {showSuggestions[param.id + 'value'] && suggestions.length > 0 && (
                  <SuggestionsContainer>
                    {suggestions.map((suggestion) => (
                      <SuggestionItem
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </SuggestionItem>
                    ))}
                  </SuggestionsContainer>
                )}
              </InputWrapper>
            </TableCell>
            <TableCell>
              <InputWrapper className="suggestion-wrapper">
                <Input
                  type="text"
                  ref={el => { if (el) inputRefs.current[param.id + 'description'] = el; }}
                  value={param.description}
                  onChange={(e) => handleInputChange(param.id, 'description', e.target.value, e.target.selectionStart || 0)}
                  placeholder="Parameter description"
                />
                {showSuggestions[param.id + 'description'] && suggestions.length > 0 && (
                  <SuggestionsContainer>
                    {suggestions.map((suggestion) => (
                      <SuggestionItem
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </SuggestionItem>
                    ))}
                  </SuggestionsContainer>
                )}
              </InputWrapper>
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