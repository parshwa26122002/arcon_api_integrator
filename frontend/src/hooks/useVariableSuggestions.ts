import { useState, useCallback, useRef } from 'react';

interface UseVariableSuggestionsProps {
  onValueChange: (value: string) => void;
}

interface UseVariableSuggestionsReturn {
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  showSuggestions: boolean;
  suggestionsPosition: { top: number; left: number };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSuggestionSelect: (suggestion: string) => void;
  handleInputKeyDown: (e: React.KeyboardEvent) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  value: string;
  cursorPosition: number;
}

export const useVariableSuggestions = ({ onValueChange }: UseVariableSuggestionsProps): UseVariableSuggestionsReturn => {
  const [value, setValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsPosition, setSuggestionsPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null!);

  const calculateSuggestionsPosition = () => {
    if (!inputRef.current) return;

    const inputElement = inputRef.current;
    const cursorOffset = inputElement.selectionStart || 0;
    
    // Create a temporary span to measure text width
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.style.font = window.getComputedStyle(inputElement).font;
    
    // Get text before cursor
    const textBeforeCursor = value.substring(0, cursorOffset);
    span.textContent = textBeforeCursor;
    document.body.appendChild(span);
    
    // Calculate position
    const rect = inputElement.getBoundingClientRect();
    const spanWidth = span.getBoundingClientRect().width;
    document.body.removeChild(span);
    
    // Position the suggestions below the cursor
    setSuggestionsPosition({
      top: rect.top + rect.height + window.scrollY,
      left: rect.left + spanWidth + window.scrollX
    });
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange(newValue);
    
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);
    
    // Show suggestions if typing a variable
    const beforeCursor = newValue.slice(0, cursorPos);
    const isTypingVariable = /\$[a-zA-Z]*$/.test(beforeCursor);
    
    setShowSuggestions(isTypingVariable);
    if (isTypingVariable) {
      calculateSuggestionsPosition();
    }
  }, [onValueChange]);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    if (!inputRef.current) return;

    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);
    const variableStart = beforeCursor.lastIndexOf('$');
    
    const newValue = beforeCursor.slice(0, variableStart) + suggestion + afterCursor;
    setValue(newValue);
    onValueChange(newValue);
    setShowSuggestions(false);

    // Set cursor position after the inserted suggestion
    const newCursorPos = variableStart + suggestion.length;
    inputRef.current.focus();
    inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
  }, [value, cursorPosition, onValueChange]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '$') {
      calculateSuggestionsPosition();
    }
  }, []);

  const handleInputFocus = useCallback(() => {
    const beforeCursor = value.slice(0, inputRef.current?.selectionStart || 0);
    const isTypingVariable = /\$[a-zA-Z]*$/.test(beforeCursor);
    
    if (isTypingVariable) {
      setShowSuggestions(true);
      calculateSuggestionsPosition();
    }
  }, [value]);

  const handleInputBlur = useCallback(() => {
    // Use setTimeout to allow click events on suggestions to fire before hiding
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, []);

  return {
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
  };
}; 