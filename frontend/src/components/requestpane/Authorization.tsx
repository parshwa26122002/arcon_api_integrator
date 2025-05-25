import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEye, FiEyeOff } from 'react-icons/fi';

type AuthType = 'noAuth' | 'basicAuth' | 'bearerToken' | 'oauth2' | 'apiKey' | 'inheritCollection';
type OAuthGrantType = 'password' | 'client' | 'code';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
  height: 100%;
`;

const TopSection = styled.div`
  width: 100%;
  max-width: 300px;
`;

const ContentSection = styled.div`
  width: 100%;
  max-width: 400px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  background-color: #2d2d2d;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #e1e1e1;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6a6a6a;
  }

  option {
    background-color: #2d2d2d;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 12px;
  color: #e1e1e1;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
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

const NoAuthMessage = styled.div`
  color: #808080;
  font-size: 14px;
  padding: 16px 0;
`;

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

const Authorization: React.FC = () => {
  const [authType, setAuthType] = useState<AuthType>('noAuth');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderAuthContent = () => {
    switch (authType) {
      case 'inheritCollection':
        return <NoAuthMessage>Using authorization configuration from collection</NoAuthMessage>;
      case 'noAuth':
        return <NoAuthMessage>No Authorization</NoAuthMessage>;
      case 'oauth2':
        return <OAuth2Form />;
      case 'basicAuth':
        return (
          <>
            <FormGroup>
              <Label>Username</Label>
              <Input type="text" placeholder="Enter username" />
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.basicPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                />
                <ToggleButton
                  onClick={() => togglePasswordVisibility('basicPassword')}
                  type="button"
                >
                  {showPasswords.basicPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </ToggleButton>
              </InputWrapper>
            </FormGroup>
          </>
        );
      case 'bearerToken':
        return (
          <FormGroup>
            <Label>Token</Label>
            <InputWrapper>
              <Input
                type={showPasswords.bearerToken ? 'text' : 'password'}
                placeholder="Enter token"
              />
              <ToggleButton
                onClick={() => togglePasswordVisibility('bearerToken')}
                type="button"
              >
                {showPasswords.bearerToken ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </ToggleButton>
            </InputWrapper>
          </FormGroup>
        );
      case 'apiKey':
        return (
          <>
            <FormGroup>
              <Label>Key</Label>
              <Input type="text" placeholder="Enter key name" />
            </FormGroup>
            <FormGroup>
              <Label>Value</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.apiKeyValue ? 'text' : 'password'}
                  placeholder="Enter key value"
                />
                <ToggleButton
                  onClick={() => togglePasswordVisibility('apiKeyValue')}
                  type="button"
                >
                  {showPasswords.apiKeyValue ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </ToggleButton>
              </InputWrapper>
            </FormGroup>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <TopSection>
        <Select
          value={authType}
          onChange={(e) => setAuthType(e.target.value as AuthType)}
        >
          <option value="inheritCollection">Inherit from collection</option>
          <option value="noAuth">No Auth</option>
          <option value="basicAuth">Basic Auth</option>
          <option value="bearerToken">Bearer Token</option>
          <option value="oauth2">OAuth 2.0</option>
          <option value="apiKey">API Key</option>
        </Select>
      </TopSection>
      <ContentSection>
        {renderAuthContent()}
      </ContentSection>
    </Container>
  );
};

export default Authorization; 