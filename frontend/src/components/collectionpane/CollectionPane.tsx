import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import Authorization from '../requestpane/Authorization';
import { Tab } from '../../styled-component/Tab';
import { type Variable, type CollectionTabState } from '../../store/collectionStore';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 50px);
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid #4a4a4a;
  padding: 0 16px;
`;

const TabContent = styled.div`
  padding: 20px;
  color: #e1e1e1;
  flex: 1;
  overflow-y: auto;
`;

const CollectionTitle = styled.h2`
  color: #e1e1e1;
  margin: 0 0 16px 0;
  font-size: 24px;
`;

const Description = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 12px;
  background-color: #383838;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
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
  background-color: #383838;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
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
  background-color: #383838;
  border-radius: 4px;

  &:hover {
    background-color: #424242;
  }
`;

const Input = styled.input`
  padding: 6px 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
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
}

const emptyVariable: Variable = {
  id: crypto.randomUUID(),
  name: '',
  initialValue: '',
  currentValue: '',
  isSelected: true
};

const CollectionPane: React.FC<CollectionPaneProps> = ({ tabState, onStateChange }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'auth' | 'variables'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [variables, setVariables] = useState<Variable[]>(() => {
    const initialVars = tabState.variables || [];
    return initialVars.length === 0 ? [emptyVariable] : initialVars;
  });

  // Add useEffect to update variables when collection changes
  React.useEffect(() => {
    const collectionVars = tabState.variables || [];
    setVariables(collectionVars.length === 0 ? [emptyVariable] : collectionVars);
  }, [tabState.collectionId, tabState.variables]);

  const handleVariableChange = (id: string, field: keyof Variable, value: string | boolean) => {
    const updatedVariables = variables.map(variable =>
      variable.id === id ? { ...variable, [field]: value } : variable
    );

    // Check if the last row has any content
    const lastVariable = updatedVariables[updatedVariables.length - 1];
    const lastRowEmpty = !lastVariable.name && !lastVariable.initialValue && !lastVariable.currentValue;
    
    // If the last row has content, add a new empty row
    if (!lastRowEmpty) {
      updatedVariables.push({...emptyVariable, id: crypto.randomUUID()});
    }

    // Remove empty rows except the last one
    const cleanedVariables = updatedVariables.filter((variable, index) => {
      const rowEmpty = !variable.name && !variable.initialValue && !variable.currentValue;
      return !rowEmpty || index === updatedVariables.length - 1;
    });

    setVariables(cleanedVariables);
    // Update the collection store with the new variables
    onStateChange({ 
      variables: cleanedVariables.filter(
        (v) => v.name || v.initialValue || v.currentValue
      ),
      collectionId: tabState.collectionId 
    });
  };

  const handleDeleteVariable = (id: string) => {
    let updatedVariables = variables.filter(variable => variable.id !== id);
    
    // Ensure there's always at least one row
    if (updatedVariables.length === 0) {
      updatedVariables = [{...emptyVariable, id: crypto.randomUUID()}];
    }

    setVariables(updatedVariables);
    // Update the collection store with the new variables
    onStateChange({ 
      variables: updatedVariables.filter(
        (v) => v.name || v.initialValue || v.currentValue
      ),
      collectionId: tabState.collectionId 
    });
  };

  const handleDescriptionChange = (description: string) => {
    onStateChange({ description });
  };

  const handleAuthChange = (auth: { type: string; credentials: Record<string, string> }) => {
    onStateChange({ auth });
  };

  const filteredVariables = variables.filter(variable =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    !variable.name // Always show empty rows
  );

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
            <ViewDocButton>View Entire Documentation →</ViewDocButton>
          </>
        );
      case 'auth':
        return (
          <Authorization
            auth={tabState.auth || { type: 'none', credentials: {} }}
            onChange={handleAuthChange}
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
              {filteredVariables.map(variable => (
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
                    placeholder="Current value"
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
