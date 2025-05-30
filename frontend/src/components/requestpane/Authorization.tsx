import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styled from 'styled-components';
import { type AuthState, getNearestParentAuth } from '../../store/collectionStore';
type OAuthGrantType = 'password' | 'client' | 'code' | 'oauth1';

interface AuthorizationProps {
  Id: string | undefined;
  isRequest: boolean;
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
  // const [callbackUrl, setCallbackUrl] = useState('');
  // const [authCode, setAuthCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [requestTokenUrl, setRequestTokenUrl] = useState('');
  const [authorizeUrl, setAuthorizeUrl] = useState('');
  const [accessTokenUrl, setAccessTokenUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [scope, setScope] = useState('');
  const [state, setState] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [oauthToken, setOauthToken] = useState('');
  const [oauthTokenSecret, setOauthTokenSecret] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [signatureMethod, setSignatureMethod] = useState('HMAC-SHA1');
  const [nonce, setNonce] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [version, setVersion] = useState('1.0');

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Step 1: Redirect user to authorization URL
  const handleGetToken = () => {
    if (!clientId || !scope) {
      alert('Please fill Callback URL, Client ID, and Scope');
      return;
    }

    // Store current location (including search/hash if needed)
  // localStorage.setItem('oauth_return_path', window.location.pathname + window.location.search + window.location.hash);
    const params = new URLSearchParams({
      redirect_uri: 'http://localhost:5173/oauth-callback.html',
      response_type: 'token',
      client_id: clientId,
      scope,
      include_granted_scopes: 'true',
      state
    });

    // Open OAuth provider in a new tab
    window.open(`${accessTokenUrl}?${params.toString()}`, '_blank', 'noopener,noreferrer');
    // window.location.href = `${accessTokenUrl}?${params.toString()}`;
    console.log('Getting access token for grant type:', grantType);
  };

  // Step 2: After redirect, extract code from URL
  // React.useEffect(() => {
    
  //   function handleMessage(event: MessageEvent) {
  //   if (
  //     event.origin === window.location.origin &&
  //     event.data &&
  //     event.data.type === 'OAUTH_TOKEN'
  //   ) {
  //     setAccessToken(event.data.accessToken);
  //   }
  // }
  // window.addEventListener('message', handleMessage);
  // return () => window.removeEventListener('message', handleMessage);
  //   // if (window.location.hash) {
  //   //   const hash = window.location.hash.substring(1);
  //   //   const params = new URLSearchParams(hash);
  //   //   const token = params.get('access_token');
  //   //   if (token) {
  //   //     setAccessToken(token);
  //   //     // Restore previous location if available
  //   //     const returnPath = localStorage.getItem('oauth_return_path');
  //   //     if (returnPath) {
  //   //       localStorage.removeItem('oauth_return_path');
  //   //       window.history.replaceState({}, document.title, returnPath);
  //   //     } else {
  //   //       window.history.replaceState({}, document.title, window.location.pathname);
  //   //     }
  //   //   }
  //   // }
  // }, [accessToken]);

  // Step 3: Exchange code for access token
  // const fetchAccessToken = async () => {
  //   if (!accessTokenUrl || !clientId || !clientSecret || !callbackUrl || !authCode) {
  //     alert('Please fill all fields and get the authorization code first.');
  //     return;
  //   }
  //   try {
  //     const res = await fetch(accessTokenUrl, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //       body: new URLSearchParams({
  //         grant_type: 'authorization_code',
  //         code: authCode,
  //         redirect_uri: callbackUrl,
  //         client_id: clientId,
  //         client_secret: clientSecret,
  //       })
  //     });
  //     const data = await res.json();
  //     if (data.access_token) setAccessToken(data.access_token);
  //     else alert('Failed to get access token: ' + JSON.stringify(data));
  //   } catch (err) {
  //     alert('Error fetching access token: ' + err);
  //   }
  // };

  const renderGrantTypeFields = () => {
    switch (grantType) {
      case 'password':
        return (
          <>
            <FormGroup>
              <Label>Access Token URL</Label>
              <Input type="text" placeholder="https://api.example.com/oauth/token" value={accessTokenUrl} onChange={e => setAccessTokenUrl(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Username</Label>
              <Input type="text" placeholder="Enter username" value={username || ''} onChange={e => setUsername(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.password ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password || ''}
                  onChange={e => setPassword(e.target.value)}
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
              <Input type="text" placeholder="Enter client ID" value={clientId} onChange={e => setClientId(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Client Secret</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.clientSecret ? 'text' : 'password'}
                  placeholder="Enter client secret"
                  value={clientSecret} onChange={e => setClientSecret(e.target.value)}
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
              <Input type="text" placeholder="Enter scope (optional)" value={scope} onChange={e => setScope(e.target.value)} />
            </FormGroup>
            <GetTokenButton
              onClick={async () => {
                if (!accessTokenUrl || !clientId || !clientSecret || !username || !password) {
                  alert('Please fill Access Token URL, Client ID, Client Secret, Username, and Password');
                  return;
                }
                try {
                  const res = await fetch(accessTokenUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'Accept': 'application/json'
                    },
                    body: new URLSearchParams({
                      grant_type: 'password',
                      client_id: clientId,
                      client_secret: clientSecret,
                      username: username,
                      password: password,
                      scope
                    })
                  });
                  const data = await res.json();
                  if (data.access_token) setAccessToken(data.access_token);
                  else alert('Failed to get access token: ' + JSON.stringify(data));
                } catch (err) {
                  alert('Error fetching access token: ' + err);
                }
              }}
            >
              Get Access Token
            </GetTokenButton>
            {accessToken && (
              <div style={{ marginTop: 12 }}>
                <strong>Access Token:</strong>
                <div style={{ background: '#222', color: '#fff', padding: 8, borderRadius: 4, wordBreak: 'break-all' }}>{accessToken}</div>
              </div>
            )}
          </>
        );

      case 'client':
        return (
          <>
            <FormGroup>
              <Label>Access Token URL</Label>
              <Input type="text" placeholder="https://api.example.com/oauth/token" value={accessTokenUrl} onChange={e => setAccessTokenUrl(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Client ID</Label>
              <Input type="text" placeholder="Enter client ID" value={clientId} onChange={e => setClientId(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Client Secret</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.clientSecret ? 'text' : 'password'}
                  placeholder="Enter client secret"
                  value={clientSecret} onChange={e => setClientSecret(e.target.value)}
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
              <Input type="text" placeholder="Enter scope (optional)" value={scope} onChange={e => setScope(e.target.value)} />
            </FormGroup>
            <GetTokenButton
              onClick={async () => {
                if (!accessTokenUrl || !clientId || !clientSecret) {
                  alert('Please fill Access Token URL, Client ID, and Client Secret');
                  return;
                }
                try {
                  const res = await fetch(accessTokenUrl, {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'Accept': 'application/json' 
                    },
                    body: new URLSearchParams({
                      grant_type: 'client_credentials',
                      client_id: clientId,
                      client_secret: clientSecret,
                      scope
                    })
                  });
                  const data = await res.json();
                  if (data.access_token) setAccessToken(data.access_token);
                  else alert('Failed to get access token: ' + JSON.stringify(data));
                } catch (err) {
                  alert('Error fetching access token: ' + err);
                }
              }}
            >
              Get Access Token
            </GetTokenButton>
            {accessToken && (
              <div style={{ marginTop: 12 }}>
                <strong>Access Token:</strong>
                <div style={{ background: '#222', color: '#fff', padding: 8, borderRadius: 4, wordBreak: 'break-all' }}>{accessToken}</div>
              </div>
            )}
          </>
        );

      case 'code':
        return (
          <>

            <FormGroup>
              <Label>Authorization URL</Label>
              <Input type="text" placeholder="https://api.example.com/oauth/authorize" value={accessTokenUrl} onChange={e => setAccessTokenUrl(e.target.value)}/>
            </FormGroup>
            
            <FormGroup>
              <Label>Client ID</Label>
              <Input type="text" placeholder="Enter client ID" value={clientId} onChange={e => setClientId(e.target.value)}/>
            </FormGroup>
            <FormGroup>
              <Label>Client Secret</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.clientSecret ? 'text' : 'password'}
                  placeholder="Enter client secret"
                  value={clientSecret} onChange={e => setClientSecret(e.target.value)}
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
              <Input type="text" placeholder="Enter scope (optional)" value={scope} onChange={e => setScope(e.target.value)}/>
            </FormGroup>
            <FormGroup>
              <Label>State</Label>
              <Input type="text" placeholder="Enter state"value={state} onChange={e => setState(e.target.value)} />
            </FormGroup>
            <GetTokenButton onClick={handleGetToken}>
              Get Access Token
            </GetTokenButton>
            {accessToken && (
              <div style={{ marginTop: 12 }}>
                <strong>Access Token:</strong>
                <div style={{ background: '#222', color: '#fff', padding: 8, borderRadius: 4, wordBreak: 'break-all' }}>{accessToken}</div>
              </div>
      )}
          </>
        );

      case 'oauth1':
        return (
          <>
            <FormGroup>
              <Label>Request Token URL</Label>
              <Input type="text" placeholder="https://api.example.com/oauth/request_token" value={requestTokenUrl} onChange={e => setRequestTokenUrl(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Authorize URL</Label>
              <Input type="text" placeholder="https://api.example.com/oauth/authorize" value={authorizeUrl} onChange={e => setAuthorizeUrl(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Access Token URL</Label>
              <Input type="text" placeholder="https://api.example.com/oauth/access_token" value={accessTokenUrl} onChange={e => setAccessTokenUrl(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Consumer Key</Label>
              <Input type="text" placeholder="Enter consumer key" value={consumerKey} onChange={e => setConsumerKey(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Consumer Secret</Label>
              <InputWrapper>
                <Input
                  type={showPasswords.consumerSecret ? 'text' : 'password'}
                  placeholder="Enter consumer secret"
                  value={consumerSecret} onChange={e => setConsumerSecret(e.target.value)}
                />
                <ToggleButton
                  onClick={() => togglePasswordVisibility('consumerSecret')}
                  type="button"
                >
                  {showPasswords.consumerSecret ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </ToggleButton>
              </InputWrapper>
            </FormGroup>
            <FormGroup>
              <Label>Token (optional)</Label>
              <Input type="text" placeholder="Enter token (if available)" value={oauthToken} onChange={e => setOauthToken(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Token Secret (optional)</Label>
              <Input type="text" placeholder="Enter token secret (if available)" value={oauthTokenSecret} onChange={e => setOauthTokenSecret(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Callback URL</Label>
              <Input type="text" placeholder="http://localhost:3000/callback" value={callbackUrl} onChange={e => setCallbackUrl(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Signature Method</Label>
              <Select value={signatureMethod} onChange={e => setSignatureMethod(e.target.value)}>
                <option value="HMAC-SHA1">HMAC-SHA1</option>
                <option value="PLAINTEXT">PLAINTEXT</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Nonce (optional)</Label>
              <Input type="text" placeholder="Random string (optional)" value={nonce} onChange={e => setNonce(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Timestamp (optional)</Label>
              <Input type="text" placeholder="Timestamp (optional)" value={timestamp} onChange={e => setTimestamp(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Version</Label>
              <Input type="text" placeholder="1.0" value={version} onChange={e => setVersion(e.target.value)} />
            </FormGroup>
            <GetTokenButton
              onClick={async () => {
                if (!requestTokenUrl || !authorizeUrl || !accessTokenUrl || !consumerKey || !consumerSecret || !callbackUrl) {
                  alert('Please fill all required OAuth 1.0 fields.');
                  return;
                }
                // Step 1: Request Token
                try {
                  const res = await fetch('http://localhost:4000/api/oauth1/request_token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      requestTokenUrl,
                      consumerKey,
                      consumerSecret,
                      callbackUrl,
                      signatureMethod,
                      nonce,
                      timestamp,
                      version
                    })
                  });
                  const data = await res.json();
                  if (data.oauth_token) {
                    // Step 2: Redirect user to authorize URL
                    const authUrl = `${authorizeUrl}?oauth_token=${encodeURIComponent(data.oauth_token)}`;
                    window.location.href = authUrl;
                  } else {
                    alert('Failed to get request token: ' + JSON.stringify(data));
                  }
                } catch (err) {
                  alert('Error in OAuth 1.0 request token step: ' + err);
                }
              }}
            >
              Start OAuth 1.0 Flow
            </GetTokenButton>
            {/* Step 3: After redirect, exchange oauth_token and oauth_verifier for access token */}
            {window.location.search.includes('oauth_token') && window.location.search.includes('oauth_verifier') && (
              <GetTokenButton
                onClick={async () => {
                  const params = new URLSearchParams(window.location.search);
                  const oauth_token = params.get('oauth_token') || '';
                  const oauth_verifier = params.get('oauth_verifier') || '';
                  try {
                    const res = await fetch('http://localhost:4000/api/oauth1/access_token', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        accessTokenUrl,
                        consumerKey,
                        consumerSecret,
                        oauthToken: oauth_token,
                        oauthVerifier: oauth_verifier,
                        signatureMethod,
                        nonce,
                        timestamp,
                        version
                      })
                    });
                    const data = await res.json();
                    if (data.oauth_token) setOauthToken(data.oauth_token);
                    else alert('Failed to get access token: ' + JSON.stringify(data));
                  } catch (err) {
                    alert('Error in OAuth 1.0 access token step: ' + err);
                  }
                }}
              >
                Exchange for Access Token
              </GetTokenButton>
            )}
            {oauthToken && (
              <div style={{ marginTop: 12 }}>
                <strong>Access Token:</strong>
                <div style={{ background: '#222', color: '#fff', padding: 8, borderRadius: 4, wordBreak: 'break-all' }}>{oauthToken}</div>
              </div>
            )}
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
          <option value="oauth1">OAuth 1.0</option>
        </Select>
      </FormGroup>
      {renderGrantTypeFields()}
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

const Authorization: React.FC<AuthorizationProps> = ({ Id, isRequest, auth, onChange }) => {
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
        const parentAuth = getNearestParentAuth(Id as string, isRequest);
        // return <NoAuthMessage>Using authorization configuration from collection</NoAuthMessage>;
        if (!parentAuth) {
          return <NoAuthMessage>No parent authorization configuration found</NoAuthMessage>;
        }
        switch (parentAuth.type) {
      
      case 'noAuth':
        return <NoAuthMessage>No Authorization</NoAuthMessage>;
        
      case 'basic':
        return (
          <>
            <FormGroup>
              <Label>Username</Label>
              <Input
                type="text"
                value={parentAuth.credentials.username || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                value={parentAuth.credentials.password || ''}
                disabled
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
              value={parentAuth.credentials.token || ''}
              disabled
            />
          </FormGroup>
        );

      case 'oauth2':
        return <OAuth2Form />;

      case 'oauth1':
        return (
          <>
            <FormGroup>
              <Label>Request Token URL</Label>
              <Input
                type="text"
                value={parentAuth.credentials.requestTokenUrl || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Authorize URL</Label>
              <Input
                type="text"
                value={parentAuth.credentials.authorizeUrl || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Access Token URL</Label>
              <Input
                type="text"
                value={parentAuth.credentials.accessTokenUrl || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Consumer Key</Label>
              <Input
                type="text"
                value={parentAuth.credentials.consumerKey || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Consumer Secret</Label>
              <Input
                type="text"
                value={parentAuth.credentials.consumerSecret || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Token (optional)</Label>
              <Input
                type="text"
                value={parentAuth.credentials.oauthToken || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Token Secret (optional)</Label>
              <Input
                type="text"
                value={parentAuth.credentials.oauthTokenSecret || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Callback URL</Label>
              <Input
                type="text"
                value={parentAuth.credentials.callbackUrl || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Signature Method</Label>
              <Select
                value={parentAuth.credentials.signatureMethod || 'HMAC-SHA1'}
                disabled
                >
                <option value="HMAC-SHA1">HMAC-SHA1</option>
                <option value="PLAINTEXT">PLAINTEXT</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Nonce (optional)</Label>
              <Input
                type="text"
                value={parentAuth.credentials.nonce || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Timestamp (optional)</Label>
              <Input
                type="text"
                value={parentAuth.credentials.timestamp || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Version</Label>
              <Input
                type="text"
                value={parentAuth.credentials.version || '1.0'}
                disabled
              />
            </FormGroup>
          </>
        );

      case 'apiKey':
        return (
          <>
            <FormGroup>
              <Label>Key</Label>
              <Input
                type="text"
                value={parentAuth.credentials.key || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Value</Label>
              <Input
                type="text"
                value={parentAuth.credentials.value || ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label>Add to</Label>
              <Select
                value={parentAuth.credentials.in || 'header'}
                disabled
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

      case 'oauth1':
        return (
          <>
            <FormGroup>
              <Label>Request Token URL</Label>
              <Input
                type="text"
                value={auth.credentials.requestTokenUrl || ''}
                onChange={(e) => handleCredentialChange('requestTokenUrl', e.target.value)}
                placeholder="Enter request token URL"
              />
            </FormGroup>
            <FormGroup>
              <Label>Authorize URL</Label>
              <Input
                type="text"
                value={auth.credentials.authorizeUrl || ''}
                onChange={(e) => handleCredentialChange('authorizeUrl', e.target.value)}
                placeholder="Enter authorize URL"
              />
            </FormGroup>
            <FormGroup>
              <Label>Access Token URL</Label>
              <Input
                type="text"
                value={auth.credentials.accessTokenUrl || ''}
                onChange={(e) => handleCredentialChange('accessTokenUrl', e.target.value)}
                placeholder="Enter access token URL"
              />
            </FormGroup>
            <FormGroup>
              <Label>Consumer Key</Label>
              <Input
                type="text"
                value={auth.credentials.consumerKey || ''}
                onChange={(e) => handleCredentialChange('consumerKey', e.target.value)}
                placeholder="Enter consumer key"
              />
            </FormGroup>
            <FormGroup>
              <Label>Consumer Secret</Label>
              <Input
                type="text"
                value={auth.credentials.consumerSecret || ''}
                onChange={(e) => handleCredentialChange('consumerSecret', e.target.value)}
                placeholder="Enter consumer secret"
              />
            </FormGroup>
            <FormGroup>
              <Label>Token (optional)</Label>
              <Input
                type="text"
                value={auth.credentials.oauthToken || ''}
                onChange={(e) => handleCredentialChange('oauthToken', e.target.value)}
                placeholder="Enter token (optional)"
              />
            </FormGroup>
            <FormGroup>
              <Label>Token Secret (optional)</Label>
              <Input
                type="text"
                value={auth.credentials.oauthTokenSecret || ''}
                onChange={(e) => handleCredentialChange('oauthTokenSecret', e.target.value)}
                placeholder="Enter token secret (optional)"
              />
            </FormGroup>
            <FormGroup>
              <Label>Callback URL</Label>
              <Input
                type="text"
                value={auth.credentials.callbackUrl || ''}
                onChange={(e) => handleCredentialChange('callbackUrl', e.target.value)}
                placeholder="Enter callback URL"
              />
            </FormGroup>
            <FormGroup>
              <Label>Signature Method</Label>
              <Select
                value={auth.credentials.signatureMethod || 'HMAC-SHA1'}
                onChange={(e) => handleCredentialChange('signatureMethod', e.target.value)}
              >
                <option value="HMAC-SHA1">HMAC-SHA1</option>
                <option value="PLAINTEXT">PLAINTEXT</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Nonce (optional)</Label>
              <Input
                type="text"
                value={auth.credentials.nonce || ''}
                onChange={(e) => handleCredentialChange('nonce', e.target.value)}
                placeholder="Enter nonce (optional)"
              />
            </FormGroup>
            <FormGroup>
              <Label>Timestamp (optional)</Label>
              <Input
                type="text"
                value={auth.credentials.timestamp || ''}
                onChange={(e) => handleCredentialChange('timestamp', e.target.value)}
                placeholder="Enter timestamp (optional)"
              />
            </FormGroup>
            <FormGroup>
              <Label>Version</Label>
              <Input
                type="text"
                value={auth.credentials.version || '1.0'}
                onChange={(e) => handleCredentialChange('version', e.target.value)}
                placeholder="Enter version"
              />
            </FormGroup>
          </>
        );

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
          <option value="oauth2">OAuth 2.0</option>
          <option value="oauth1">OAuth 1.0</option>
          <option value="apiKey">API Key</option>
        </Select>
      </FormGroup>
      {renderAuthFields()}
    </Container>
  );
};

export default Authorization;

