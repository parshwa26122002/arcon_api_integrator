// src/components/ImportAPI.tsx
import React, { useState, type JSX, useEffect } from 'react';
import styled from 'styled-components';
import { parseImportFile } from '../../utils/importParser';
import { useCollectionStore, type APICollection, type APIFolder, type APIRequest, type AuthState, type QueryParam, type RequestBody, type Variable } from '../../store/collectionStore';
import logo from '../../assets/logo.jpeg';
import logo_black from '../../assets/logo-black-bg.png';
const ImportButton = styled.button`
  padding: 8px 16px;
  background-color: var(--color-tab-active);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  
  &:hover {
    background-color: var(--color-button-hover);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--color-panel);
  padding: 24px;
  border-radius: 8px;
  width: 500px;
  border: 1px solid var(--color-border);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h2 {
    margin: 0;
    color: var(--color-text);
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;  color: var(--color-muted);
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  background-color: transparent;
  &:hover {
    color: var(--color-text);
    background-color: none;
    border-color: transparent;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  margin-bottom: 16px;
  align-items: flex-start;
  border-radius: 4px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--color-panel-alt);
  }
  
  input[type="radio"] {
    cursor: pointer;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 8px;
  background-color: var(--color-panel-alt);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  margin-top: 12px;

  &:focus {
    border-color: var(--color-tab-active);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputButton = styled.button`
  padding: 8px 16px;
  background-color: var(--color-tab-active);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 12px;

  &:hover {
    background-color: var(--color-button-hover);
  }
`;

const ErrorText = styled.p`
  color: var(--color-error);
  font-size: 12px;
  margin-top: 8px;
`;

const ImportBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const LogoImg = styled.img`
  height: 40px;
  width: auto;
  border-radius: 6px;
  object-fit: contain;
`;

interface Collection {
  name: string;
  description?: string;
  auth?: AuthState;
  requests: APIRequest[];
  folders?: APIFolder[];
  variables?: Variable[];
}


export default function ImportAPI(): JSX.Element {
  const [error, setError] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importType, setImportType] = useState<"file" | "text">("file");
  const [rawText, setRawText] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { addCollection } = useCollectionStore();
  
useEffect(() => {
  const updateTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkTheme(isDark);
  };

  updateTheme();

  const observer = new MutationObserver(() => updateTheme());

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'], // <== important!
  });

  return () => observer.disconnect();
}, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseImportFile(file);
      handleParsedData(parsed);
    } catch (err: any) {
      setError(err.message || "Failed to parse API file");
    }
  };

  const handleRawTextImport = async () => {
    setError("");
    if (!rawText.trim()) {
      setError("Please enter some text to import");
      return;
    }

    try {
      // Create a new File object from the raw text
      let file:any;
      if(rawText.trim().substring(0).includes("RAML")){
        file = new File([rawText], "import.raml", {
          type: "raml",
        });
      }else{
        file = new File([rawText], "import.json", {
          type: "application/json",
        });
      }
      const parsed = await parseImportFile(file);
      handleParsedData(parsed);
    } catch (err: any) {
      setError(err.message || "Failed to parse API text");
    }
  };

  const handleParsedData = (parsed: any) => {
    let collection: Collection;

    switch (parsed.type) {
      case "openapi":
        //collection = convertOpenAPIToCollection(parsed.source);
        collection = convertPostmanToCollection(parsed.source);
        break;
      case "graphql":
        collection = convertGraphQLToCollection(parsed.source);
        break;
      case "raml":
        collection = convertRAMLToCollection(parsed.source);
        break;
      case "postman":
        collection = convertPostmanToCollection(parsed.source);
        break;
      case "yaml":
        collection = convertYAMLToCollection(parsed.source);
        break;
      case "yml":
        collection = convertYMLToCollection(parsed.source);
        break;
      default:
        throw new Error("Unsupported API format");
    }

    const collection2: APICollection = {
      id: crypto.randomUUID(),
      name: collection.name,
      description: collection.description || "",
      auth: collection.auth || { type: "none", credentials: {} },
      variables: collection.variables || [],
      folders: collection.folders || [],
      requests: collection.requests,
    };

    addCollection(collection2);
    setIsModalOpen(false);
    setRawText("");
  };

  function convertYAMLToCollection(yamlObj: any): Collection {
    // Try OpenAPI
    if (yamlObj.openapi && yamlObj.paths) {
      return convertOpenAPIToCollection(yamlObj);
    }
    // Try RAML
    if (yamlObj.title && yamlObj.baseUri) {
      return convertRAMLToCollection(yamlObj);
    }
    throw new Error("Unsupported YAML API format");
  }

  /**
   * Alias for convertYAMLToCollection, for .yml files.
   */
  function convertYMLToCollection(ymlObj: any): Collection {
    return convertYAMLToCollection(ymlObj);
  }

  function convertGraphQLToCollection(source: any): Collection {
    // If you want to extract queries/mutations, use a GraphQL parser here.
    // For now, just provide a default query and endpoint.
    return {
      name: source?.info?.title || "Imported GraphQL",
      requests: [
        {
          id: crypto.randomUUID(),
          name: "GraphQL Query",
          method: "POST",
          url: source?.servers?.[0]?.url || "/graphql",
          body: {
            mode: "raw" as const,
            raw: JSON.stringify(
              { query: "{ __schema { types { name } } }" },
              null,
              2
            ),
            options: {
              raw: {
                language: "json" as const,
              },
            },
          },
          headers: [
            {
              id: crypto.randomUUID(),
              key: "Content-Type",
              value: "application/json",
            },
          ],
          queryParams: [],
          contentType: "application/json",
          auth: { type: "", credentials: {} },
          response: [],
        },
      ],
    };
  }

  function convertOpenAPIToCollection(openapi: any): Collection {
    const requests: APIRequest[] = [];

    Object.entries(openapi.paths || {}).forEach(([path, methods]: any) => {
      Object.entries(methods).forEach(([method, detail]: any) => {
        if (
          !["get", "post", "put", "delete", "patch", "options", "head"].includes(
            method
          )
        )
          return;

        // Extract headers
        const headers = (detail.parameters || [])
          .filter((param: any) => param.in === "header")
          .map((param: any) => ({
            id: crypto.randomUUID(),
            key: param.name,
            value: param.example || param.default || "",
            description: param.description || "",
          }));

        // Extract query parameters
        const queryParams = (detail.parameters || [])
          .filter((param: any) => param.in === "query")
          .map((param: any) => ({
            key: param.name,
            value: param.example || param.default || "",
            description: param.description || "",
          }));

        // Extract request body (prefer application/json)
        let body;
        const content = detail.requestBody?.content;
        if (content) {
          if (content["application/json"]) {
            body = {
              mode: "raw" as const,
              raw: {
                content: JSON.stringify(content["application/json"].example ||
                  content["application/json"].examples?.[0]?.value ||
                  {},
                  null,
                  2
                ),
                language: "json",
              },
              options: {
                raw: {
                  language: "json" as const,
                },
              },
            };
          } else if (content["application/x-www-form-urlencoded"]) {
            body = {
              mode: "urlencoded" as const,
              urlencoded: Object.entries(
                content["application/x-www-form-urlencoded"].schema?.properties ||
                {}
              ).map(([key, prop]: any) => ({
                key,
                value: prop.example || "",
                type: "text",
              })),
            };
          }
        }

        requests.push({
          id: crypto.randomUUID(),
          name: detail.summary || `${method.toUpperCase()} ${path}`,
          method: method.toUpperCase() as "GET" | "POST" | "PUT" | "DELETE",
          url: path,
          body: body as RequestBody,
          headers,
          queryParams,
          contentType: content ? Object.keys(content)[0] : "",
          auth: { type: "", credentials: {} },
          response: [],
        });
      });
    });

    return {
      name: openapi.info?.title || "Imported OpenAPI",
      requests,
    };
  }

  return (
    <>
      <ImportBar>
        <LogoImg src={isDarkTheme ? logo_black : logo} 
          style={{height: isDarkTheme ? '45px' : '48px',}}
        alt="Logo" />
        <ImportButton onClick={() => setIsModalOpen(true)}>Import</ImportButton>
      </ImportBar>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h2>Import Data</h2>
              <CloseButton onClick={() => setIsModalOpen(false)}>
                &times;
              </CloseButton>
            </ModalHeader>

            <RadioGroup>
              <RadioOption>
                <input
                  type="radio"
                  name="importType"
                  value="file"
                  checked={importType === "file"}
                  onChange={(e) =>
                    setImportType(e.target.value as "file" | "text")
                  }
                />
                Import File
              </RadioOption>
              <RadioOption>
                <input
                  type="radio"
                  name="importType"
                  value="text"
                  checked={importType === "text"}
                  onChange={(e) =>
                    setImportType(e.target.value as "file" | "text")
                  }
                />
                Paste Raw Text
              </RadioOption>
            </RadioGroup>

            {importType === "file" ? (
              <div>
                <FileInputButton as="label">
                  Choose File
                  <FileInput
                    type="file"
                    accept=".json,.yaml,.yml,.graphql,.raml"
                    onChange={handleFileSelect}
                  />
                </FileInputButton>
              </div>
            ) : (
              <div>
                <TextArea
                  placeholder="Paste your API specification here..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
                <ImportButton
                  onClick={handleRawTextImport}
                  style={{ marginTop: "12px" }}
                >
                  Import Text
                </ImportButton>
              </div>
            )}

            {error && <ErrorText>{error}</ErrorText>}
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
}

// === Converters ===

function convertRAMLToCollection(raml: any): Collection {
  const requests: APIRequest[] = [];
  const baseUri = raml.baseUri || "";

  Object.entries(raml).forEach(([key, value]: [string, any]) => {
    if (key.startsWith("/")) {
      // This is a resource path
      const path = key;
      const resource = value;
      Object.entries(resource).forEach(([method, detail]: [string, any]) => {
        if (
          ["get", "post", "put", "delete", "patch", "options", "head"].includes(
            method
          )
        ) {
          // Extract headers (RAML rarely uses them at this level)
          const headers: any = [];
          // Extract query parameters (not present in your example)
          const queryParams: any = [];
          // Extract body from 200 response if present
          let body;
          const resp = detail.responses?.["200"]?.body?.["application/json"];
          if (resp && resp.example) {
            body = {
              mode: "raw" as const,
              raw:
                typeof resp.example === "string"
                  ? resp.example
                  : JSON.stringify(resp.example, null, 2),
              options: {
                raw: {
                  language: "json" as const,
                },
              },
            };
          }
          requests.push({
            id: crypto.randomUUID(),
            name: detail.description || `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase() as "GET" | "POST" | "PUT" | "DELETE",
            url: baseUri + path,
            body,
            headers,
            queryParams,
            contentType: "application/json",
            auth: { type: "", credentials: {} },
            response: []
          });
        }
      });
    }
  });

  return {
    name: raml.title || "Imported RAML",
    requests: requests.length
      ? requests
      : [
        {
          id: crypto.randomUUID(),
          name: "Sample RAML Request",
          method: "GET",
          url: "/",
          body: undefined,
          headers: [],
          queryParams: [],
          contentType: "",
          auth: { type: "", credentials: {} },
          response: [],
        },
      ],
  };
}

interface PostmanUrl {
  protocol?: string;
  host?: string | string[];
  path?: string | string[];
  query?: { key: string; value: string }[];
  variable?: any[];
}

function buildPostmanUrl(urlObj: PostmanUrl): string {
  const protocol = urlObj.protocol || 'https';

  const host = Array.isArray(urlObj.host)
    ? urlObj.host.join('.')
    : urlObj.host || '';

  const path = Array.isArray(urlObj.path)
    ? urlObj.path.join('/')
    : urlObj.path || '';

  const query = (urlObj.query || [])
    .map(({ key, value }) => `${key}=${value}`)
    .join('&');

  return `${protocol}://${host}/${path}${query ? `?${query}` : ''}`;
}



function extractFoldersAndRequests(items: any[]): { folders: any[], requests: APIRequest[] } {
  const folders: any[] = [];
  const requests: APIRequest[] = [];
  let queryparams: QueryParam[]
  items.forEach((item) => {
    if (item.item) {
      // This is a folder
      const { folders: nestedFolders, requests: nestedRequests } = extractFoldersAndRequests(item.item);
      folders.push({
        id: crypto.randomUUID(),
        name: item.name || "Untitled Folder",
        description: item.description || "",
        folders: nestedFolders,
        requests: nestedRequests,
        auth: item.auth ? {
          type: item.auth.type || "none",
          credentials: Array.isArray(item.auth[item.auth.type])
            ? Object.fromEntries(item.auth[item.auth.type].map((e: any) => [e.key, e.value]))
            : item.auth[item.auth.type] || {}
        } : undefined
      });
    } else if (item.request) {
      // This is a request
      let url = "";
      if (typeof item.request.url === "string") {
        url = item.request.url;
      } else if (typeof item.request.url === "object" && item.request.url !== null) {
        queryparams = (item.request.url.query || [])
          .map((param: any) => ({
            id: crypto.randomUUID(),
            key: param.key,
            value: param.value || param.default || "",
            description: param.description || "",
            isSelected: true
          }));
        url = item.request.url.raw || buildPostmanUrl(item.request.url);
      }

      const authObj = item.request.auth || {};
      const authType = authObj.type || "";
      const credentials = authObj[authType] || {};

      const headers = (item.request.header || []).map((h: any) => ({
        id: crypto.randomUUID(),
        key: h.key,
        value: h.value,
        description: h.description || "",
        isSelected: true
      }));

      // Handle request body
      let body;
      if (item.request.body) {
        const mode = item.request.body.mode;
        switch (mode) {
          case "formdata":
            body = {
              mode: "formdata" as const,
                formData: (item.request.body.formdata || []).map((item: any) => ({
                key: item.key || "",
                value: item.value || "",
                type: item.type || "text",
                src: item.src || "",
                isSelected: true
              })),
            };
            break;
          case "urlencoded":
            body = {
              mode: "urlencoded" as const,
              urlencoded: (item.request.body.urlencoded || []).map(
                (item: any) => ({
                  key: item.key || "",
                  value: item.value || "",
                  type: "text",
                  isSelected: true
                })
              ),
            };
            break;
          case "raw":
            body = {
              mode: "raw" as const,
              raw: item.request.body.raw || "",
              options: {
                raw: {
                  language: (item.request.body.options?.raw?.language ||
                    "text") as "json" | "text" | "html" | "xml" | "javascript",
                },
              },
            };
            break;
          case "file":
            body = {
              mode: "file" as const,
              file: { src: item.request.body.file?.src || "" },
            };
            break;
          case "graphql":
            console.log('Parsing GraphQL body:', item.request.body.graphql);
            body = {
              mode: "graphql" as const,
              graphql: {
                query: item.request.body.graphql?.query || "",
                variables: item.request.body.graphql?.variables || "",
              },
            };
            console.log('Parsed GraphQL body:', body);
            break;
          default:
            body = { mode: "none" as const };
        }
      }

      requests.push({
        id: crypto.randomUUID(),
        name: item.name || "Postman Request",
        method: item.request.method || "GET",
        url,
        body: body as RequestBody,
        headers,
        queryParams: queryparams || [],
        contentType:
          item.request.body?.options?.raw?.language === "json"
            ? "application/json"
            : "text/plain",
        auth: {
          type: authType,
          credentials: Array.isArray(credentials)
            ? Object.fromEntries(credentials.map((e: any) => [e.key, e.value]))
            : credentials,
        },
        response: [],
      });
    }
  });

  return { folders, requests };
}

function convertPostmanToCollection(postman: any): APICollection {
  const { folders, requests } = extractFoldersAndRequests(postman.item || []);
  return {
    id: crypto.randomUUID(),
    name: postman.info?.name || "Imported Postman Collection",
    description: extractDescription(postman.info?.description),
    folders,
    requests,
    auth: postman.auth ? {
      type: postman.auth.type || "none",
      credentials: Array.isArray(postman.auth[postman.auth.type])
        ? Object.fromEntries(postman.auth[postman.auth.type].map((e: any) => [e.key, e.value]))
        : postman.auth[postman.auth.type] || {}
    } : {
      type: "none",
      credentials: {}
    },
    variables: postman.variable?.map((v: any) => ({
      id: crypto.randomUUID(),
      name: v.key || "",
      initialValue: v.value || "",
      currentValue: v.value || "",
      isSelected: true
    })) || []
  };
}


const extractDescription = (desc: any): string =>
  desc && typeof desc === 'object' && typeof desc.content === 'string'
    ? desc.content
    : typeof desc === 'string'
      ? desc
      : '';
 