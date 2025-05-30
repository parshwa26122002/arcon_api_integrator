import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';
import { FiFile, FiTrash2, FiSearch } from 'react-icons/fi';
import { useCollectionStore } from '../../store/collectionStore';
import { getDynamicVariablesList, setVariableConfigurations } from '../../utils/dynamicVariables';
import type { 
  RequestBody,
  FormDataItem,
  UrlEncodedItem,
} from '../../store/collectionStore';

interface RequestBodyProps {
  body: RequestBody;
  onChange: (body: RequestBody) => void;
}

interface VariableConfig {
  minLength: string;
  maxLength: string;
  minValue: string;
  maxValue: string;
  exactLength: string;
  allowUnderscore: boolean;
  // Password specific configs
  minSpecialChars: string;
  maxSpecialChars: string;
  minNumbers: string;
  maxNumbers: string;
  show: boolean;
  type: 'length' | 'range' | 'exact' | 'username' | 'password';
}

interface VariableConfigs {
  [key: string]: VariableConfig;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  min-height: 0;
`;

const Select = styled.select`
  padding: 6px 8px;
  width: 150px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  background-color: #2d2d2d;
  color: #e1e1e1;
  font-size: 12px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  cursor: pointer;
  color: #e1e1e1;
  font-size: 12px;
  width: 100%;
  
  &:hover {
    background-color: #333333;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow-y: auto;
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
  width: 50%;
`;

const CheckboxCell = styled(TableCell)`
  width: 40px;
  text-align: center;
`;

const KeyContainer = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
`;

interface StyledInputProps {
  $isKeyInput?: boolean;
}

const Input = styled.input<StyledInputProps>`
  width: 100%;
  padding: 6px 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: ${props => props.$isKeyInput ? '4px 0 0 4px' : '4px'};
  color: #e1e1e1;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }

  &::placeholder {
    color: #888;
  }
`;

const TypeSelect = styled.select`
  padding: 6px 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-left: none;
  border-radius: 0 4px 4px 0;
  color: #e1e1e1;
  font-size: 12px;
  width: 80px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }
`;

const NoBodyText = styled.p`
  color: #999;
  font-size: 12px;
  text-align: center;
  padding: 1rem;
  background-color: #2d2d2d;
  border-radius: 4px;
  border: 1px dashed #4a4a4a;
`;

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 200px;
  flex: 1;

  .monaco-editor {
    min-height: 200px;
    border-radius: 4px;
    overflow: hidden;
  }
`;

const FileDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 12px;
  width: 100%;
`;

const FileNameText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; // Adjust this value based on your layout
  flex: 1;
`;

const FileIcon = styled(FiFile)`
  flex-shrink: 0;
`;

const DeleteFileButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #ff4444;
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #7d4acf;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e1e1e1;
  font-size: 14px;
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

  ${TableRow}:hover & {
    visibility: visible;
  }

  &:hover {
    background-color: #4a4a4a;
    color: #e1e1e1;
  }
`;

const CheckVariablesButton = styled.button`
  padding: 8px 16px;
  background-color: #4a4a4a;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  margin-top: 16px;
  
  &:hover {
    background-color: #5a5a5a;
  }
`;

const LengthConfigForm = styled.div`
  padding: 16px;
  background-color: #2d2d2d;
  border-radius: 4px;
  border: 1px solid #4a4a4a;
  flex-shrink: 0;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  align-items: center;
`;

const Label = styled.label`
  color: #e1e1e1;
  font-size: 14px;
  min-width: 100px;
`;

const NumberInput = styled.input`
  padding: 6px 8px;
  background-color: #383838;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 14px;
  width: 100px;
  
  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }
`;

const ApplyButton = styled.button`
  padding: 6px 12px;
  background-color: #4a4a4a;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #5a5a5a;
  }
`;

const BodyContentWrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const TopControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
`;

const VariableNameLabel = styled.div`
  color: #e1e1e1;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  padding: 4px 8px;
  background-color: #383838;
  border-radius: 4px;
  display: inline-block;
`;

const ConfigFormsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #2d2d2d;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    border-radius: 4px;
  }
`;

const ApplyAllButton = styled(ApplyButton)`
  width: 100%;
  margin-top: 8px;
  background-color: #7d4acf;
  
  &:hover {
    background-color: #9666d8;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 12px;
  margin-top: 8px;
  padding: 8px;
  background-color: rgba(255, 68, 68, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 68, 68, 0.2);
`;

const BottomSection = styled.div`
  flex-shrink: 0;
  border-top: 1px solid #4a4a4a;
  padding-top: 16px;
  margin-top: auto;
`;

const InvalidVariableMessage = styled.div`
  color: #ff4444;
  font-size: 12px;
  margin-bottom: 8px;
  padding: 8px;
  background-color: rgba(255, 68, 68, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 68, 68, 0.2);
`;

const RequestBodyComponent: React.FC<RequestBodyProps> = ({ body, onChange }) => {
  const {
    activeCollectionId,
    activeRequestId,
    updateRequest,
    getActiveRequest
  } = useCollectionStore();

  const [, setLocalBody] = React.useState<RequestBody>(body);
  const [isPretty, setIsPretty] = React.useState(false);
  const request = getActiveRequest();
  const [showLengthConfig, setShowLengthConfig] = useState(false);
  const [minLength, setMinLength] = useState('2');
  const [maxLength, setMaxLength] = useState('10');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [invalidVariables, setInvalidVariables] = useState<string[]>([]);

  const defaultConfig = {
    minLength: '0',
    maxLength: '0',
    minValue: '0',
    maxValue: '0',
    exactLength: '0',
    allowUnderscore: true,
    minSpecialChars: '1',
    maxSpecialChars: '3',
    minNumbers: '1',
    maxNumbers: '3',
    show: false,
  };

  const [variableConfigs, setVariableConfigs] = useState<VariableConfigs>({
    // Text-based variables (length restrictions)
    '$randomLastName': { ...defaultConfig, minLength: '2', maxLength: '10', type: 'length' },
    '$randomFirstName': { ...defaultConfig, minLength: '2', maxLength: '10', type: 'length' },
    '$randomFullName': { ...defaultConfig, minLength: '2', maxLength: '20', type: 'length' },
    '$randomJobTitle': { ...defaultConfig, minLength: '5', maxLength: '30', type: 'length' },
    '$randomStreetName': { ...defaultConfig, minLength: '5', maxLength: '30', type: 'length' },
    '$randomStreetAddress': { ...defaultConfig, minLength: '10', maxLength: '50', type: 'length' },
    '$randomAlphaNumeric': { ...defaultConfig, minLength: '5', maxLength: '15', type: 'length' },
    '$randomHexaDecimal': { ...defaultConfig, minLength: '4', maxLength: '12', type: 'length' },
    // Numeric variables (range restrictions)
    '$randomInt': { ...defaultConfig, minValue: '0', maxValue: '100000', type: 'range' },
    '$randomFloat': { ...defaultConfig, minValue: '0', maxValue: '100000', type: 'range' },
    '$randomPrice': { ...defaultConfig, minValue: '0', maxValue: '1000', type: 'range' },
    // Exact length variables
    '$randomBankAccount': { ...defaultConfig, exactLength: '10', type: 'exact' },
    // Username configuration
    '$randomUserName': { 
      ...defaultConfig, 
      minLength: '5', 
      maxLength: '15',
      type: 'username',
      allowUnderscore: true
    },
    // Password configuration
    '$randomPassword': { 
      ...defaultConfig, 
      minLength: '8', 
      maxLength: '16',
      type: 'password'
    },
  });

  // Reset configurations when request changes
  useEffect(() => {
    setVariableConfigs(prev => {
      const resetConfigs = Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: { ...prev[key], show: false }
      }), {} as VariableConfigs);
      return resetConfigs;
    });
    setValidationError(null);
  }, [activeRequestId, body]);

  // Update local body when request changes
  useEffect(() => {
    if (request?.body) {
      setLocalBody(request.body);
    } else {
      setLocalBody({ mode: 'none' });
    }
  }, [request]);

  const checkDynamicVariables = () => {
    if (!request) return;

    const requestString = JSON.stringify(request);
    const dynamicVars = getDynamicVariablesList();
    
    // Find all potential dynamic variables in the request
    const variablePattern = /\$[a-zA-Z]+/g;
    const foundPotentialVars = requestString.match(variablePattern) || [];
    
    // Find invalid variables (those not in the dynamicVars list)
    const invalidVars = foundPotentialVars.filter(
      variable => !dynamicVars.includes(variable)
    );
    
    setInvalidVariables(invalidVars);
    
    // Reset all configurations first
    setVariableConfigs(prev => {
      const newConfigs = { ...prev };
      Object.keys(newConfigs).forEach(key => {
        newConfigs[key] = { ...newConfigs[key], show: false };
      });
      
      // Only show configurations for valid variables found in the current request
      dynamicVars.forEach(variable => {
        const patterns = [
          variable,
          `{${variable}}`,
          `{{${variable}}}`,
        ];
        if (patterns.some(pattern => requestString.includes(pattern))) {
          if (newConfigs[variable]) {
            newConfigs[variable] = { ...newConfigs[variable], show: true };
          }
        }
      });
      
      return newConfigs;
    });
  };

  // Reset invalid variables when request changes
  useEffect(() => {
    setInvalidVariables([]);
  }, [activeRequestId, body]);

  // Check for dynamic variables when request changes
  useEffect(() => {
    checkDynamicVariables();
  }, [request]);

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as RequestBody['mode'];
    let newBody: RequestBody = { mode: newMode };

    switch (newMode) {
      case 'raw':
        newBody.raw = '';
        newBody.options = { raw: { language: 'json' } };
        break;  
      case 'form-data':
        newBody.formData = [{ key: '', value: '', type: 'text', isSelected: false }];
        break;
      case 'urlencoded':
        newBody.urlencoded = [{ key: '', value: '', isSelected: false }];
        break;
      case 'file':
        newBody.file = { name: '', content: '', src: '' };
        break;
    }

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const createEmptyFormDataItem = (): FormDataItem => ({
    key: '',
    value: '',
    type: 'text',
    isSelected: false
  });

  const createEmptyUrlEncodedItem = (): UrlEncodedItem => ({
    key: '',
    value: '',
    isSelected: false
  });

  const handleFormDataChange = (
    index: number,
    field: 'key' | 'value' | 'type' | 'isSelected',
    value: string | boolean
  ) => {
    const existingFormData = body.formData || [];
    const newFormData: FormDataItem[] = [];

    // Copy existing items
    for (let i = 0; i < existingFormData.length; i++) {
      newFormData[i] = {...existingFormData[i]};
    }

    // Ensure the target index exists
    while (newFormData.length <= index) {
      newFormData.push(createEmptyFormDataItem());
    }

    // Update the target item
    if (field === 'type') {
      newFormData[index].type = value === 'file' ? 'file' : 'text';
    } else if (field === 'isSelected') {
      newFormData[index].isSelected = value as boolean;
    } else {
      newFormData[index][field] = value as string;
      // Auto-select when content is added
      newFormData[index].isSelected = Boolean(newFormData[index].key || newFormData[index].value);
    }

    // Add new empty item if needed
    if (
      index === newFormData.length - 1 &&
      (newFormData[index].key || newFormData[index].value)
    ) {
      newFormData.push(createEmptyFormDataItem());
    }

    const newBody: RequestBody = {
      ...body,
      formData: newFormData
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleUrlEncodedChange = (
    index: number,
    field: 'key' | 'value' | 'isSelected',
    value: string | boolean
  ) => {
    const existingUrlEncoded = body.urlencoded || [];
    const newUrlEncoded: UrlEncodedItem[] = [];

    // Copy existing items
    for (let i = 0; i < existingUrlEncoded.length; i++) {
      newUrlEncoded[i] = {...existingUrlEncoded[i]};
    }

    // Ensure the target index exists
    while (newUrlEncoded.length <= index) {
      newUrlEncoded.push(createEmptyUrlEncodedItem());
    }

    // Update the target item
    if (field === 'isSelected') {
      newUrlEncoded[index].isSelected = value as boolean;
    } else {
      newUrlEncoded[index][field] = value as string;
      // Auto-select when content is added
      newUrlEncoded[index].isSelected = Boolean(newUrlEncoded[index].key || newUrlEncoded[index].value);
    }

    // Add new empty item if needed
    if (
      index === newUrlEncoded.length - 1 &&
      (newUrlEncoded[index].key || newUrlEncoded[index].value)
    ) {
      newUrlEncoded.push(createEmptyUrlEncodedItem());
    }

    const newBody: RequestBody = {
      ...body,
      urlencoded: newUrlEncoded
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleDeleteFormDataItem = (index: number) => {
    const formData = body.formData || [];
    let newFormData = formData.filter((_, i) => i !== index);

    // Ensure there's always at least one row
    if (newFormData.length === 0) {
      newFormData = [createEmptyFormDataItem()];
    }

    const newBody: RequestBody = {
      ...body,
      formData: newFormData
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleDeleteUrlEncodedItem = (index: number) => {
    const urlencoded = body.urlencoded || [];
    let newUrlEncoded = urlencoded.filter((_, i) => i !== index);

    // Ensure there's always at least one row
    if (newUrlEncoded.length === 0) {
      newUrlEncoded = [createEmptyUrlEncodedItem()];
    }

    const newBody: RequestBody = {
      ...body,
      urlencoded: newUrlEncoded
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleSelectAllFormData = (checked: boolean) => {
    const formData = body.formData || [];
    const newFormData = formData.map(item => ({
      ...item,
      isSelected: checked
    }));

    const newBody: RequestBody = {
      ...body,
      formData: newFormData
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleSelectAllUrlEncoded = (checked: boolean) => {
    const urlencoded = body.urlencoded || [];
    const newUrlEncoded = urlencoded.map(item => ({
      ...item,
      isSelected: checked
    }));

    const newBody: RequestBody = {
      ...body,
      urlencoded: newUrlEncoded
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleRawChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    const newBody: RequestBody = {
      ...body,
      raw: value,
      options: {  
        ...body.options!,
        raw: {
          language: body.options?.raw?.language || 'json'
        }
      }
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleLanguageChange = (language: string) => {
    const newBody: RequestBody = {
      ...body,
      raw: body.raw || '',
      options: { 
        ...body.options!,
        raw: {
          language: language as 'json' | 'html' | 'xml' | 'text' | 'javascript',
        }
      }
    };

    setLocalBody(newBody);
    onChange(newBody);

    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { body: newBody });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newBody: RequestBody = {
        ...body,
        file: {
          name: file.name,
          content: reader.result as string,
          src: file.name
        }
      };

      setLocalBody(newBody);
      onChange(newBody);

      if (activeCollectionId && activeRequestId) {
        updateRequest(activeCollectionId, activeRequestId, { body: newBody });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfigChange = (
    varName: string,
    field: keyof VariableConfig,
    value: string | boolean
  ) => {
    setVariableConfigs(prev => ({
      ...prev,
      [varName]: {
        ...prev[varName],
        [field]: value
      }
    }));
  };

  const handleApplyAllConfigs = () => {
    // Validate configurations before applying
    const invalidConfigs = Object.entries(variableConfigs)
      .filter(([_, config]) => config.show)
      .filter(([_, config]) => {
        if (config.type === 'length' || config.type === 'username') {
          const min = parseInt(config.minLength);
          const max = parseInt(config.maxLength);
          return min > max;
        } else if (config.type === 'range') {
          const min = parseFloat(config.minValue);
          const max = parseFloat(config.maxValue);
          return min > max;
        } else if (config.type === 'password') {
          const minLength = parseInt(config.minLength);
          const maxLength = parseInt(config.maxLength);
          const minSpecial = parseInt(config.minSpecialChars);
          const maxSpecial = parseInt(config.maxSpecialChars);
          const minNums = parseInt(config.minNumbers);
          const maxNums = parseInt(config.maxNumbers);
          
          return minLength > maxLength || 
                 minSpecial > maxSpecial || 
                 minNums > maxNums ||
                 minSpecial + minNums > maxLength;
        } else { // type === 'exact'
          const length = parseInt(config.exactLength);
          return length <= 0;
        }
      })
      .map(([varName]) => varName);

    if (invalidConfigs.length > 0) {
      setValidationError(`Invalid configurations: ${invalidConfigs.map(name => {
        const config = variableConfigs[name];
        if (config.type === 'exact') {
          return `${name} must have a positive length`;
        } else if (config.type === 'password') {
          return `${name} has invalid min/max values or required characters exceed max length`;
        }
        return `${name} has min value greater than max value`;
      }).join(', ')}`);
      return;
    }

    setValidationError(null);
    const configs = Object.entries(variableConfigs)
      .filter(([_, config]) => config.show)
      .reduce((acc, [varName, config]) => ({
        ...acc,
        [varName]: config.type === 'password'
          ? {
              minLength: parseInt(config.minLength),
              maxLength: parseInt(config.maxLength),
              minSpecialChars: parseInt(config.minSpecialChars),
              maxSpecialChars: parseInt(config.maxSpecialChars),
              minNumbers: parseInt(config.minNumbers),
              maxNumbers: parseInt(config.maxNumbers)
            }
          : config.type === 'length' || config.type === 'username'
          ? {
              minLength: parseInt(config.minLength),
              maxLength: parseInt(config.maxLength),
              ...(config.type === 'username' && { allowUnderscore: config.allowUnderscore })
            }
          : config.type === 'range'
          ? {
              minValue: parseFloat(config.minValue),
              maxValue: parseFloat(config.maxValue)
            }
          : {
              exactLength: parseInt(config.exactLength)
            }
      }), {});

    setVariableConfigurations(configs);
    console.log('Applied variable configurations:', configs);
  };

  const renderVariableForm = (varName: string) => {
    if (!variableConfigs[varName].show) return null;

    const config = variableConfigs[varName];
    const isRange = config.type === 'range';
    const isExact = config.type === 'exact';
    const isUsername = config.type === 'username';
    const isPassword = config.type === 'password';

    return (
      <LengthConfigForm key={varName}>
        <VariableNameLabel>
          Variable: {varName}
        </VariableNameLabel>
        {isExact ? (
          <FormRow>
            <Label>Exact Length:</Label>
            <NumberInput
              type="number"
              min="1"
              step="1"
              value={config.exactLength}
              onChange={(e) => handleConfigChange(varName, 'exactLength', e.target.value)}
            />
          </FormRow>
        ) : isPassword ? (
          <>
            <FormRow>
              <Label>Min Length:</Label>
              <NumberInput
                type="number"
                min="1"
                step="1"
                value={config.minLength}
                onChange={(e) => handleConfigChange(varName, 'minLength', e.target.value)}
              />
            </FormRow>
            <FormRow>
              <Label>Max Length:</Label>
              <NumberInput
                type="number"
                min="1"
                step="1"
                value={config.maxLength}
                onChange={(e) => handleConfigChange(varName, 'maxLength', e.target.value)}
              />
            </FormRow>
            <FormRow>
              <Label>Min Special Chars:</Label>
              <NumberInput
                type="number"
                min="0"
                step="1"
                value={config.minSpecialChars}
                onChange={(e) => handleConfigChange(varName, 'minSpecialChars', e.target.value)}
              />
            </FormRow>
            <FormRow>
              <Label>Max Special Chars:</Label>
              <NumberInput
                type="number"
                min="0"
                step="1"
                value={config.maxSpecialChars}
                onChange={(e) => handleConfigChange(varName, 'maxSpecialChars', e.target.value)}
              />
            </FormRow>
            <FormRow>
              <Label>Min Numbers:</Label>
              <NumberInput
                type="number"
                min="0"
                step="1"
                value={config.minNumbers}
                onChange={(e) => handleConfigChange(varName, 'minNumbers', e.target.value)}
              />
            </FormRow>
            <FormRow>
              <Label>Max Numbers:</Label>
              <NumberInput
                type="number"
                min="0"
                step="1"
                value={config.maxNumbers}
                onChange={(e) => handleConfigChange(varName, 'maxNumbers', e.target.value)}
              />
            </FormRow>
          </>
        ) : (
          <>
            <FormRow>
              <Label>{isRange ? 'Min Value:' : 'Min Length:'}</Label>
              <NumberInput
                type={isRange ? 'number' : 'number'}
                min="0"
                step={isRange ? 'any' : '1'}
                value={isRange ? config.minValue : config.minLength}
                onChange={(e) => handleConfigChange(
                  varName,
                  isRange ? 'minValue' : 'minLength',
                  e.target.value
                )}
              />
            </FormRow>
            <FormRow>
              <Label>{isRange ? 'Max Value:' : 'Max Length:'}</Label>
              <NumberInput
                type={isRange ? 'number' : 'number'}
                min="0"
                step={isRange ? 'any' : '1'}
                value={isRange ? config.maxValue : config.maxLength}
                onChange={(e) => handleConfigChange(
                  varName,
                  isRange ? 'maxValue' : 'maxLength',
                  e.target.value
                )}
              />
            </FormRow>
            {isUsername && (
              <FormRow>
                <CheckboxLabel>
                  <Checkbox
                    checked={config.allowUnderscore}
                    onChange={(e) => handleConfigChange(varName, 'allowUnderscore', e.target.checked)}
                  />
                  Allow Underscore
                </CheckboxLabel>
              </FormRow>
            )}
          </>
        )}
      </LengthConfigForm>
    );
  };

  const renderFormData = () => {
    const formData = body.formData || [createEmptyFormDataItem()];
    
    return (
      <FormContainer>
        <Table>
          <TableRow>
            <CheckboxCell>
              <Checkbox
                checked={formData.every(item => item.isSelected)}
                onChange={(e) => handleSelectAllFormData(e.target.checked)}
              />
            </CheckboxCell>
            <TableHeader>Key</TableHeader>
            <TableHeader>Value</TableHeader>
            <TableHeader style={{ width: '40px' }}></TableHeader>
          </TableRow>
          {formData.map((item: FormDataItem, index: number) => (
            <TableRow key={index}>
              <CheckboxCell>
                <Checkbox
                  checked={item.isSelected}
                  onChange={(e) => handleFormDataChange(index, 'isSelected', e.target.checked)}
                />
              </CheckboxCell>
              <TableCell>
                <KeyContainer>
                  <Input
                    $isKeyInput
                    placeholder="Key"
                    value={item.key}
                    onChange={(e) => handleFormDataChange(index, 'key', e.target.value)}
                  />
                  <TypeSelect
                    value={item.type}
                    onChange={(e) => handleFormDataChange(index, 'type', e.target.value)}
                  >
                    <option value="text">Text</option>
                    <option value="file">File</option>
                  </TypeSelect>
                </KeyContainer>
              </TableCell>
              <TableCell>
                {item.type === 'file' ? (
                  item.src ? (
                    <FileDisplay>
                      <FileIcon />
                      <FileNameText title={item.src}>{item.src}</FileNameText>
                      <DeleteFileButton
                        onClick={() => {
                          const newFormData = [...formData];
                          newFormData[index] = {
                            ...newFormData[index],
                            src: undefined,
                            value: ''
                          };
                          const newBody: RequestBody = {
                            ...body,
                            formData: newFormData
                          };
                          setLocalBody(newBody);
                          onChange(newBody);
                          if (activeCollectionId && activeRequestId) {
                            updateRequest(activeCollectionId, activeRequestId, { body: newBody });
                          }
                        }}
                      >
                        ×
                      </DeleteFileButton>
                    </FileDisplay>
                  ) : (
                    <FileButton as="label" style={{ margin: 0 }}>
                      <FiFile /> Choose File
                      <FileInput
                        type="file"
                        onChange={handleFileChange}
                      />
                    </FileButton>
                  )
                ) : (
                  <Input
                    placeholder="Value"
                    value={item.value}
                    onChange={(e) => handleFormDataChange(index, 'value', e.target.value)}
                  />
                )}
              </TableCell>
              <TableCell style={{ width: '40px' }}>
                <DeleteButton
                  onClick={() => handleDeleteFormDataItem(index)}
                  title="Delete item"
                >
                  <FiTrash2 />
                </DeleteButton>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </FormContainer>
    );
  };

  const renderUrlEncoded = () => {
    const urlencoded = body.urlencoded || [createEmptyUrlEncodedItem()];
    
    return (
      <FormContainer>
        <Table>
          <TableRow>
            <CheckboxCell>
              <Checkbox
                checked={urlencoded.every(item => item.isSelected)}
                onChange={(e) => handleSelectAllUrlEncoded(e.target.checked)}
              />
            </CheckboxCell>
            <TableHeader>Key</TableHeader>
            <TableHeader>Value</TableHeader>
            <TableHeader style={{ width: '40px' }}></TableHeader>
          </TableRow>
          {urlencoded.map((item: UrlEncodedItem, index: number) => (
            <TableRow key={index}>
              <CheckboxCell>
                <Checkbox
                  checked={item.isSelected}
                  onChange={(e) => handleUrlEncodedChange(index, 'isSelected', e.target.checked)}
                />
              </CheckboxCell>
              <TableCell>
                <Input
                  placeholder="Key"
                  value={item.key}
                  onChange={(e) => handleUrlEncodedChange(index, 'key', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) => handleUrlEncodedChange(index, 'value', e.target.value)}
                />
              </TableCell>
              <TableCell style={{ width: '40px' }}>
                <DeleteButton
                  onClick={() => handleDeleteUrlEncodedItem(index)}
                  title="Delete item"
                >
                  <FiTrash2 />
                </DeleteButton>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </FormContainer>
    );
  };

  const renderBodyContent = () => {
    if (!body || body.mode === 'none') {
      return <NoBodyText>This request does not have a body</NoBodyText>;
    }

    switch (body.mode) {
      case 'form-data':
        return renderFormData();

      case 'raw':
        return (
          <EditorContainer>
            <Select 
              value={body.options?.raw?.language || 'json'} 
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="text">Text</option>
              <option value="json">JSON</option>
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="xml">XML</option>
              <option value="text">Plain Text</option>
            </Select>
            {body.options?.raw?.language === 'json' && <label style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px' }}>
              <input type="checkbox" checked={isPretty} onChange={() => setIsPretty(!isPretty)} />
              Pretty Print
            </label>}

            <Editor
              height="400px"
              defaultLanguage={body.options?.raw?.language || 'json'}
              value={
                isPretty && body.options?.raw?.language === 'json'
                  ? (() => {
                      try {
                        return JSON.stringify(JSON.parse(body.raw || ''), null, 2);
                      } catch {
                        return body.raw || '';
                      }
                    })()
                  : body.raw || ''
              }
              onChange={handleRawChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 8, bottom: 8 },
                lineHeight: 18,
              }}
            />
          </EditorContainer>
        );

      case 'file':
        return (
          <FormContainer>
            <FileButton>
              <FiFile /> {body.file?.name || 'Select File'}
              <FileInput
                type="file"
                onChange={handleFileChange}
              />
            </FileButton>
          </FormContainer>
        );

      case 'urlencoded':
        return renderUrlEncoded();

      default:
        return null;
    }
  };

  const hasActiveConfigs = Object.values(variableConfigs).some(config => config.show);

  return (
    <Container>
      <TopControls>
        <Select value={body.mode} onChange={handleModeChange}>
          <option value="none">none</option>
          <option value="form-data">form-data</option>
          <option value="urlencoded">urlencoded</option>
          <option value="raw">raw</option>
          <option value="file">file</option>
        </Select>
      </TopControls>

      <BodyContentWrapper style={{ minHeight: renderBodyContent() ? '300px' : '0' }}>
        {renderBodyContent()}
      </BodyContentWrapper>

      <BottomSection>
        {invalidVariables.length > 0 && (
          <InvalidVariableMessage>
            Invalid dynamic variables found: {invalidVariables.join(', ')}
          </InvalidVariableMessage>
        )}
        <CheckVariablesButton onClick={checkDynamicVariables}>
          Check Dynamic Variables
        </CheckVariablesButton>
        
        {hasActiveConfigs && (
          <>
            <ConfigFormsContainer>
              {renderVariableForm('$randomUserName')}
              {renderVariableForm('$randomLastName')}
              {renderVariableForm('$randomFirstName')}
              {renderVariableForm('$randomFullName')}
              {renderVariableForm('$randomJobTitle')}
              {renderVariableForm('$randomStreetName')}
              {renderVariableForm('$randomStreetAddress')}
              {renderVariableForm('$randomAlphaNumeric')}
              {renderVariableForm('$randomHexaDecimal')}
              {renderVariableForm('$randomInt')}
              {renderVariableForm('$randomFloat')}
              {renderVariableForm('$randomPrice')}
              {renderVariableForm('$randomBankAccount')}
              {renderVariableForm('$randomPassword')}
            </ConfigFormsContainer>
            {validationError && (
              <ErrorMessage>
                {validationError.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </ErrorMessage>
            )}
            <ApplyAllButton onClick={handleApplyAllConfigs}>
              Apply All Configurations
            </ApplyAllButton>
          </>
        )}
      </BottomSection>
    </Container>
  );
};

export default RequestBodyComponent; 