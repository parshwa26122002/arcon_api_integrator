import type { Variable, Header, QueryParam, FormDataItem, APIRequest } from '../store/collectionStore';
import { processDynamicVariables } from './dynamicVariables';

// Function to substitute both dynamic and collection variables in a string
export const substituteVariables = (text: string, variables: Variable[]): string => {
  if (!text) return text;
  
  // First process dynamic variables (starting with $)
  let processedText = processDynamicVariables(text);
  
  // Then process collection variables (in {{...}})
  return processedText.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const variable = variables.find(v => v.name === variableName.trim());
    return variable?.currentValue || match;
  });
};

// Function to process request data with variable substitution
export const processRequestWithVariables = (request: APIRequest, variables: Variable[]): APIRequest => {
  const processedRequest = { ...request };

  // Substitute variables in URL
  if (request.url) {
    processedRequest.url = substituteVariables(request.url, variables);
  }

  // Substitute variables in headers
  processedRequest.headers = request.headers.map((header: Header) => ({
    ...header,
    key: substituteVariables(header.key, variables),
    value: substituteVariables(header.value, variables)
  }));

  // Substitute variables in query params
  processedRequest.queryParams = request.queryParams.map((param: QueryParam) => ({
    ...param,
    key: substituteVariables(param.key, variables),
    value: substituteVariables(param.value, variables)
  }));

  // Substitute variables in body
  if (request.body) {
    switch (request.body.mode) {
      case 'raw':
        if (request.body.raw) {
          processedRequest.body = {
            ...request.body,
            raw: substituteVariables(request.body.raw, variables)
          };
        }
        break;
      case 'form-data':
        if (request.body.formData) {
          processedRequest.body = {
            ...request.body,
            formData: request.body.formData.map((item: FormDataItem) => ({
              ...item,
              key: substituteVariables(item.key, variables),
              value: substituteVariables(item.value, variables)
            }))
          };
        }
        break;
      case 'urlencoded':
        if (request.body.urlencoded) {
          processedRequest.body = {
            ...request.body,
            urlencoded: request.body.urlencoded.map((item) => ({
              ...item,
              key: substituteVariables(item.key, variables),
              value: substituteVariables(item.value, variables)
            }))
          };
        }
        break;
    }
  }

  return processedRequest;
};

// Function to extract all variable references from a string
export const extractVariableReferences = (text: string): string[] => {
  if (!text) return [];
  
  const matches = text.match(/\{\{([^}]+)\}\}/g) || [];
  return matches.map(match => match.slice(2, -2).trim());
};

// Function to validate if all required variables are present
export const validateVariables = (request: APIRequest, variables: Variable[]): { isValid: boolean; missingVariables: string[] } => {
  const allReferences = new Set<string>();

  // Check URL
  if (request.url) {
    extractVariableReferences(request.url).forEach(ref => allReferences.add(ref));
  }

  // Check headers
  request.headers.forEach(header => {
    extractVariableReferences(header.key).forEach(ref => allReferences.add(ref));
    extractVariableReferences(header.value).forEach(ref => allReferences.add(ref));
  });

  // Check query params
  request.queryParams.forEach(param => {
    extractVariableReferences(param.key).forEach(ref => allReferences.add(ref));
    extractVariableReferences(param.value).forEach(ref => allReferences.add(ref));
  });

  // Check body
  if (request.body) {
    switch (request.body.mode) {
      case 'raw':
        if (request.body.raw) {
          extractVariableReferences(request.body.raw).forEach(ref => allReferences.add(ref));
        }
        break;
      case 'form-data':
        request.body.formData?.forEach(item => {
          extractVariableReferences(item.key).forEach(ref => allReferences.add(ref));
          extractVariableReferences(item.value).forEach(ref => allReferences.add(ref));
        });
        break;
      case 'urlencoded':
        request.body.urlencoded?.forEach(item => {
          extractVariableReferences(item.key).forEach(ref => allReferences.add(ref));
          extractVariableReferences(item.value).forEach(ref => allReferences.add(ref));
        });
        break;
    }
  }

  const missingVariables = Array.from(allReferences).filter(
    ref => !variables.some(v => v.name === ref)
  );

  return {
    isValid: missingVariables.length === 0,
    missingVariables
  };
}; 