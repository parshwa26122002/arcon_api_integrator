import json
import re
from urllib.parse import urljoin, urlparse
from ruamel.yaml import YAML

yaml = YAML()


def load_raml(raml_file):
    """Load RAML file and return parsed data"""
    with open(raml_file, 'r') as f:
        return yaml.load(f)


def raml_type_to_example(type_def, types, depth=0):
    """
    Generate example JSON from RAML type definition.
    Avoid infinite recursion by limiting depth.
    """
    if depth > 5:
        return None
    
    if not type_def:
        return None
        
    # Handle string type references
    if isinstance(type_def, str):
        # Check if it's a reference to a defined type
        if type_def in types:
            type_obj = types[type_def]
            if isinstance(type_obj, dict) and 'properties' in type_obj:
                return raml_type_to_example(type_obj['properties'], types, depth + 1)
            elif isinstance(type_obj, dict) and 'type' in type_obj:
                return raml_type_to_example(type_obj['type'], types, depth + 1)
        
        # Handle array types like "User[]"
        if type_def.endswith('[]'):
            element_type = type_def[:-2]
            element_example = raml_type_to_example(element_type, types, depth + 1)
            return [element_example] if element_example else []
        
        # Primitive types
        primitive_examples = {
            'string': "example string",
            'integer': 123,
            'number': 123.45,
            'boolean': True,
            'datetime': "2024-01-01T12:00:00Z",
            'date': "2024-01-01",
            'array': [],
            'object': {},
            'file': "file.txt"
        }
        return primitive_examples.get(type_def, f"example_{type_def}")
    
    # Handle object type definitions
    elif isinstance(type_def, dict):
        example = {}
        for prop, prop_def in type_def.items():
            if isinstance(prop_def, dict):
                if 'type' in prop_def:
                    example[prop] = raml_type_to_example(prop_def['type'], types, depth + 1)
                else:
                    example[prop] = raml_type_to_example(prop_def, types, depth + 1)
            else:
                example[prop] = raml_type_to_example(prop_def, types, depth + 1)
        return example
    
    return None


def parse_url(base_uri, resource_path):
    """
    Construct full URL and handle path parameters with Postman variable syntax {{param}}
    """
    # Clean up the resource path
    clean_path = resource_path.strip('/')
    
    # Build full URL
    if base_uri.endswith('/'):
        full_url = base_uri + clean_path
    else:
        full_url = base_uri + '/' + clean_path
    
    # Replace RAML URI params {param} with Postman style {{param}}
    postman_url = re.sub(r'\{([^}]+)\}', r'{{\1}}', full_url)
    
    parsed = urlparse(postman_url)
    host_parts = parsed.netloc.split('.') if parsed.netloc else ['localhost']
    path_parts = [p for p in parsed.path.split('/') if p]
    
    return {
        "raw": postman_url,
        "protocol": parsed.scheme or "https",
        "host": host_parts,
        "path": path_parts
    }


def build_postman_request(method, base_uri, resource_path, method_data, types):
    """Build a Postman request object from RAML method definition"""
    req = {
        "method": method.upper(),
        "header": [],
        "url": parse_url(base_uri, resource_path)
    }

    # Add query parameters
    if 'queryParameters' in method_data:
        req["url"]["query"] = []
        for param_name, param_def in method_data['queryParameters'].items():
            query_param = {
                "key": param_name,
                "value": "",
                "description": param_def.get("description", "") if isinstance(param_def, dict) else ""
            }
            # Add disabled state for optional parameters
            if isinstance(param_def, dict) and param_def.get("required") is False:
                query_param["disabled"] = True
            req["url"]["query"].append(query_param)

    # Add headers
    if 'headers' in method_data:
        for header_name, header_def in method_data['headers'].items():
            req['header'].append({
                "key": header_name,
                "value": "",
                "description": header_def.get("description", "") if isinstance(header_def, dict) else ""
            })

    # Add request body
    if 'body' in method_data:
        body_data = method_data['body']
        media_types = list(body_data.keys())
        
        if media_types:
            media_type = media_types[0]  # Use first media type
            body_spec = body_data[media_type]
            
            if 'multipart/form-data' in media_type:
                # Handle form data
                req['body'] = {
                    "mode": "formdata",
                    "formdata": []
                }
                if isinstance(body_spec, dict) and 'properties' in body_spec:
                    for prop_name, prop_def in body_spec['properties'].items():
                        form_item = {
                            "key": prop_name,
                            "value": "",
                            "type": "file" if prop_def == "file" else "text"
                        }
                        req['body']['formdata'].append(form_item)
            else:
                # Handle JSON/raw body
                example_data = None
                
                # Try to get example from type
                if isinstance(body_spec, dict):
                    if 'type' in body_spec:
                        example_data = raml_type_to_example(body_spec['type'], types)
                    elif 'properties' in body_spec:
                        example_data = raml_type_to_example(body_spec['properties'], types)
                    elif 'example' in body_spec:
                        example_data = body_spec['example']
                
                req['body'] = {
                    "mode": "raw",
                    "raw": json.dumps(example_data, indent=2) if example_data else "{}",
                    "options": {
                        "raw": {
                            "language": "json" if 'json' in media_type else "text"
                        }
                    }
                }
            
            # Add Content-Type header if not already present
            if not any(h['key'].lower() == 'content-type' for h in req['header']):
                req['header'].append({
                    "key": "Content-Type",
                    "value": media_type
                })

    # Add description
    if 'description' in method_data:
        req['description'] = method_data['description']

    return req


def extract_requests_from_resource(resource_path, resource_data, base_uri, types, parent_path=""):
    """Extract all requests from a resource and its nested resources"""
    requests = []
    full_path = parent_path + resource_path
    
    # HTTP methods to look for
    http_methods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']
    
    # Process methods at current level
    for key, value in resource_data.items():
        if key.lower() in http_methods:
            method_name = key.lower()
            method_data = value
            
            request = build_postman_request(method_name, base_uri, full_path, method_data, types)
            
            # Create request item
            request_item = {
                "name": f"{method_name.upper()} {full_path}",
                "request": request
            }
            
            # Add response examples if available
            if 'responses' in method_data and method_data['responses']:
                request_item['response'] = []
                for status_code, response_data in method_data['responses'].items():
                    # Fix: Handle None response_data
                    if response_data is None:
                        response_data = {}
                    
                    example_response = {
                        "name": f"Response {status_code}",
                        "originalRequest": request,
                        "status": response_data.get('description', '') if isinstance(response_data, dict) else '',
                        "code": int(status_code),
                        "_postman_previewlanguage": "json",
                        "header": [],
                        "body": ""
                    }
                    
                    # Add response body example
                    if isinstance(response_data, dict) and 'body' in response_data:
                        body_data = response_data['body']
                        if isinstance(body_data, dict):
                            media_types = list(body_data.keys())
                            if media_types:
                                media_type = media_types[0]
                                body_spec = body_data[media_type]
                                
                                if isinstance(body_spec, dict) and 'type' in body_spec:
                                    example_data = raml_type_to_example(body_spec['type'], types)
                                    if example_data:
                                        example_response['body'] = json.dumps(example_data, indent=2)
                                
                                example_response['header'].append({
                                    "key": "Content-Type",
                                    "value": media_type
                                })
                    
                    request_item['response'].append(example_response)
            
            requests.append(request_item)
    
    # Process nested resources (keys starting with '/')
    for key, value in resource_data.items():
        if key.startswith('/') and isinstance(value, dict):
            nested_requests = extract_requests_from_resource(key, value, base_uri, types, full_path)
            requests.extend(nested_requests)
    
    return requests


def organize_requests_into_folders(requests):
    """Organize requests into folders based on their paths"""
    folders = {}
    
    for request in requests:
        # Extract the main resource path (first part after the method)
        request_name = request['name']
        path_parts = request_name.split(' ', 1)[1].strip('/').split('/')
        
        if len(path_parts) > 0:
            main_resource = path_parts[0]
            
            # Create folder if it doesn't exist
            if main_resource not in folders:
                folders[main_resource] = {
                    "name": main_resource.replace('-', ' ').replace('_', ' ').title(),
                    "item": []
                }
            
            folders[main_resource]["item"].append(request)
    
    return list(folders.values())


def build_postman_collection(raml_data):
    """Build complete Postman collection from RAML data"""
    title = raml_data.get('title', 'API Collection')
    base_uri = raml_data.get('baseUri', 'https://api.example.com')
    version = raml_data.get('version', '')
    
    # Get type definitions
    types = raml_data.get('types', {})
    
    # Extract all requests from all resources
    all_requests = []
    
    # Process all top-level resources (keys starting with '/')
    for resource_path, resource_data in raml_data.items():
        if resource_path.startswith('/') and isinstance(resource_data, dict):
            requests = extract_requests_from_resource(resource_path, resource_data, base_uri, types)
            all_requests.extend(requests)
    
    # Organize requests into folders
    folders = organize_requests_into_folders(all_requests)
    
    # Build final collection
    collection = {
        "info": {
            "name": f"{title} {version}".strip(),
            "description": f"Generated from RAML specification: {title}",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": folders,
        "variable": [
            {
                "key": "baseUrl",
                "value": base_uri,
                "type": "string"
            }
        ]
    }
    
    return collection


def save_postman_collection(collection, output_file):
    """Save Postman collection to JSON file"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(collection, f, indent=2, ensure_ascii=False)


def main():
    """Main function to convert RAML to Postman collection"""
    import sys
    
    # Get file names from command line arguments
    raml_file = sys.argv[1] if len(sys.argv) > 1 else '100_apis.raml'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'postman_collection.json'
    
    try:
        print(f"Loading RAML file: {raml_file}")
        raml_data = load_raml(raml_file)
        
        print("Converting RAML to Postman collection...")
        collection = build_postman_collection(raml_data)
        
        print(f"Saving Postman collection to: {output_file}")
        save_postman_collection(collection, output_file)
        
        # Print summary (using ASCII characters to avoid encoding issues)
        total_requests = sum(len(folder['item']) for folder in collection['item'])
        print(f"\n[SUCCESS] Conversion completed successfully!")
        print(f"[FOLDERS] Created {len(collection['item'])} folders")
        print(f"[REQUESTS] Generated {total_requests} API requests")
        print(f"[OUTPUT] Saved to: {output_file}")
        
    except FileNotFoundError:
        print(f"[ERROR] RAML file '{raml_file}' not found.")
        print("Usage: python raml_to_postman.py <raml_file> [output_file]")
    except Exception as e:
        print(f"[ERROR] Error during conversion: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()