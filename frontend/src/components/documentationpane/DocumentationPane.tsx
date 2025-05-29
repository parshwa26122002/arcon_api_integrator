import React, { useState, useEffect } from 'react';
import { exportAsHTML, exportAsPDF } from '../../utils/exportUtility';
import { storageService } from '../../services/StorageService';
import type { APICollection, APIRequest, APIFolder } from '../../store/collectionStore';

interface DocumentationPaneProps {
    tabState: {
        title: string;
        content: string;
        collectionId: string;
    };
}
//function renderCollectionHTML(col: APICollection | null): string {
//    if (!col) return '<div>Loading...</div>';
//    return `
//        <div style="font-family: sans-serif; color: #222;">
//            <h1>${col.name}</h1>
//            <p>${col.description || ''}</p>
//            <h2>Variables</h2>
//            <ul>
//                ${(col.variables || []).map(v => `<li><b>${v.name}</b>: ${v.varValue}</li>`).join('')}
//            </ul>
//            <h2>Requests</h2>
//            <ul>
//                ${(col.requests || []).map(r => `
//                    <li>
//                        <b>${r.name}</b> [${r.method}]<br/>
//                        <span style="color: #555;">${r.url}</span>
//                    </li>
//                `).join('')}
//            </ul>
//            <h2>Folders</h2>
//            <ul>
//                ${(col.folders || []).map(f => `<li><b>${f.name}</b>: ${f.description || ''}</li>`).join('')}
//            </ul>
//        </div>
//    `;
//}



//imp kind of working
//function renderCollectionHTML(col: APICollection | null): string {
//    if (!col) return '<div>Loading...</div>';

//    // Render a table from a key-value array
//    function renderKeyValueTable(title: string, items: { key: string; value: string }[]): string {
//        if (!items || items.length === 0) return '';
//        return `
//      <div class="sub-section">
//        <h5>${title}</h5>
//        <table>
//          <thead>
//            <tr><th>Key</th><th>Value</th></tr>
//          </thead>
//          <tbody>
//            ${items.map(item => `<tr><td>${item.key}</td><td>${item.value}</td></tr>`).join('')}
//          </tbody>
//        </table>
//      </div>
//    `;
//    }

//    // Render an API request
//    function renderRequest(request: APIRequest): string {
//        // Format headers and query params for table view
//        const headersTable = renderKeyValueTable('Headers', request.headers.map(h => ({ key: h.key, value: h.value })));
//        const queryParamsTable = renderKeyValueTable('Query Parameters', request.queryParams.map(q => ({ key: q.key, value: q.value })));

//        // Render body (only handling a few modes for display purposes)
//        let bodySection = '';
//        if (request.body && request.body.mode !== 'none') {
//            if (request.body.mode === 'raw' && request.body.raw) {
//                bodySection = `
//          <div class="sub-section">
//            <h5>Body (Raw)</h5>
//            <pre>${request.body.raw}</pre>
//          </div>
//        `;
//            } else if (request.body.mode === 'form-data' && request.body.formData && request.body.formData.length) {
//                bodySection = renderKeyValueTable('Body (Form Data)', request.body.formData);
//            } else if (request.body.mode === 'urlencoded' && request.body.urlencoded && request.body.urlencoded.length) {
//                bodySection = renderKeyValueTable('Body (Urlencoded)', request.body.urlencoded);
//            }
//            // For file mode or others you can add additional handling if needed
//        }

//        return `
//      <div class="request-block">
//        <h4>
//          <span class="request-method method-${request.method}">${request.method}</span>
//          ${request.name}
//        </h4>
//        <p class="url">${request.url}</p>
//        ${headersTable}
//        ${queryParamsTable}
//        ${bodySection}
//      </div>
//    `;
//    }

//    // Recursively render a folder and its content
//    function renderFolder(folder: APIFolder): string {
//        const folderHeader = `
//      <div class="folder-block">
//        <h3>📁 ${folder.name}</h3>
//        ${folder.description ? `<p class="description">${folder.description}</p>` : ''}
//    `;

//        // Render nested folders (if any) and requests inside this folder
//        const nestedFolders = folder.folders && folder.folders.length
//            ? folder.folders.map(renderFolder).join('')
//            : '';

//        const folderRequests = folder.requests && folder.requests.length
//            ? folder.requests.map(renderRequest).join('')
//            : '';

//        return `
//      <div class="section">
//        ${folderHeader}
//        ${nestedFolders}
//        ${folderRequests}
//      </div>
//    `;
//    }

//    // Render the top-level folders and requests.
//    const renderedFolders = col.folders && col.folders.length
//        ? col.folders.map(renderFolder).join('')
//        : '<p>No folders available.</p>';

//    const renderedRequests = col.requests && col.requests.length
//        ? col.requests.map(renderRequest).join('')
//        : '<p>No standalone requests available.</p>';

//    return `
//    <style>
//      html, body {
//        margin: 0;
//        padding: 0;
//        height: 100%;
//        overflow-y: auto;
//        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//        background-color: #fff;
//        color: #2c3e50;
//        line-height: 1.6;
//      }
//      #container {
//        padding: 32px;
//        max-width: 900px;
//        margin: auto;
//      }
//      h1 {
//        font-size: 2em;
//        margin-bottom: 8px;
//      }
//      h2 {
//        margin-top: 40px;
//        border-bottom: 2px solid #eaeaea;
//        padding-bottom: 6px;
//        color: #333;
//      }
//      h3 {
//        margin-top: 24px;
//        font-size: 1.3em;
//        color: #34495e;
//      }
//      h4 {
//        margin: 16px 0 4px;
//        font-size: 1.1em;
//      }
//      h5 {
//        margin: 12px 0 4px;
//        font-size: 1em;
//        color: #555;
//      }
//      .description {
//        color: #555;
//        font-style: italic;
//        margin-bottom: 8px;
//      }
//      .url {
//        font-family: monospace;
//        color: #7f8c8d;
//      }
//      .request-method {
//        font-weight: bold;
//        color: #fff;
//        padding: 2px 8px;
//        border-radius: 4px;
//        font-size: 0.9em;
//        display: inline-block;
//        margin-right: 8px;
//      }
//      .method-GET { background-color: #2ecc71; }
//      .method-POST { background-color: #3498db; }
//      .method-PUT { background-color: #f39c12; }
//      .method-DELETE { background-color: #e74c3c; }
//      .section {
//        margin-top: 32px;
//        padding-top: 16px;
//        border-top: 1px solid #eee;
//      }
//      .request-block {
//        margin-bottom: 24px;
//      }
//      .folder-block {
//        margin-bottom: 16px;
//      }
//      table {
//        width: 100%;
//        border-collapse: collapse;
//        margin: 12px 0;
//      }
//      th, td {
//        border: 1px solid #ddd;
//        padding: 8px 10px;
//        text-align: left;
//      }
//      th {
//        background-color: #f9f9f9;
//      }
//      .sub-section {
//        margin-top: 12px;
//      }
//      pre {
//        background: #f6f8fa;
//        padding: 10px;
//        border: 1px solid #ddd;
//        overflow-x: auto;
//      }
//    </style>
//    <body>
//      <div id="container">
//        <h1>${col.name}</h1>
//        <p class="description">${col.description || ''}</p>

//        <div class="section">
//          <h2>Variables</h2>
//          ${col.variables && col.variables.length ? `
//            <table>
//              <thead>
//                <tr><th>Name</th><th>Value</th></tr>
//              </thead>
//              <tbody>
//                ${col.variables.map(v => `<tr><td>${v.name}</td><td>${v.varValue}</td></tr>`).join('')}
//              </tbody>
//            </table>
//          ` : '<p>No variables defined.</p>'}
//        </div>

//        <div class="section">
//          <h2>Folders</h2>
//          ${renderedFolders}
//        </div>

//        <div class="section">
//          <h2>Standalone Requests</h2>
//          ${renderedRequests}
//        </div>
//      </div>
//    </body>
//  `;
//}


function renderCollectionHTML(col: APICollection | null): string {
    if (!col) return '<div>Loading...</div>';

    // Render a table from a key-value array
    function renderKeyValueTable(title: string, items: { key: string; value: string }[]): string {
        const filtered = items.filter(item => item.key && item.value);
        if (filtered.length === 0) return '';
        return `
    <div class="sub-section">
      <h5>${title}</h5>
      <table>
        <thead>
          <tr><th>Key</th><th>Value</th></tr>
        </thead>
        <tbody>
          ${filtered.map(item => `<tr><td>${item.key}</td><td>${item.value}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
    }

    function renderRequest(request: APIRequest): string {
        const headers = request.headers?.filter(h => h.isSelected !== false && h.key && h.value) || [];
        const queryParams = request.queryParams?.filter(q => q.isSelected !== false && q.key && q.value) || [];

        const headersTable = renderKeyValueTable('Headers', headers);
        const queryParamsTable = renderKeyValueTable('Query Parameters', queryParams);

        let bodySection = '';
        if (request.body && request.body.mode !== 'none') {
            const { mode } = request.body;

            if (mode === 'raw' && request.body.raw) {
                bodySection = `
        <div class="sub-section">
          <h5>Body (Raw)</h5>
          <pre>${request.body.raw}</pre>
        </div>
      `;
            } else if (mode === 'form-data' && request.body.formData?.length) {
                const filtered = request.body.formData.filter(i => i.isSelected !== false && i.key && i.value);
                if (filtered.length) {
                    bodySection = renderKeyValueTable('Body (Form Data)', filtered);
                }
            } else if (mode === 'urlencoded' && request.body.urlencoded?.length) {
                const filtered = request.body.urlencoded.filter(i => i.isSelected !== false && i.key && i.value);
                if (filtered.length) {
                    bodySection = renderKeyValueTable('Body (Urlencoded)', filtered);
                }
            } else if (mode === 'file' && request.body.file && request.body.file.name) {
                bodySection = `
        <div class="sub-section">
          <h5>Body (File)</h5>
          <p><strong>Name:</strong> ${request.body.file.name}</p>
          ${request.body.file.src ? `<p><strong>Source:</strong> ${request.body.file.src}</p>` : ''}
        </div>
      `;
            }
        }

        return `
    <div class="request-block">
      <h4>
        <span class="request-method method-${request.method}">${request.method}</span>
        ${request.name}
      </h4>
      <p class="url">${request.url}</p>
      ${headersTable}
      ${queryParamsTable}
      ${bodySection}
    </div>
  `;
    }

    // Recursively render a folder and its content
    function renderFolder(folder: APIFolder): string {
        const folderHeader = `
      <div class="folder-block">
        <h3>📁 ${folder.name}</h3>
        ${folder.description ? `<p class="description">${folder.description}</p>` : ''}
    `;

        // Render nested folders (if any) and requests inside this folder
        const nestedFolders = folder.folders && folder.folders.length
            ? folder.folders.map(renderFolder).join('')
            : '';

        const folderRequests = folder.requests && folder.requests.length
            ? folder.requests.map(renderRequest).join('')
            : '';

        return `
      <div class="section">
        ${folderHeader}
        ${nestedFolders}
        ${folderRequests}
      </div>
    `;
    }

    // Render the top-level folders and requests.
    const renderedFolders = col.folders && col.folders.length
        ? col.folders.map(renderFolder).join('')
        : '<p>No folders available.</p>';

    const renderedRequests = col.requests && col.requests.length
        ? col.requests.map(renderRequest).join('')
        : '<p>No standalone requests available.</p>';

    return `
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow-y: auto;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #fff;
        color: #2c3e50;
        line-height: 1.6;
      }
      #container {
        padding: 32px;
        max-width: 900px;
        margin: auto;
      }
      h1 {
        font-size: 2em;
        margin-bottom: 8px;
      }
      h2 {
        margin-top: 40px;
        border-bottom: 2px solid #eaeaea;
        padding-bottom: 6px;
        color: #333;
      }
      h3 {
        margin-top: 24px;
        font-size: 1.3em;
        color: #34495e;
      }
      h4 {
        margin: 16px 0 4px;
        font-size: 1.1em;
      }
      h5 {
        margin: 12px 0 4px;
        font-size: 1em;
        color: #555;
      }
      .description {
        color: #555;
        font-style: italic;
        margin-bottom: 8px;
      }
      .url {
        font-family: monospace;
        color: #7f8c8d;
      }
      .request-method {
        font-weight: bold;
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.9em;
        display: inline-block;
        margin-right: 8px;
      }
      .method-GET { background-color: #2ecc71; }
      .method-POST { background-color: #3498db; }
      .method-PUT { background-color: #f39c12; }
      .method-DELETE { background-color: #e74c3c; }
      .section {
        margin-top: 32px;
        padding-top: 16px;
        border-top: 1px solid #eee;
      }
      .request-block {
        margin-bottom: 24px;
      }
      .folder-block {
        margin-bottom: 16px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px 10px;
        text-align: left;
      }
      th {
        background-color: #f9f9f9;
      }
      .sub-section {
        margin-top: 12px;
      }
      pre {
        background: #f6f8fa;
        padding: 10px;
        border: 1px solid #ddd;
        overflow-x: auto;
      }
    </style>
    <body>
      <div id="container">
        <h1>${col.name}</h1>
        <p class="description">${col.description || ''}</p>

        <div class="section">
          <h2>Variables</h2>
          ${col.variables && col.variables.length ? `
            <table>
              <thead>
                <tr><th>Name</th><th>Value</th></tr>
              </thead>
              <tbody>
                ${col.variables.map(v => `<tr><td>${v.name}</td><td>${v.varValue}</td></tr>`).join('')}
              </tbody>
            </table>
          ` : '<p>No variables defined.</p>'}
        </div>

        <div class="section">
          <h2>Folders</h2>
          ${renderedFolders}
        </div>

        <div class="section">
          <h2>Standalone Requests</h2>
          ${renderedRequests}
        </div>
      </div>
    </body>
  `;
}

const DocumentationPane: React.FC<DocumentationPaneProps> = ({ tabState }) => {
    const [exportType, setExportType] = useState<'pdf' | 'html'>('pdf');
    const [collection, setCollection] = useState<APICollection | null>(null);

    const handleExport = () => {
        const html = renderCollectionHTML(collection);
        if (exportType === 'pdf') {
            exportAsPDF(tabState.title, html);
        } else {
            exportAsHTML(tabState.title, html);
        }
    };
    useEffect(() => {
        async function fetchCollection() {
            const col = await storageService.getCollectionByID(tabState.collectionId);
            setCollection(col);
        }
        fetchCollection();
    }, [tabState.collectionId]);

    return (
        <div style={{ padding: 24 }}>
            <h2>{tabState.title}</h2>
            <div style={{ margin: '16px 0' }}>
                <button onClick={handleExport}>Export as {exportType.toUpperCase()}</button>
                <select value={exportType} onChange={e => setExportType(e.target.value as 'pdf' | 'html')}>
                    <option value="pdf">PDF</option>
                    <option value="html">HTML</option>
                </select>
            </div>
            <div>
                {/* Render documentation content here */}
                <div dangerouslySetInnerHTML={{ __html: renderCollectionHTML(collection) }} />
            </div>
        </div>
    );
};

export default DocumentationPane;