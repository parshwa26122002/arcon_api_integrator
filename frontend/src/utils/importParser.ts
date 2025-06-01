import yaml from 'js-yaml';

type ParsedResult =
  | { type: 'graphql'; source: string }
  | { type: 'openapi'; source: any }
  | { type: 'raml'; source: any }
  | { type: 'postman'; source: any };

// Import the converter
export async function parseImportFile(file: File): Promise<ParsedResult> {
  const content = await file.text();
  const ext = file.name.split('.').pop()?.toLowerCase();

  try {
    if (ext === 'graphql') {
      return {
        type: 'graphql',
        source: content,
      };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = yaml.load(content);
      //parsed = JSON.parse(parsed); // Ensure it's valid JSON
    }

    console.log('Parsed Content:', parsed); // Debug log

    if (parsed?.openapi && typeof parsed.openapi === 'string' && parsed.openapi.startsWith('3.')) {
      const response = await fetch('http://localhost:4000/api/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });
      return {
        type: 'openapi',
        source: await response.json(),
      };
    }

    if (parsed?.title && parsed?.version && parsed?.baseUri) {
      return {
      type: 'raml',
      source: parsed,
      };
    }

    // Handle YAML/YML extensions for OpenAPI
    if ((ext === 'yaml' || ext === 'yml') && parsed?.openapi && typeof parsed.openapi === 'string' && parsed.openapi.startsWith('3.')) {
      return {
      type: 'openapi',
      source: parsed,
      };
    }

    if (parsed?.info?.schema?.includes?.('getpostman.com')) {
      return {
        type: 'postman',
        source: parsed,
      };
    }

    throw new Error('Unsupported API format');
  } catch (err: any) {
    throw new Error(`Failed to parse file: ${err.message}`);
  }
}
