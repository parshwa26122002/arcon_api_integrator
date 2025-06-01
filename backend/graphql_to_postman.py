import json
import re
import sys
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, field
from enum import Enum
from urllib.parse import urlparse


class GraphQLTypeKind(Enum):
    SCALAR = "SCALAR"
    OBJECT = "OBJECT"
    INTERFACE = "INTERFACE"
    UNION = "UNION"
    ENUM = "ENUM"
    INPUT_OBJECT = "INPUT_OBJECT"
    LIST = "LIST"
    NON_NULL = "NON_NULL"


@dataclass
class GraphQLField:
    name: str
    type_name: str
    description: Optional[str] = None
    args: Dict[str, Any] = field(default_factory=dict)
    is_required: bool = False
    is_list: bool = False
    deprecated: bool = False


@dataclass
class GraphQLType:
    name: str
    kind: GraphQLTypeKind
    description: Optional[str] = None
    fields: List[GraphQLField] = field(default_factory=list)
    enum_values: List[str] = field(default_factory=list)
    input_fields: List[GraphQLField] = field(default_factory=list)
    interfaces: List[str] = field(default_factory=list)
    possible_types: List[str] = field(default_factory=list)


class GraphQLSchemaParser:
    def __init__(self, schema_content: str):
        self.schema_content = schema_content
        self.types: Dict[str, GraphQLType] = {}
        self.queries: List[GraphQLField] = []
        self.mutations: List[GraphQLField] = []
        self.subscriptions: List[GraphQLField] = []
        
        self.scalar_types = {
            'String', 'Int', 'Float', 'Boolean', 'ID', 'DateTime', 'Date', 
            'Time', 'JSON', 'Upload', 'BigInt', 'Long', 'UUID'
        }
        
        self.parse_schema()

    def clean_schema(self, content: str) -> str:
        content = re.sub(r'#.*$', '', content, flags=re.MULTILINE)
        content = re.sub(r'""".*?"""', '', content, flags=re.DOTALL)
        content = re.sub(r'\s+', ' ', content)
        return content.strip()

    def parse_schema(self):
        try:
            clean_content = self.clean_schema(self.schema_content)
            self.parse_types(clean_content)
            self.parse_root_types(clean_content)
        except Exception as e:
            print(f"[ERROR] Failed to parse GraphQL schema: {str(e)}")
            raise

    def parse_types(self, content: str):
        type_patterns = [
            r'type\s+(\w+)\s*(?:implements\s+([^{]+))?\s*\{([^}]*)\}',
            r'input\s+(\w+)\s*\{([^}]+)\}',
            r'enum\s+(\w+)\s*\{([^}]+)\}',
            r'interface\s+(\w+)\s*\{([^}]+)\}',
            r'union\s+(\w+)\s*=\s*([^}\n]+)',
            r'scalar\s+(\w+)'
        ]
        
        for pattern in type_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                try:
                    self.process_type_match(match, pattern)
                except Exception as e:
                    print(f"[WARNING] Failed to parse type: {str(e)}")
                    continue

    def process_type_match(self, match, pattern: str):
        groups = match.groups()
        
        if 'type' in pattern and 'input' not in pattern and 'interface' not in pattern:
            type_name = groups[0]
            implements = groups[1].strip() if groups[1] else ""
            fields_content = groups[2] if len(groups) > 2 else ""
            
            graphql_type = GraphQLType(
                name=type_name,
                kind=GraphQLTypeKind.OBJECT,
                interfaces=self.parse_implements(implements)
            )
            
            if fields_content:
                graphql_type.fields = self.parse_fields(fields_content)
            
            self.types[type_name] = graphql_type
            
        elif 'input' in pattern:
            type_name = groups[0]
            fields_content = groups[1]
            
            graphql_type = GraphQLType(
                name=type_name,
                kind=GraphQLTypeKind.INPUT_OBJECT
            )
            
            graphql_type.input_fields = self.parse_fields(fields_content)
            self.types[type_name] = graphql_type
            
        elif 'enum' in pattern:
            type_name = groups[0]
            enum_content = groups[1]
            
            graphql_type = GraphQLType(
                name=type_name,
                kind=GraphQLTypeKind.ENUM,
                enum_values=self.parse_enum_values(enum_content)
            )
            
            self.types[type_name] = graphql_type
            
        elif 'union' in pattern:
            type_name = groups[0]
            union_types = groups[1]
            
            graphql_type = GraphQLType(
                name=type_name,
                kind=GraphQLTypeKind.UNION,
                possible_types=[t.strip() for t in union_types.split('|')]
            )
            
            self.types[type_name] = graphql_type
            
        elif 'interface' in pattern:
            type_name = groups[0]
            fields_content = groups[1]
            
            graphql_type = GraphQLType(
                name=type_name,
                kind=GraphQLTypeKind.INTERFACE,
                fields=self.parse_fields(fields_content)
            )
            
            self.types[type_name] = graphql_type
            
        elif 'scalar' in pattern:
            type_name = groups[0]
            
            graphql_type = GraphQLType(
                name=type_name,
                kind=GraphQLTypeKind.SCALAR
            )
            
            self.types[type_name] = graphql_type

    def parse_implements(self, implements_str: str) -> List[str]:
        if not implements_str:
            return []
        
        implements_str = re.sub(r'implements\s+', '', implements_str, flags=re.IGNORECASE)
        return [t.strip() for t in implements_str.split('&') if t.strip()]

    def parse_fields(self, fields_content: str) -> List[GraphQLField]:
        fields = []
        # Match fieldName(args...): ReturnType or fieldName: ReturnType
        pattern = r'(\w+\s*(?:\([^)]*\))?\s*:\s*[^}]+?)(?=\s+\w+\s*(?:\(|:)|$)'
        matches = re.findall(pattern, fields_content)
        for line in matches:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            # Remove inline comments
            line = line.split('#')[0].strip()
            field = self.parse_single_field(line)
            if field:
                fields.append(field)
        return fields

    def parse_single_field(self, field_line: str) -> Optional[GraphQLField]:
        if not field_line or field_line.startswith('#'):
            return None
        
        field_line = field_line.rstrip(',').strip()
        pattern = r'^(\w+)(?:\(([^)]*)\))?\s*:\s*(.+)$'
        match = re.match(pattern, field_line)
        
        if not match:
            return None
        
        field_name = match.group(1)
        args_str = match.group(2) or ""
        type_str = match.group(3)
        
        is_required = type_str.endswith('!')
        is_list = '[' in type_str and ']' in type_str
        type_name = self.clean_type_name(type_str)
        args = self.parse_arguments(args_str) if args_str else {}
        
        return GraphQLField(
            name=field_name,
            type_name=type_name,
            args=args,
            is_required=is_required,
            is_list=is_list
        )

    def clean_type_name(self, type_str: str) -> str:
        return re.sub(r'[!\[\]\s]', '', type_str)

    def parse_arguments(self, args_str: str) -> Dict[str, Any]:
        args = {}
        
        if not args_str.strip():
            return args
        
        arg_parts = [arg.strip() for arg in args_str.split(',') if arg.strip()]
        
        for arg_part in arg_parts:
            try:
                match = re.match(r'^(\w+)\s*:\s*([^=]+)(?:\s*=\s*(.+))?$', arg_part)
                if match:
                    arg_name = match.group(1)
                    arg_type = match.group(2).strip()
                    default_value = match.group(3)
                    
                    args[arg_name] = {
                        'type': self.clean_type_name(arg_type),
                        'required': arg_type.endswith('!'),
                        'default': default_value
                    }
            except Exception as e:
                print(f"[WARNING] Failed to parse argument '{arg_part}': {str(e)}")
                continue
        
        return args

    def parse_enum_values(self, enum_content: str) -> List[str]:
        values = []
        value_lines = [line.strip() for line in enum_content.split('\n') if line.strip()]
        
        for line in value_lines:
            value = re.sub(r'#.*$', '', line).strip()
            if value:
                values.append(value)
        
        return values

    def parse_root_types(self, content: str):
        root_type_pattern = r'type\s+(Query|Mutation|Subscription)\s*\{([^}]+)\}'
        
        matches = re.finditer(root_type_pattern, content, re.IGNORECASE)
        
        for match in matches:
            type_name = match.group(1)
            fields_content = match.group(2)
            
            temp_type = GraphQLType(
                name=type_name,
                kind=GraphQLTypeKind.OBJECT
            )
            
            if fields_content:
                temp_type.fields = self.parse_fields(fields_content)
            
            if type_name.lower() == 'query':
                self.queries = temp_type.fields
                print(f"Found {len(self.queries)} queries: {[q.name for q in self.queries]}")
            elif type_name.lower() == 'mutation':
                self.mutations = temp_type.fields
                print(f"Found {len(self.mutations)} mutations: {[m.name for m in self.mutations]}")
            elif type_name.lower() == 'subscription':
                self.subscriptions = temp_type.fields
                print(f"Found {len(self.subscriptions)} subscriptions: {[s.name for s in self.subscriptions]}")


class GraphQLToPostmanConverter:
    def __init__(self, parser: GraphQLSchemaParser, endpoint_url: str = "https://api.example.com/graphql"):
        self.parser = parser
        self.endpoint_url = endpoint_url
    
    def generate_example_value(self, type_name: str, depth: int = 0) -> Any:
        if depth > 5:
            return None
        
        if type_name in self.parser.scalar_types:
            return self.get_scalar_example(type_name)
        
        if type_name in self.parser.types:
            graphql_type = self.parser.types[type_name]
            
            if graphql_type.kind == GraphQLTypeKind.ENUM:
                return graphql_type.enum_values[0] if graphql_type.enum_values else "ENUM_VALUE"
            elif graphql_type.kind == GraphQLTypeKind.INPUT_OBJECT:
                example = {}
                for field in graphql_type.input_fields:
                    if field.is_required or depth < 2:
                        example[field.name] = self.generate_example_value(field.type_name, depth + 1)
                return example
            elif graphql_type.kind == GraphQLTypeKind.OBJECT:
                return f"<{type_name} object>"
        
        return f"example_{type_name}"
    
    def get_scalar_example(self, scalar_type: str) -> Any:
        examples = {
            'String': "example string",
            'Int': 123,
            'Float': 123.45,
            'Boolean': True,
            'ID': "example-id-123",
            'DateTime': "2024-01-01T12:00:00Z",
            'Date': "2024-01-01",
            'Time': "12:00:00",
            'JSON': {"key": "value"},
            'UUID': "550e8400-e29b-41d4-a716-446655440000",
            'BigInt': 9223372036854775807,
            'Long': 9223372036854775807
        }
        return examples.get(scalar_type, f"example_{scalar_type}")
    
    def build_query_string(self, field: GraphQLField, operation_type: str = "query") -> str:
        operation_name = f"{operation_type}_{field.name}"
        args_str = ""
        variables_str = ""
        
        if field.args:
            arg_parts = []
            var_parts = []
            
            for arg_name, arg_info in field.args.items():
                var_name = f"${arg_name}"
                arg_type = arg_info['type']
                is_required = arg_info.get('required', False)
                
                var_parts.append(f"{var_name}: {arg_type}{'!' if is_required else ''}")
                arg_parts.append(f"{arg_name}: {var_name}")
            
            if var_parts:
                variables_str = f"({', '.join(var_parts)})"
            
            if arg_parts:
                args_str = f"({', '.join(arg_parts)})"
        
        selection_set = self.build_selection_set(field.type_name)
        return f"{operation_type} {operation_name}{variables_str} {{\n  {field.name}{args_str}{selection_set}\n}}"
    
    def build_selection_set(self, type_name: str, depth: int = 0) -> str:
        if depth > 3:
            return ""
        
        if type_name.startswith('[') and type_name.endswith(']'):
            inner_type = type_name[1:-1].replace('!', '')
            return self.build_selection_set(inner_type, depth)
        
        clean_type = type_name.replace('!', '')
        
        if clean_type in self.parser.scalar_types:
            return ""
        
        if clean_type in self.parser.types:
            graphql_type = self.parser.types[clean_type]
            
            if graphql_type.kind == GraphQLTypeKind.OBJECT:
                if not graphql_type.fields:
                    return ""
                
                selected_fields = []
                for field in graphql_type.fields:
                    if field.type_name in self.parser.scalar_types:
                        selected_fields.append(field.name)
                    else:
                        nested_selection = self.build_selection_set(field.type_name, depth + 1)
                        if nested_selection:
                            selected_fields.append(f"{field.name}{nested_selection}")
                        else:
                            selected_fields.append(field.name)
                
                if selected_fields:
                    return " {\n    " + "\n    ".join(selected_fields) + "\n  }"
        
        return ""
    
    def generate_variables(self, field: GraphQLField) -> Dict[str, Any]:
        variables = {}
        
        for arg_name, arg_info in field.args.items():
            arg_type = arg_info['type']
            variables[arg_name] = self.generate_example_value(arg_type)
        
        return variables
    
    def create_postman_request(self, field: GraphQLField, operation_type: str) -> Dict[str, Any]:
        query = self.build_query_string(field, operation_type)
        variables = self.generate_variables(field)
        
        body = {
            "mode": "graphql",
            "graphql": {
                "query": query,
                "variables": json.dumps(variables, indent=2) if variables else "{}"
            }
        }
        
        return {
            "method": "POST",
            "header": [],
            "body": body,
            "url": {
                "raw": "{{url}}",
                "host": ["{{url}}"]
            },
            "description": f"GraphQL {operation_type} operation: {field.name}"
        }
    
    def create_postman_collection(self, collection_name: str = "GraphQL API") -> Dict[str, Any]:
        folders = []
        
        # Create Queries folder
        if self.parser.queries:
            query_items = []
            for query in self.parser.queries:
                try:
                    request = self.create_postman_request(query, "query")
                    query_items.append({
                        "name": query.name,
                        "request": request,
                        "response": []
                    })
                    print(f"Added query: {query.name}")
                except Exception as e:
                    print(f"[WARNING] Failed to create query '{query.name}': {str(e)}")
                    continue
            
            if query_items:
                folders.append({
                    "name": "queries",
                    "item": query_items
                })
        
        # Create Mutations folder
        if self.parser.mutations:
            mutation_items = []
            for mutation in self.parser.mutations:
                try:
                    request = self.create_postman_request(mutation, "mutation")
                    mutation_items.append({
                        "name": mutation.name,
                        "request": request,
                        "response": []
                    })
                    print(f"Added mutation: {mutation.name}")
                except Exception as e:
                    print(f"[WARNING] Failed to create mutation '{mutation.name}': {str(e)}")
                    continue
            
            if mutation_items:
                folders.append({
                    "name": "mutations",
                    "item": mutation_items
                })
        
        # Create Subscriptions folder if any exist
        if self.parser.subscriptions:
            subscription_items = []
            for subscription in self.parser.subscriptions:
                try:
                    request = self.create_postman_request(subscription, "subscription")
                    subscription_items.append({
                        "name": subscription.name,
                        "request": request,
                        "response": []
                    })
                    print(f"Added subscription: {subscription.name}")
                except Exception as e:
                    print(f"[WARNING] Failed to create subscription '{subscription.name}': {str(e)}")
                    continue
            
            if subscription_items:
                folders.append({
                    "name": "subscriptions",
                    "item": subscription_items
                })
        
        print(f"\n[DEBUG] Processed {len(self.parser.queries)} queries")
        print(f"[DEBUG] Processed {len(self.parser.mutations)} mutations")
        print(f"[DEBUG] Processed {len(self.parser.subscriptions)} subscriptions")
        
        return {
            "info": {
                "_postman_id": "auto-generated",
                "name": collection_name,
                "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
                "_exporter_id": "auto"
            },
            "item": folders,
            "variable": [
                {
                    "key": "url",
                    "value": self.endpoint_url,
                    "type": "string"
                }
            ]
        }


def load_graphql_schema(file_path: str) -> str:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"GraphQL schema file '{file_path}' not found")
    except Exception as e:
        raise Exception(f"Failed to read GraphQL schema file: {str(e)}")


def save_postman_collection(collection: Dict[str, Any], output_file: str):
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(collection, f, indent=2, ensure_ascii=False)
    except Exception as e:
        raise Exception(f"Failed to save Postman collection: {str(e)}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python graphql_to_postman.py <schema_file> [output_file] [endpoint_url]")
        print("Example: python graphql_to_postman.py schema.graphql collection.json https://api.example.com/graphql")
        sys.exit(1)
    
    schema_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'graphql_collection.json'
    endpoint_url = sys.argv[3] if len(sys.argv) > 3 else 'https://api.example.com/graphql'
    
    try:
        print(f"[INFO] Loading GraphQL schema from: {schema_file}")
        schema_content = load_graphql_schema(schema_file)
        
        print("[INFO] Parsing GraphQL schema...")
        parser = GraphQLSchemaParser(schema_content)
        
        print(f"[INFO] Found {len(parser.types)} types")
        print(f"[INFO] Found {len(parser.queries)} queries")
        print(f"[INFO] Found {len(parser.mutations)} mutations")
        print(f"[INFO] Found {len(parser.subscriptions)} subscriptions")
        
        print("[INFO] Converting to Postman collection with GraphQL body type...")
        converter = GraphQLToPostmanConverter(parser, endpoint_url)
        collection = converter.create_postman_collection("Postman Collection (from GraphQL)")
        
        print(f"[INFO] Saving collection to: {output_file}")
        save_postman_collection(collection, output_file)
        
        total_requests = sum(len(folder.get('item', [])) for folder in collection['item'])
        print(f"\n[SUCCESS] Conversion completed!")
        print(f"[FOLDERS] Created {len(collection['item'])} folders")
        print(f"[REQUESTS] Generated {total_requests} requests")
        print(f"[OUTPUT] Saved to: {output_file}")
        print(f"[ENDPOINT] Configured for: {endpoint_url}")
        print(f"[BODY TYPE] Using native GraphQL body type")
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()