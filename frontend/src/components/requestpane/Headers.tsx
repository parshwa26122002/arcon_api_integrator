import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { FiTrash2 } from 'react-icons/fi';
import { type Header } from '../../store/collectionStore';
import { getDynamicVariablesList } from '../../utils/dynamicVariables';

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

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
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

  // Variable suggestions state
  const [showSuggestions, setShowSuggestions] = useState<{ [key: string]: boolean }>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<{ id: string, field: string } | null>(null);
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
    field: keyof Omit<Header, 'id'>,
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

    handleHeaderChange(id, field, value);
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
    handleHeaderChange(id, field as keyof Omit<Header, 'id'>, newValue);

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
              <InputWrapper className="suggestion-wrapper">
                <Input
                  type="text"
                  ref={el => { if (el) inputRefs.current[header.id + 'key'] = el; }}
                  value={header.key}
                  onChange={(e) => handleInputChange(header.id, 'key', e.target.value, e.target.selectionStart || 0)}
                  placeholder="Header name"
                />
                {showSuggestions[header.id + 'key'] && suggestions.length > 0 && (
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
                  ref={el => { if (el) inputRefs.current[header.id + 'value'] = el; }}
                  value={header.value}
                  onChange={(e) => handleInputChange(header.id, 'value', e.target.value, e.target.selectionStart || 0)}
                  placeholder="Header value"
                />
                {showSuggestions[header.id + 'value'] && suggestions.length > 0 && (
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
                  ref={el => { if (el) inputRefs.current[header.id + 'description'] = el; }}
                  value={header.description}
                  onChange={(e) => handleInputChange(header.id, 'description', e.target.value, e.target.selectionStart || 0)}
                  placeholder="Header description"
                />
                {showSuggestions[header.id + 'description'] && suggestions.length > 0 && (
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