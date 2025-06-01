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
      const formData = new FormData();
      formData.append('graphqlFile', file);

      try {
        const response = await fetch("https://arcon-api-integrator-wic7.onrender.com/api/convertGraphQLToPostmanCollection", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Conversion failed.");
        }

        const json = await response.json();     
        
        return {
          type: 'postman',
          source: json,
        };
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred during conversion.");
      }
    }

    if(ext == 'raml'){
      const formData = new FormData();
      formData.append('ramlFile', file);

      try {
        const response = await fetch("https://arcon-api-integrator-wic7.onrender.com/api/convertRamlToPostmanCollection", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Conversion failed.");
        }

        const json = await response.json();     
        
        return {
          type: 'postman',
          source: json,
        };
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred during conversion.");
      }
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
      const response = await fetch('https://arcon-api-integrator-wic7.onrender.com/api/convert', {
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
