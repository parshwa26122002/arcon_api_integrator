import React from 'react';
import styled from 'styled-components';
import { useVariableSuggestions } from '../hooks/useVariableSuggestions';
import { VariableSuggestions } from './VariableSuggestions';

const StyledInput = styled.input`
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 13px;
  padding: 8px 12px;
  width: 100%;
  font-family: monospace;

  &:focus {
    outline: none;
    border-color: var(--color-tab-active);
  }
`;

const StyledTextArea = styled.textarea`
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 13px;
  padding: 8px 12px;
  width: 100%;
  font-family: monospace;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: var(--color-tab-active);
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
  // value: initialValue,
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