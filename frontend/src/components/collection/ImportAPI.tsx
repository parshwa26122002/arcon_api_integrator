// src/components/ImportAPI.tsx
import React, { useState, type JSX } from 'react';
import { parseImportFile } from '../../utils/importParser';
import { useCollectionStore, type APICollection, type APIRequest } from '../../store/collectionStore';

interface Collection {
  name: string;
  requests: APIRequest[];
}

export default function ImportAPI(): JSX.Element {
  const [error, setError] = useState<string>('');
  const { addCollection, collections } = useCollectionStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseImportFile(file);

      let collection: Collection;

      switch (parsed.type) {
        case 'openapi':
          collection = convertOpenAPIToCollection(parsed.source);
          break;
        case 'graphql':
          collection = convertGraphQLToCollection(parsed.source);
          break;
        case 'raml':
          collection = convertRAMLToCollection(parsed.source);
          break;
        case 'postman':
          collection = convertPostmanToCollection(parsed.source);
          break;
        default:
          throw new Error('Unsupported API format');
      }

      const collection2: APICollection = {
        id: crypto.randomUUID(),
        name: collection.name,
        requests: collection.requests,
      };

      addCollection(collection2);
    } catch (err: any) {
      setError(err.message || 'Failed to parse API file');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <label>
        Import API File (OpenAPI / GraphQL / RAML / Postman):&nbsp;
        <input type="file" accept=".json,.yaml,.yml,.graphql,.raml" onChange={handleFileSelect} />
      </label>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '1rem' }}>
        <h3>Collections</h3>
        {collections.map((collection, i) => (
          <div key={i}>
            <strong>{collection.name}</strong>
            <ul>
              {collection.requests.map((req) => (
                <li key={req.id}>
                  <code>{req.method}</code> {req.name} - <small>{req.url}</small>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// === Converters ===

function convertOpenAPIToCollection(openapi: any): Collection {
  const requests: APIRequest[] = Object.entries(openapi.paths || {}).flatMap(([path, methods]: any) =>
    Object.entries(methods).map(([method, detail]: any) => {
      // Extract headers from parameters
      const headers = (detail.parameters || [])
        .filter((param: any) => param.in === 'header')
        .map((param: any) => ({
          key: param.name,
          value: param.example || '',
        }));

      // Extract request body
      let body = '';
      const content = detail.requestBody?.content;
      if (content && content['application/json']) {
        const json = content['application/json'];
        const example = json.example;
        const examples = json.examples;
        const schema = json.schema;

        if (example) {
          body = JSON.stringify(example, null, 2);
        } else if (examples) {
          const first = Object.values(examples)[0];
          body = JSON.stringify(first ?? {}, null, 2);
        } else if (schema) {
          body = JSON.stringify(generateDummyData(schema), null, 2);
        }
      }

      return {
        id: crypto.randomUUID(),
        name: detail.summary || `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase(),
        url: path,
        body,
        headers,
        auth: { type: '', credentials: {} },
      };
    })
  );

  return {
    name: openapi.info?.title || 'Imported OpenAPI',
    requests,
  };
}

function generateDummyData(schema: any): any {
  if (schema.type === 'object') {
    const obj: Record<string, any> = {};
    for (const [key, prop] of Object.entries(schema.properties || {})) {
      obj[key] = prop?? getDefaultForType(prop??'');
    }
    return obj;
  }
  return getDefaultForType(schema.type);
}

function getDefaultForType(type: string | undefined): any {
  switch (type) {
    case 'string':
      return 'example';
    case 'number':
      return 123;
    case 'boolean':
      return true;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}

function convertGraphQLToCollection(_source: any): Collection {
  return {
    name: 'Imported GraphQL',
    requests: [
      {
        id: crypto.randomUUID(),
        name: 'GraphQL Query',
        method: 'POST',
        url: '/graphql',
        body: JSON.stringify({ query: '{ __schema { types { name } } }' }, null, 2),
        headers: [],
        auth: { type: '', credentials: {} },
      },
    ],
  };
}

function convertRAMLToCollection(raml: any): Collection {
  return {
    name: raml.title || 'Imported RAML',
    requests: [
      {
        id: crypto.randomUUID(),
        name: 'Sample RAML Request',
        method: 'GET',
        url: '/',
        body: '',
        headers: [],
        auth: { type: '', credentials: {} },
      },
    ],
  };
}

function extractRequestsFromItems(items: any[]): APIRequest[] {
  const requests: APIRequest[] = [];

  items.forEach((item) => {
    if (item.item) {
      requests.push(...extractRequestsFromItems(item.item));
    } else if (item.request) {
      const url = typeof item.request.url === 'string'
        ? item.request.url
        : item.request.url?.raw || '';

      const authObj = item.request.auth || {};
      const authType = authObj.type || '';
      const credentials = authObj[authType] || {};

      const headers = (item.request.header || []).map((h: any) => ({
        key: h.key,
        value: h.value,
      }));

      requests.push({
        id: crypto.randomUUID(),
        name: item.name || 'Postman Request',
        method: item.request.method || 'GET',
        url,
        body: JSON.stringify(item.request.body || '', null, 2),
        headers,
        auth: {
          type: authType,
          credentials: Array.isArray(credentials)
            ? Object.fromEntries(credentials.map((e: any) => [e.key, e.value]))
            : credentials,
        },
      });
    }
  });

  return requests;
}

function convertPostmanToCollection(postman: any): Collection {
  const requests = extractRequestsFromItems(postman.item || []);
  return {
    name: postman.info?.name || 'Imported Postman Collection',
    requests,
  };
}
