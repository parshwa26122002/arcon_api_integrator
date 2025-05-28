export interface Variable {
    id: string;
    name: string;
    initialValue: string;
    currentValue: string;
    isSelected: boolean;
}

export interface APICollection {
    id: string;
    name: string;
    description?: string;
    auth?: AuthState;
    variables?: Variable[];
    requests: APIRequest[];
}

export interface Request {
    id: string;
    name: string;
}

export interface AuthState {
    type: string;
    credentials: Record<string, string>;
}

export interface APIRequest {
    id: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers: Header[];
    queryParams: QueryParam[];
    body?: RequestBody;
    contentType: string;
    formData: Array<{ key: string; value: string }>;
    auth: AuthState;
}

export interface Header {
    id: string;
    key: string;
    value: string;
    description?: string;
    isSelected?: boolean;
}

export interface QueryParam {
    id: string;
    key: string;
    value: string;
    description?: string;
    isSelected?: boolean;
}

export interface RequestBody {
    mode: 'none' | 'raw' | 'form-data' | 'file' | 'urlencoded';
    raw?: string;
    options?: {
        raw?: {
            language: 'json' | 'html' | 'xml' | 'text' | 'javascript'
        }
    }
    formData?: FormDataItem[];
    urlencoded?: UrlEncodedItem[];
    file?: FileBody;
}

export interface FormDataItem {
    key: string;
    value: string;
    type: 'text' | 'file';
    src?: string;
    isSelected?: boolean;
}

export interface UrlEncodedItem {
    key: string;
    value: string;
    isSelected?: boolean;
}

export interface FileBody {
    name: string;
    content: string;
    src?: string;
}
