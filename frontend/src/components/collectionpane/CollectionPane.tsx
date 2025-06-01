import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import Authorization from '../requestpane/Authorization';
import { Tab } from '../../styled-component/Tab';
import { type Variable, type CollectionTabState } from '../../store/collectionStore';
import { useCallback } from 'react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: var(--color-panel);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 50px);
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-border);
  padding: 0 16px;
`;

const TabContent = styled.div`
  padding: 20px;
  color: var(--color-text);
  flex: 1;
  overflow-y: auto;
`;

const CollectionTitle = styled.h2`
  color: var(--color-text);
  margin: 0 0 16px 0;
  font-size: 24px;
`;

const Description = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 12px;
  background-color: var(--color-panel-alt);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 14px;
  resize: vertical;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: var(--color-tab-active);
  }

  &::placeholder {
    color: #888;
  }
`;

const ViewDocButton = styled.button`
  background: none;
  border: none;
  color: #7c3aed;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 36px;
  background-color: var(--color-panel-alt);
  border: 1px var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color:var(--color-tab-active);
  }

  &::placeholder {
    color: #888;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
`;

const VariableTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const VariableRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 8px;
  background-color: var(--color-panel);
  border: 1px solid var(--color-border);
  border-radius: 4px;

  &:hover {
    background-color: var(--color-panel-hover);
  }
`;

const Input = styled.input`
  padding: 6px 8px;
  background-color: var(--color-panel-alt);
  border: 1px solid #var(--color-border);
  border-radius: 4px;
  color: #var(--color-text);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }
`;

const Checkbox = styled.input`
  margin: 0;
  cursor: pointer;
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

  ${VariableRow}:hover & {
    visibility: visible;
  }

  &:hover {
    background-color: #4a4a4a;
    color: #e1e1e1;
  }
`;

interface CollectionPaneProps {
  tabState: CollectionTabState;
    onStateChange: (newState: Partial<CollectionTabState>) => void;
    openDocumentationTab?: (collectionId: string, title: string, content: string) => void;

}

const CollectionPane: React.FC<CollectionPaneProps> = ({ tabState, onStateChange, openDocumentationTab }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'auth' | 'variables'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const handleVariableChange = (id: string, field: keyof Variable, value: string | boolean) => {
    const currentVariables = tabState.variables || [];
    const updatedVariables = currentVariables.map(variable =>
      variable.id === id ? { ...variable, [field]: value } : variable
    );

    // Check if the last row has any content
    const lastVariable = updatedVariables[updatedVariables.length - 1];
    const isLastRowEmpty = !lastVariable?.name && !lastVariable?.initialValue && !lastVariable?.currentValue;
    
    // If the last row has content, add a new empty row
    if (!isLastRowEmpty || updatedVariables.length === 0) {
      updatedVariables.push({
        id: crypto.randomUUID(),
        name: '',
        initialValue: '',
        currentValue: '',
        isSelected: true
      });
    }

    // Remove empty rows except the last one
    const cleanedVariables = updatedVariables.filter((variable, index) => {
      const isEmpty = !variable.name && !variable.initialValue && !variable.currentValue;
      return !isEmpty || index === updatedVariables.length - 1;
    });

    onStateChange({ variables: cleanedVariables });
  };

  const handleDeleteVariable = (id: string) => {
    const currentVariables = tabState.variables || [];
    let updatedVariables = currentVariables.filter(variable => variable.id !== id);
    
    // Ensure there's always at least one empty row
    if (updatedVariables.length === 0) {
      updatedVariables = [{
        id: crypto.randomUUID(),
        name: '',
        initialValue: '',
        currentValue: '',
        isSelected: true
      }];
    }

    onStateChange({ variables: updatedVariables });
  };

  const handleDescriptionChange = (description: string) => {
    onStateChange({ description });
  };

  const handleAuthChange = (auth: { type: string; credentials: Record<string, string> }) => {
    onStateChange({ auth });
  };

  const filteredVariables = (tabState.variables || []).filter(variable =>
    variable.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    !variable.name // Always show empty rows
  );

  // Ensure we always have at least one row to display
  const variablesToDisplay = filteredVariables.length === 0 ? [{
    id: crypto.randomUUID(),
    name: '',
    initialValue: '',
    currentValue: '',
    isSelected: false
  }] : filteredVariables;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <CollectionTitle>{tabState.title || 'Collection Name'}</CollectionTitle>
            <Description
              placeholder="More about collection"
              value={tabState.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
            <ViewDocButton onClick={handleOpenDocumentationTab}>
                View Entire Documentation →
            </ViewDocButton>
          </>
        );
      case 'auth':
        return (
          <Authorization
            auth={tabState.auth || { type: "none", credentials: {} }}
            onChange={handleAuthChange}
            Id={tabState.id.toString()}
            isRequest={false}
          />
        );
      case 'variables':
        return (
          <>
            <SearchBox>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Filter variables"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>
            <VariableTable>
              {variablesToDisplay.map(variable => (
                <VariableRow key={variable.id}>
                  <Checkbox
                    type="checkbox"
                    checked={variable.isSelected}
                    onChange={(e) => handleVariableChange(variable.id, 'isSelected', e.target.checked)}
                  />
                  <Input
                    value={variable.name}
                    onChange={(e) => handleVariableChange(variable.id, 'name', e.target.value)}
                    placeholder="Variable name"
                  />
                  <Input
                    value={variable.currentValue}
                    onChange={(e) => handleVariableChange(variable.id, 'currentValue', e.target.value)}
                    placeholder="Value"
                  />
                  <DeleteButton 
                    onClick={() => handleDeleteVariable(variable.id)}
                    title="Delete variable"
                  >
                    <FiTrash2 />
                  </DeleteButton>
                </VariableRow>
              ))}
            </VariableTable>
          </>
        );
      default:
        return null;
    }
  };
  const handleOpenDocumentationTab = useCallback(() => {
        if (openDocumentationTab) {
            openDocumentationTab(
                tabState.collectionId || '', // fallback if undefined
                tabState.title || 'Documentation',
                tabState.description || ''
            );
        }
  }, [openDocumentationTab, tabState]);
  return (
    <Container>
      <TabList>
        <Tab
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Tab>
        <Tab
          active={activeTab === 'auth'}
          onClick={() => setActiveTab('auth')}
        >
          Authorization
        </Tab>
        <Tab
          active={activeTab === 'variables'}
          onClick={() => setActiveTab('variables')}
        >
          Variables
        </Tab>
      </TabList>
      <TabContent>
        {renderTabContent()}
      </TabContent>
    </Container>
  );
};

export default CollectionPane;
