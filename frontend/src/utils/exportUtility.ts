import type { APICollection, ExportCollection, ExportKeyValueType, ExportAuth, ExportCollectionItem, APIFolder, APIRequest, Variable, Info, ExportKeyValueWithDescription, URLExport, ExportBody } from '../store/collectionStore';
import { storageService } from '../services/StorageService';
function convertVariables(variables?: Variable[]): ExportKeyValueType[] | undefined {
    if (!variables) return undefined;
    return variables.map(v => ({
        key: v.name,
        value: v.varValue ?? '',
        type: 'string'
    }));
}

function convertAuth(auth?: { type: string; credentials: Record<string, string> }): ExportAuth {
    if (!auth || !auth.type || auth.type == 'none' || Object.keys(auth).length === 0) return { type: 'noauth' };

    if (auth.type == 'basic') {
        const credentialsArray: ExportKeyValueType[] = Object.entries(auth.credentials).map(([key, value]) => ({
            key: key,
            value: value,
            type: 'string'
        }));
        return { type: auth.type, basic: credentialsArray }
    }
    if (auth.type == 'bearer') {
        const credentialsArray: ExportKeyValueType[] = [
            {
                key: 'token',
                value: auth.credentials?.token || '',
                type: 'string'
            }
        ];

        return { type: auth.type, bearer: credentialsArray }
    }
    if (auth.type == 'apiKey') {
        const credentialsArray: ExportKeyValueType[] = Object.entries(auth.credentials).map(([key, value]) => ({
            key: key,
            value: value,
            type: 'string'
        }));
        return { type: auth.type, apikey: credentialsArray }
    }

    return { type: auth.type };
}
function extractHostParts(url: string): string[] {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname; // e.g. "example.domain.com"
        return hostname.split('.');
    } catch (error) {
        console.warn(`Invalid URL provided: "${url}". Error:`, error);
        return [];
    }
}
function convertRequest(request: APIRequest): ExportCollectionItem {
    const query: ExportKeyValueWithDescription[] = (request.queryParams || []).map(q => ({
        key: q.key,
        value: q.value,
        description: q.description
    }));
    const url: URLExport = {
        raw: request.url,
        protocol: request.url.split(':')[0] || '',
        host: extractHostParts(request.url),
    }
    if (query && query.length > 0) {
        url.query = query;
    }
    let body: ExportBody | undefined = undefined;
    if (request.body) {
        if (request.body.mode === 'raw') {
            body = {
                mode: 'raw',
                raw: request.body.raw ?? "",
                options: request.body.options && request.body.options.raw
                    ? { raw: request.body.options.raw }
                    : { raw: { language: 'json' } }
            };
        }
        else if (request.body.mode == 'form-data') {
            body = {
                mode: 'formdata',
                formdata: (request.body.formData || []).map(f => ({
                    key: f.key,
                    value: f.value,
                    type: f.type || 'text',
                    src: f.src
                }))
            };
        }
        else if (request.body.mode == 'urlencoded') {
            body = {
                mode: 'urlencoded',
                urlencoded: (request.body.urlencoded || []).map(u => ({
                    key: u.key,
                    value: u.value,
                    type: 'text'
                }))
            };
        }
        else if (request.body.mode == 'file') {
            body = {
                mode: 'file',
                file: {
                    src: request.body.file?.src || ''
                }
            };
        }
    }
    return {
        name: request.name,
        request: {
            method: request.method,
            header: (request.headers || []).map(h => ({
                key: h.key,
                value: h.value,
                type: 'text',
                description: h.description
            })),
            url,
            auth: convertAuth(request.auth),
            body
        },
        response: []
    };
}

function convertFolder(folder: APIFolder): ExportCollectionItem {
    return {
        name: folder.name,
        description: folder.description,
        item: [
            ...(folder.folders?.map(convertFolder) ?? []),
            ...(folder.requests?.map(convertRequest) ?? [])
        ],
        auth: convertAuth(folder.auth)
    };
}

function convertAPICollectionToExportCollection(api: APICollection): ExportCollection {
    const info: Info = {
        _postman_id: api.id,
        name: api.name,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json', // Set as needed
        _exporter_id: '43322675' // Set as needed
    };
    if (api.description && api.description.trim() !== '') {
        info.description = api.description;
    }
    const variable: ExportKeyValueType[] | undefined = convertVariables(api.variables);
    const exportCollection: ExportCollection = {
        info,
        item: [
            ...(api.folders?.map(convertFolder) ?? []),
            ...(api.requests?.map(convertRequest) ?? [])
        ],
        auth: convertAuth(api.auth),
    }
    if (variable && variable.length != 0) {
        exportCollection.variable = variable;
    }
    return exportCollection;

}
export async function exportCollectionAsJson(id: string) {
    await storageService.initialize();
    const apiCollection: APICollection | null = await storageService.getCollectionByID(id);
    if (!apiCollection) {
        return;
    }
    const exportObj = convertAPICollectionToExportCollection(apiCollection);
    const json = JSON.stringify(exportObj, null, 2);
    const filename = `${exportObj.info.name || 'collection'}.json`;

    if (typeof window !== 'undefined' && window.electron) {
        window.electron.saveJsonFile(json, filename);
        return;
    }

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}


export function exportAsHTML(title: string, content: string) {
    const html = `<html><head><title>${title}</title></head><body>${content}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const filename = `${title}.html`;

    if (typeof window !== 'undefined' && window.electron && typeof window.electron.saveJsonFile === 'function') {
        window.electron.saveJsonFile(html, filename);
        return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

export function exportAsPDF(title: string, content: string) {
    if (typeof window !== 'undefined' && window.electron && typeof window.electron.saveJsonFile === 'function') {
        window.electron.saveJsonFile(title, content); //change this to the correct method for saving PDF in your Electron app
        return;
    }
    // Web fallback: open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`<html><head><title>${title}</title></head><body>${content}</body></html>`);
        printWindow.document.close();
        printWindow.print();
    }
}