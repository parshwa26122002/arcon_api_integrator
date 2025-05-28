import type { 
  Variable, 
  APIRequest, 
  Header, 
  QueryParam, 
  FormDataItem, 
  UrlEncodedItem,
  RequestBody,
  AuthState
} from '../store/collectionStore';
import { replaceDynamicVariables } from './dynamicVariables';

export const replaceVariables = (text: string, variables: Variable[] = []): string => {
  if (!text) return text;
  
  // First process dynamic variables (starting with $)
  let processedText = replaceDynamicVariables(text);
  
  // Then process collection variables (in {{...}})
  return processedText.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const variable = variables.find(v => v.name === variableName.trim());
    return variable?.currentValue || match;
  });
};

export const processRequestWithVariables = (request: APIRequest, variables: Variable[] = []): APIRequest => {
  const processValue = <T>(value: T): T => {
    if (typeof value === 'string') {
      return replaceVariables(value, variables) as T;
    }
    if (Array.isArray(value)) {
      return value.map(item => processValue(item)) as T;
    }
    if (typeof value === 'object' && value !== null) {
      const processed: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        processed[key] = processValue(val);
      }
      return processed as T;
    }
    return value;
  };

  // Create a deep copy of the request to avoid modifying the original
  const processedRequest: APIRequest = JSON.parse(JSON.stringify(request));

  // Process URL
  if (processedRequest.url) {
    processedRequest.url = replaceVariables(processedRequest.url, variables);
  }

  // Process query parameters
  if (processedRequest.queryParams) {
    processedRequest.queryParams = processedRequest.queryParams.map((param: QueryParam) => ({
      ...param,
      key: replaceVariables(param.key, variables),
      value: replaceVariables(param.value, variables),
    }));
  }

  // Process headers
  if (processedRequest.headers) {
    processedRequest.headers = processedRequest.headers.map((header: Header) => ({
      ...header,
      key: replaceVariables(header.key, variables),
      value: replaceVariables(header.value, variables),
    }));
  }

  // Process body based on its mode
  if (processedRequest.body) {
    const body = processedRequest.body as RequestBody;
    switch (body.mode) {
      case 'raw':
        if (body.raw) {
          // Handle different raw body formats
          switch (body.options?.raw?.language) {
            case 'json':
              try {
                const jsonObj = JSON.parse(body.raw);
                const processedJson = processValue(jsonObj);
                body.raw = JSON.stringify(processedJson);
              } catch {
                // If JSON parsing fails, treat as regular string
                body.raw = replaceVariables(body.raw, variables);
              }
              break;
            case 'xml':
            case 'html':
            case 'javascript':
            case 'text':
            default:
              // For all other formats, do direct string replacement
              body.raw = replaceVariables(body.raw, variables);
              break;
          }
        }
        break;
      case 'form-data':
        if (body.formData) {
          body.formData = body.formData.map((item: FormDataItem) => ({
            ...item,
            key: replaceVariables(item.key, variables),
            value: replaceVariables(item.value, variables),
          }));
        }
        break;
      case 'urlencoded':
        if (body.urlencoded) {
          body.urlencoded = body.urlencoded.map((item: UrlEncodedItem) => ({
            ...item,
            key: replaceVariables(item.key, variables),
            value: replaceVariables(item.value, variables),
          }));
        }
        break;
    }
  }

  // Process auth credentials
  if (processedRequest.auth) {
    processedRequest.auth = processValue<AuthState>(processedRequest.auth);
  }

  return processedRequest;
}; 