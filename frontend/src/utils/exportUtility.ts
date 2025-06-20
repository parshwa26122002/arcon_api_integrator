import type { APICollection, ExportCollection, ExportKeyValueType, ExportAuth, ExportCollectionItem, APIFolder, APIRequest, Variable, Info, ExportKeyValueWithDescription, URLExport, ExportBody, ResponseExport, URLConversionExport } from '../store/collectionStore';
import { storageService } from '../services/StorageService';
import html2pdf from 'html2pdf.js';
function convertVariables(variables?: Variable[]): ExportKeyValueType[] | undefined {
    if (!variables) return undefined;
    return variables.map(v => ({
        key: v.name,
        value: v.currentValue ?? v.initialValue ?? '',
        type: 'string'
    }));
}
export function convertURLToExport(url: string, variables: Variable[]): URLConversionExport {
    if (variables.length > 0) {
        const filteredVars = Array.isArray(variables)
            ? variables.filter(v => v.name && v.name.trim() !== '')
            : [];
        console.log("variables", variables);
        console.log("filter", filteredVars);
        // Replace all variable references in the form {{varName}} with currentValue
        let raw = url;
        for (const variable of filteredVars) {
            const pattern = new RegExp(`{{\\s*${variable.name}\\s*}}`, 'g');
            console.log("filter", pattern);
            raw = raw.replace(pattern, variable.currentValue ?? variable.initialValue ?? '');
            console.log("raw", raw);
        }
        //const raw = convertedParts.join('/');
        try {
            const parsed = new URL(raw);
            const urlEx: URLConversionExport = {
                raw,
                protocol: parsed.protocol.replace(':', ''),
                host: parsed.hostname.split('.'),
                port: parsed.port || '',
                path: parsed.pathname.split('/').filter(Boolean),
            };
            return urlEx;
        } catch (error) {
            // If the URL is invalid, return minimal info
            const slashIndex = raw.indexOf('/');
            let hostPart = '';
            let pathPart = '';
            let port = '';
            let protocol = '';
            const protocolMatch = raw.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\//);
            if (protocolMatch) {
                protocol = protocolMatch[1];
            }
            if (slashIndex !== -1) {
                hostPart = raw.slice(0, slashIndex);
                pathPart = raw.slice(slashIndex + 1);
            } else {
                hostPart = raw;
            }
            if (pathPart != '') {
                const slashIndex2 = pathPart.indexOf('?');
                if (slashIndex2 != -1) {
                    pathPart = pathPart.slice(0, slashIndex2);
                }
            }
            if (hostPart) {
                const portMatch = hostPart.match(/:(\d+)$/);
                if (portMatch) {
                    port = portMatch[1];
                    hostPart = hostPart.slice(0, -portMatch[1].length);
                }
            }
            const url2: URLConversionExport = {
                raw,
                port: port == '' ? '' : undefined,
                protocol: protocol || undefined,
                host: hostPart ? hostPart.split('.') : [],
                path: pathPart ? pathPart.split('/').filter(Boolean) : []
            }
            return url2;
            console.log("Exception exportUtility convertURLToExport", error);
        }
    }
    else {
        const raw = url;
        try {
            const parsed = new URL(raw);
            const urlEx2: URLConversionExport = {
                raw,
                protocol: parsed.protocol.replace(':', ''),
                host: parsed.hostname.split('.'),
                port: parsed.port || '',
                path: parsed.pathname.split('/').filter(Boolean),
            };
            return urlEx2;
        } catch (error) {
            // If the URL is invalid, return minimal info
            const slashIndex = raw.indexOf('/');
            let hostPart = '';
            let pathPart = '';
            let port = '';
            let protocol = '';
            const protocolMatch = raw.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\//);
            if (protocolMatch) {
                protocol = protocolMatch[1];
            }
            if (slashIndex !== -1) {
                hostPart = raw.slice(0, slashIndex);
                pathPart = raw.slice(slashIndex + 1);
            } else {
                hostPart = raw;
            }
            if (pathPart != '') {
                const slashIndex2 = pathPart.indexOf('?');
                if (slashIndex2 != -1) {
                    pathPart = pathPart.slice(0, slashIndex2);
                }
            }
            if (hostPart) {
                const portMatch = hostPart.match(/:(\d+)$/);
                if (portMatch) {
                    port = portMatch[1];
                    hostPart = hostPart.slice(0, -portMatch[1].length);
                }
            }
            const urlEX3: URLConversionExport = {
                raw,
                port: port == '' ? '' : undefined,
                protocol: protocol || undefined,
                host: hostPart ? hostPart.split('.') : [],
                path: pathPart ? pathPart.split('/').filter(Boolean) : []
            }
            return urlEX3;
            console.log("Exception exportUtility convertURLToExport", error);
        }
    }
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
    if (auth.type == 'oauth2') {
        const credentialsArray: ExportKeyValueType[] = Object.entries(auth.credentials).map(([key, value]) => ({
            key: key,
            value: value,
            type: 'string'
        }));
        return { type: auth.type, oauth2: credentialsArray }
    }
    if (auth.type == 'oauth1') {
        const credentialsArray: ExportKeyValueType[] = Object.entries(auth.credentials).map(([key, value]) => ({
            key: key,
            value: value,
            type: 'string'
        }));
        return { type: auth.type, oauth1: credentialsArray }
    }

    return { type: auth.type };
}
function convertRequest(request: APIRequest, variables: Variable[]): ExportCollectionItem {
    const query: ExportKeyValueWithDescription[] = (request.queryParams || []).map(q => ({
        key: q.key,
        value: q.value,
        description: q.description
    }));
    const convertedURLForExport: URLConversionExport = convertURLToExport(request.url, variables);
    //const parsedUrl = new URL(request.url);
    //const hostname = parsedUrl.hostname; // e.g. "example.domain.com"
    const url: URLExport = {
        raw: convertedURLForExport.raw,
        protocol: convertedURLForExport.protocol,
        host: convertedURLForExport.host,
        port: convertedURLForExport.port || '',
        path: convertedURLForExport.path ? convertedURLForExport.path.filter(Boolean) : [],
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
        else if (request.body.mode == 'formdata') {
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
        else if (request.body.mode == 'graphql') {
            body = {
                mode: 'graphql',
                graphql: {
                    query: request.body.graphql?.query || '',
                    variables: request.body.graphql?.variables || ''
                }
            };
        }
    }
    const response: ResponseExport[] = (request.response || []).map(r => ({
        originalRequest: {
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
        status: r.status,
        code: r.code,
    }));
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
        response
    };
}

function convertFolder(folder: APIFolder, variables: Variable[]): ExportCollectionItem {
    return {
        name: folder.name,
        description: folder.description,
        item: [
            ...(folder.folders?.map(folder => convertFolder(folder, variables ?? [])) ?? []),
            ...(folder.requests?.map(request => convertRequest(request, variables ?? [])) ?? [])
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
            ...(api.folders?.map(folder => convertFolder(folder, api.variables ?? [])) ?? []),
            ...(api.requests?.map(request => convertRequest(request, api.variables ?? [])) ?? [])
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

    if (typeof window !== 'undefined' && window.electron !== undefined) {
        window.electron.saveExportFile(json, filename, 'json');
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

    if (typeof window !== 'undefined' && window.electron !== undefined) {
        window.electron.saveExportFile(html, filename, 'html');
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
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result?.toString().split(',')[1];
            if (base64) resolve(base64);
            else reject('Failed to convert blob to base64');
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export async function exportAsPDF(title: string, content: string) {
    const filename = `${title}.pdf`;
    //const html = `<html><head><title>${title}</title></head><body>${content}</body></html>`;
    const container = document.createElement('div');
    container.innerHTML = content;
    document.body.appendChild(container); // Ensure it's in DOM

    if (typeof window !== 'undefined' && window.electron !== undefined) {
        const pdfBlob: Blob = await html2pdf().from(container).set({
            filename: filename,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        }).outputPdf('blob');
        document.body.removeChild(container);

        // Convert Blob to base64
        const base64 = await blobToBase64(pdfBlob);

        // Send to Electron
        window.electron?.savepdfBlob(base64, `${title}.pdf`);
        //window.electron.saveExportFile(html, filename, 'pdf'); //change this to the correct method for saving PDF in your Electron app
        //return;
    }
    else {
        html2pdf()
            .from(container)
            .set({
                filename: filename,
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            })
            .save()
            .then(() => document.body.removeChild(container));
    }
    
    // Web fallback: open print dialog
    //const printWindow = window.open('', '_blank');
    //if (printWindow) {
    //    printWindow.document.write(`<html><head><title>${title}</title></head><body>${content}</body></html>`);
    //    printWindow.document.close();
    //    printWindow.print();
    //}
}