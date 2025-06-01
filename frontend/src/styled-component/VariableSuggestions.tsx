import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { getDynamicVariablesList } from '../utils/dynamicVariables';

const SuggestionsContainer = styled.div<{ visible: boolean }>`
  position: absolute;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  width: 250px;
  z-index: 1000;
  display: ${props => props.visible ? 'block' : 'none'};
  box-shadow: 0 2px 8px var(--color-shadow);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--color-panel);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }
`;

const SuggestionItem = styled.div<{ isSelected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  background: ${props => props.isSelected ? 'var(--color-border)' : 'transparent'};
  color: var(--color-text);
  font-family: monospace;
  font-size: 13px;

  &:hover {
    background: var(--color-panel-alt);
  }
`;

interface VariableSuggestionsProps {
  inputValue: string;
  cursorPosition: number;
  position: { top: number; left: number };
  onSelect: (suggestion: string) => void;
  visible: boolean;
}

export const VariableSuggestions: React.FC<VariableSuggestionsProps> = ({
  inputValue,
  cursorPosition,
  position,
  onSelect,
  visible
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) {
      setSuggestions([]);
      setSelectedIndex(0);
      return;
    }

    // Get the partial variable name that the user is typing
    const beforeCursor = inputValue.slice(0, cursorPosition);
    const match = beforeCursor.match(/\$[a-zA-Z]*$/);
    
    if (match) {
      const partialVar = match[0];
      // Get all available variables and filter based on the partial input
      const allVariables = getDynamicVariablesList();
      const filtered = allVariables.filter(variable => 
        variable.toLowerCase().startsWith(partialVar.toLowerCase())
      );
      setSuggestions(filtered);
      setSelectedIndex(0);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, cursorPosition, visible]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!visible || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          onSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSuggestions([]);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedIndex, visible]);

  if (!visible || suggestions.length === 0) return null;

  return (
    <SuggestionsContainer 
      ref={containerRef}
      visible={visible}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      {suggestions.map((suggestion, index) => (
        <SuggestionItem
          key={suggestion}
          isSelected={index === selectedIndex}
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </SuggestionItem>
      ))}
    </SuggestionsContainer>
  );
};