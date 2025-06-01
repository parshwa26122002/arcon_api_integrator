import React from 'react';
import styled from 'styled-components';
import { useVariableSuggestions } from '../hooks/useVariableSuggestions';
import { VariableSuggestions } from './VariableSuggestions';

const StyledInput = styled.input`
  background: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 13px;
  padding: 8px 12px;
  width: 100%;
  font-family: monospace;

  &:focus {
    outline: none;
    border-color: #7d4acf;
  }
`;

const StyledTextArea = styled.textarea`
  background: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 13px;
  padding: 8px 12px;
  width: 100%;
  font-family: monospace;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #7d4acf;
  }
`;

interface SuggestiveInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

export const SuggestiveInput: React.FC<SuggestiveInputProps> = ({
  value: initialValue,
  onChange,
  placeholder,
  multiline = false,
  className
}) => {
  const {
    inputRef,
    showSuggestions,
    suggestionsPosition,
    handleInputChange,
    handleSuggestionSelect,
    handleInputKeyDown,
    handleInputFocus,
    handleInputBlur,
    value,
    cursorPosition
  } = useVariableSuggestions({
    onValueChange: onChange
  });

  const InputComponent: React.ElementType = multiline ? StyledTextArea : StyledInput;

  return (
    <>
      <InputComponent
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className={className}
      />
      <VariableSuggestions
        inputValue={value}
        cursorPosition={cursorPosition}
        position={suggestionsPosition}
        onSelect={handleSuggestionSelect}
        visible={showSuggestions}
      />
    </>
  );
}; 