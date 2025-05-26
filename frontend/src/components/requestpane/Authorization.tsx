import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styled from 'styled-components';
import { type AuthState } from '../../store/collectionStore';
type OAuthGrantType = 'password' | 'client' | 'code';

interface AuthorizationProps {
  auth: AuthState;
  onChange: (auth: AuthState) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NoAuthMessage = styled.div`
  color: #808080;
  font-size: 14px;
  padding: 16px 0;
`;

const Title = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #e1e1e1;
  margin-bottom: 8px;
`;

const Select = styled.select`
  padding: 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
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

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #808080;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #a0a0a0;
  }
`;

const Label = styled.label`
  font-size: 12px;
  color: #e1e1e1;
`;

const Input = styled.input`
  padding: 8px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  width: 100%;
  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }
`;

const OAuth2Form: React.FC = () => {
  const [grantType, setGrantType] = useState<OAuthGrantType>('password');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleGetToken = () => {
    console.log('Getting access token for grant type:', grantType);
  };

  const renderGrantTypeFields = () => {
    switch (grantType) {
      case 'password':
        return (
          <>
            <FormGroup>
              <Label>Access Token URL</Label>
              <Input type="text" placeholder="https://api.example.com/oauth/token" />
            </FormGroup>
            <FormGroup>
              <Label>Username</Label>
              <Input type="text" placeholder="Enter username" />
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.password ? 'text' : 'password'}
                  placeholder="Enter password"
                />
                <ToggleButton
                  onClick={() => togglePasswordVisibility('password')}
                  type="button"
                >
                  {showPasswords.password ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </ToggleButton>
              </InputWrapper>
            </FormGroup>
            <FormGroup>
              <Label>Client ID</Label>
              <Input type="text" placeholder="Enter client ID" />
            </FormGroup>
            <FormGroup>
              <Label>Client Secret</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.clientSecret ? 'text' : 'password'}
                  placeholder="Enter client secret"
                />
                <ToggleButton
                  onClick={() => togglePasswordVisibility('clientSecret')}
                  type="button"
                >
                  {showPasswords.clientSecret ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </ToggleButton>
              </InputWrapper>
            </FormGroup>
            <FormGroup>
              <Label>Scope</Label>
              <Input type="text" placeholder="Enter scope (optional)" />
            </FormGroup>
          </>
        );

      case 'client':
        return (
          <>
            <FormGroup>
              <Label>Access Token URL</Label>
              <Input type="text" placeholder="https://api.example.com/oauth/token" />
            </FormGroup>
            <FormGroup>
              <Label>Client ID</Label>
              <Input type="text" placeholder="Enter client ID" />
            </FormGroup>
            <FormGroup>
              <Label>Client Secret</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.clientSecret ? 'text' : 'password'}
                  placeholder="Enter client secret"
                />
                <ToggleButton
                  onClick={() => togglePasswordVisibility('clientSecret')}
                  type="button"
                >
                  {showPasswords.clientSecret ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </ToggleButton>
              </InputWrapper>
            </FormGroup>
            <FormGroup>
              <Label>Scope</Label>
              <Input type="text" placeholder="Enter scope (optional)" />
            </FormGroup>
          </>
        );

      case 'code':
        return (
          <>
            <FormGroup>
              <Label>Callback URL</Label>
              <Input type="text" placeholder="http://localhost:8080/callback" />
            </FormGroup>
            <FormGroup>
              <Label>Authorization URL</Label>
              <Input type="text" placeholder="https://api.example.com/oauth/authorize" />
            </FormGroup>
            <FormGroup>
              <Label>Access Token URL</Label>
              <Input type="text" placeholder="https://api.example.com/oauth/token" />
            </FormGroup>
            <FormGroup>
              <Label>Username</Label>
              <Input type="text" placeholder="Enter username" />
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.password ? 'text' : 'password'}
                  placeholder="Enter password"
                />
                <ToggleButton
                  onClick={() => togglePasswordVisibility('password')}
                  type="button"
                >
                  {showPasswords.password ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </ToggleButton>
              </InputWrapper>
            </FormGroup>
            <FormGroup>
              <Label>Client ID</Label>
              <Input type="text" placeholder="Enter client ID" />
            </FormGroup>
            <FormGroup>
              <Label>Client Secret</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.clientSecret ? 'text' : 'password'}
                  placeholder="Enter client secret"
                />
                <ToggleButton
                  onClick={() => togglePasswordVisibility('clientSecret')}
                  type="button"
                >
                  {showPasswords.clientSecret ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </ToggleButton>
              </InputWrapper>
            </FormGroup>
            <FormGroup>
              <Label>Scope</Label>
              <Input type="text" placeholder="Enter scope (optional)" />
            </FormGroup>
            <FormGroup>
              <Label>State</Label>
              <Input type="text" placeholder="Enter state" />
            </FormGroup>
          </>
        );
    }
  };

  return (
    <>
      <FormGroup>
        <Label>Grant Type</Label>
        <Select
          value={grantType}
          onChange={(e) => setGrantType(e.target.value as OAuthGrantType)}
        >
          <option value="password">Password Credentials</option>
          <option value="client">Client Credentials</option>
          <option value="code">Authorization Code</option>
        </Select>
      </FormGroup>
      {renderGrantTypeFields()}
      <GetTokenButton onClick={handleGetToken}>
        Get Access Token
      </GetTokenButton>
    </>
  );
};

const GetTokenButton = styled.button`
  padding: 8px 16px;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 16px;
  margin-bottom: 24px;

  &:hover {
    background-color: #0052a3;
  }
`;

const Authorization: React.FC<AuthorizationProps> = ({ auth, onChange }) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    let newCredentials: Record<string, string> = {};

    // Initialize credentials based on auth type
    switch (newType) {
      case 'inheritCollection':
        newCredentials = {};
        break;
      case 'noAuth':
        newCredentials = {};
        break;
      case 'basic':
        newCredentials = { username: '', password: '' };
        break;
      case 'bearer':
        newCredentials = { token: '' };
        break;
      case 'apiKey':
        newCredentials = { key: '', value: '', in: 'header' };
        break;
      default:
        newCredentials = {};
    }

    onChange({ type: newType, credentials: newCredentials });
  };

  const handleCredentialChange = (key: string, value: string) => {
    onChange({
      ...auth,
      credentials: { ...auth.credentials, [key]: value }
    });
  };

  const renderAuthFields = () => {
    switch (auth.type) {
      case 'inheritCollection':
        return <NoAuthMessage>Using authorization configuration from collection</NoAuthMessage>;
      
      case 'noAuth':
        return <NoAuthMessage>No Authorization</NoAuthMessage>;
        
      case 'basic':
        return (
          <>
            <FormGroup>
              <Label>Username</Label>
              <Input
                type="text"
                value={auth.credentials.username || ''}
                onChange={(e) => handleCredentialChange('username', e.target.value)}
                placeholder="Enter username"
              />
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                value={auth.credentials.password || ''}
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
              value={auth.credentials.token || ''}
              onChange={(e) => handleCredentialChange('token', e.target.value)}
              placeholder="Enter bearer token"
            />
          </FormGroup>
        );

      case 'oauth2':
        return <OAuth2Form />;

      case 'apiKey':
        return (
          <>
            <FormGroup>
              <Label>Key</Label>
              <Input
                type="text"
                value={auth.credentials.key || ''}
                onChange={(e) => handleCredentialChange('key', e.target.value)}
                placeholder="Enter API key name"
              />
            </FormGroup>
            <FormGroup>
              <Label>Value</Label>
              <Input
                type="text"
                value={auth.credentials.value || ''}
                onChange={(e) => handleCredentialChange('value', e.target.value)}
                placeholder="Enter API key value"
              />
            </FormGroup>
            <FormGroup>
              <Label>Add to</Label>
              <Select
                value={auth.credentials.in || 'header'}
                onChange={(e) => handleCredentialChange('in', e.target.value)}
              >
                <option value="header">Header</option>
                <option value="query">Query Parameter</option>
              </Select>
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
        <Select value={auth.type} onChange={handleTypeChange}>
          <option value="noAuth">No Auth</option>
          <option value="inheritCollection">Inherit from collection</option>
          <option value="basic">Basic Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="oauth2">OAuth2</option>
          <option value="apiKey">API Key</option>
        </Select>
      </FormGroup>
      {renderAuthFields()}
    </Container>
  );
};

export default Authorization; 