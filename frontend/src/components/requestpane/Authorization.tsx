import React from 'react';
import styled from 'styled-components';
import { useCollectionStore } from '../../store/collectionStore';

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

const Select = styled.select`
  padding: 8px 12px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 14px;
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  color: #e1e1e1;
`;

const Input = styled.input`
  padding: 8px 12px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 14px;
  width: 100%;
  max-width: 400px;
  
  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }
`;

const Authorization: React.FC = () => {
  const activeCollectionId = useCollectionStore(state => state.activeCollectionId);
  const activeRequestId = useCollectionStore(state => state.activeRequestId);
  const updateRequest = useCollectionStore(state => state.updateRequest);
  const request = useCollectionStore(state => {
    const collection = state.collections.find(c => c.id === state.activeCollectionId);
    return collection?.requests.find(r => r.id === state.activeRequestId) || null;
  });

  const handleAuthTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!activeCollectionId || !activeRequestId) return;

    updateRequest(activeCollectionId, activeRequestId, {
      auth: {
        type: e.target.value,
        credentials: {}
      }
    });
  };

  const handleCredentialChange = (key: string, value: string) => {
    if (!activeCollectionId || !activeRequestId || !request) return;

    updateRequest(activeCollectionId, activeRequestId, {
      auth: {
        ...request.auth,
        credentials: {
          ...request.auth.credentials,
          [key]: value
        }
      }
    });
  };

  const renderAuthFields = () => {
    switch (request?.auth.type) {
      case 'basic':
        return (
          <>
            <FormGroup>
              <Label>Username</Label>
              <Input
                type="text"
                value={request.auth.credentials.username || ''}
                onChange={(e) => handleCredentialChange('username', e.target.value)}
                placeholder="Enter username"
              />
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                value={request.auth.credentials.password || ''}
                onChange={(e) => handleCredentialChange('password', e.target.value)}
                placeholder="Enter password"
              />
            </FormGroup>
          </>
        );
      case 'bearer':
        return (
          <FormGroup>
            <Label>Token</Label>
            <Input
              type="text"
              value={request.auth.credentials.token || ''}
              onChange={(e) => handleCredentialChange('token', e.target.value)}
              placeholder="Enter token"
            />
          </FormGroup>
        );
      case 'apiKey':
        return (
          <>
            <FormGroup>
              <Label>Key</Label>
              <Input
                type="text"
                value={request.auth.credentials.key || ''}
                onChange={(e) => handleCredentialChange('key', e.target.value)}
                placeholder="Enter API key"
              />
            </FormGroup>
            <FormGroup>
              <Label>Value</Label>
              <Input
                type="text"
                value={request.auth.credentials.value || ''}
                onChange={(e) => handleCredentialChange('value', e.target.value)}
                placeholder="Enter API key value"
              />
            </FormGroup>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Title>Authorization</Title>
      <FormGroup>
        <Label>Type</Label>
        <Select
          value={request?.auth.type || 'none'}
          onChange={handleAuthTypeChange}
        >
          <option value="none">No Auth</option>
          <option value="basic">Basic Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="apiKey">API Key</option>
        </Select>
      </FormGroup>
      {renderAuthFields()}
    </Container>
  );
};

export default Authorization; 