// src/components/RequestEditor.tsx
import { type ChangeEvent, type JSX } from 'react';
import { useCollectionStore, type APIRequest } from '../../store/collectionStore';
import { v4 as uuidv4 } from 'uuid';

interface Header {
  id: string;
  key: string;
  value: string;
}

export default function RequestEditor(): JSX.Element {
  const {
    activeCollectionId,
    activeRequestId,
    updateRequest,
    getActiveRequest,
  } = useCollectionStore();

  const request: APIRequest | null = getActiveRequest();

  if (!request) {
    return <div style={{ padding: '10px' }}>No request selected.</div>;
  }

  const handleChange = (key: keyof APIRequest, value: any): void => {
    if (activeCollectionId && activeRequestId) {
      updateRequest(activeCollectionId, activeRequestId, { [key]: value });
    }
  };

  const handleAuthChange = (field: string, value: string): void => {
    handleChange('auth', {
      ...request.auth,
      credentials: {
        ...request.auth.credentials,
        [field]: value,
      },
    });
  };

  const handleHeaderChange = (id: string, field: 'key' | 'value', value: string): void => {
    const updatedHeaders = request.headers.map(header =>
      header.id === id ? { ...header, [field]: value } : header
    );
    handleChange('headers', updatedHeaders);
  };

  const addHeader = (): void => {
    const newHeader: Header = { id: uuidv4(), key: '', value: '' };
    handleChange('headers', [...request.headers, newHeader]);
  };

  const removeHeader = (id: string): void => {
    const updatedHeaders = request.headers.filter(header => header.id !== id);
    handleChange('headers', updatedHeaders);
  };

  const renderAuthFields = (): JSX.Element | null => {
    const credentials = request.auth?.credentials || {};
    switch (request.auth?.type) {
      case 'bearer':
        return (
          <div>
            <label>Token:</label>
            <input
              type="text"
              value={credentials.token || ''}
              onChange={(e) => handleAuthChange('token', e.target.value)}
            />
          </div>
        );
      case 'basic':
        return (
          <>
            <div>
              <label>Username:</label>
              <input
                type="text"
                value={credentials.username || ''}
                onChange={(e) => handleAuthChange('username', e.target.value)}
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={credentials.password || ''}
                onChange={(e) => handleAuthChange('password', e.target.value)}
              />
            </div>
          </>
        );
      case 'apikey':
        return (
          <>
            <div>
              <label>Key:</label>
              <input
                type="text"
                value={credentials.key || ''}
                onChange={(e) => handleAuthChange('key', e.target.value)}
              />
            </div>
            <div>
              <label>Value:</label>
              <input
                type="text"
                value={credentials.value || ''}
                onChange={(e) => handleAuthChange('value', e.target.value)}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3>{request.name}</h3>

      <div>
        <label>Method:</label>
        <select
          value={request.method}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            handleChange('method', e.target.value)
          }
        >
          {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>URL:</label>
        <input
          type="text"
          value={request.url}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('url', e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label>Body:</label>
        <textarea
          value={request.body?.raw || ''}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange('body', request.body ? {
              ...request.body,
              raw: e.target.value
            } : {
              mode: 'raw',
              raw: e.target.value,
              options: {
                raw: { language: 'text' }
              }
            })
          }
          style={{ width: '100%', height: '100px' }}
        />
      </div>

      <div>
        <label>Headers:</label>
        {request.headers.map((header) => (
          <div key={header.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '4px' }}>
            <input
              type="text"
              placeholder="Key"
              value={header.key}
              onChange={(e) => handleHeaderChange(header.id, 'key', e.target.value)}
            />
            <input
              type="text"
              placeholder="Value"
              value={header.value}
              onChange={(e) => handleHeaderChange(header.id, 'value', e.target.value)}
            />
            <button onClick={() => removeHeader(header.id)}>Remove</button>
          </div>
        ))}
        <button onClick={addHeader}>Add Header</button>
      </div>

      <div>
        <label>Auth Type:</label>
        <select
          value={request.auth?.type || ''}
          onChange={(e) =>
            handleChange('auth', { ...request.auth, type: e.target.value, credentials: {} })
          }
        >
          <option value="">None</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="apikey">API Key</option>
        </select>
      </div>

      {renderAuthFields()}
    </div>
  );
}
