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

//kind of working

//function renderCollectionHTML(col: APICollection | null): string {
//    if (!col) return '<div>Loading...</div>';

//    // Render a table from a key-value array
//    function renderKeyValueTable(title: string, items: { key: string; value: string }[]): string {
//        const filtered = items.filter(item => item.key && item.value);
//        if (filtered.length === 0) return '';
//        return `
//    <div class="sub-section">
//      <h5>${title}</h5>
//      <table>
//        <thead>
//          <tr><th>Key</th><th>Value</th></tr>
//        </thead>
//        <tbody>
//          ${filtered.map(item => `<tr><td>${item.key}</td><td>${item.value}</td></tr>`).join('')}
//        </tbody>
//      </table>
//    </div>
//  `;
//    }

//    function renderRequest(request: APIRequest): string {
//        const headers = request.headers?.filter(h => h.isSelected !== false && h.key && h.value) || [];
//        const queryParams = request.queryParams?.filter(q => q.isSelected !== false && q.key && q.value) || [];

//        const headersTable = renderKeyValueTable('Headers', headers);
//        const queryParamsTable = renderKeyValueTable('Query Parameters', queryParams);

//        let bodySection = '';
//        if (request.body && request.body.mode !== 'none') {
//            const { mode } = request.body;

//            if (mode === 'raw' && request.body.raw) {
//                bodySection = `
//        <div class="sub-section">
//          <h5>Body (Raw)</h5>
//          <pre>${request.body.raw}</pre>
//        </div>
//      `;
//            } else if (mode === 'formdata' && request.body.formData?.length) {
//                const filtered = request.body.formData.filter(i => i.isSelected !== false && i.key && i.value);
//                if (filtered.length) {
//                    bodySection = renderKeyValueTable('Body (Form Data)', filtered);
//                }
//            } else if (mode === 'urlencoded' && request.body.urlencoded?.length) {
//                const filtered = request.body.urlencoded.filter(i => i.isSelected !== false && i.key && i.value);
//                if (filtered.length) {
//                    bodySection = renderKeyValueTable('Body (Urlencoded)', filtered);
//                }
//            } else if (mode === 'file' && request.body.file && request.body.file.name) {
//                bodySection = `
//        <div class="sub-section">
//          <h5>Body (File)</h5>
//          <p><strong>Name:</strong> ${request.body.file.name}</p>
//          ${request.body.file.src ? `<p><strong>Source:</strong> ${request.body.file.src}</p>` : ''}
//        </div>
//      `;
//            }
//        }

//        return `
//    <div class="request-block">
//      <h4>
//        <span class="request-method method-${request.method}">${request.method}</span>
//        ${request.name}
//      </h4>
//      <p class="url">${request.url}</p>
//      ${headersTable}
//      ${queryParamsTable}
//      ${bodySection}
//    </div>
//  `;
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

//    const htt = `
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
    const dummyval = 'Value'
    if (!col) return '<div>Loading...</div>';
    const colAuthType = col.auth?.type || '';
    let colAuth = '';
    if (colAuthType === '' || colAuthType === 'inheritCollection' || colAuthType === 'none' || colAuthType === 'noAuth') {
        colAuth = `<div class="sub-section">
                  <h5> Authorization (No Authorization) </h5>
                  <div class="kv-container">
                      <div class="kv-item">
                        <div style="color: black"><strong></strong> No Authrization Required </div>
                      </div>
                  </div>
                </div>
              `;
    }
    else if (colAuthType === 'basic') {
        colAuth = `<div class="sub-section">
                  <h5> Authorization (Basic Auth) </h5>
                  <div class="kv-container">
                      <div class="kv-item">
                        <div style="color: black"><strong>User Name:</strong> User </div>
                        <div style="color: black"><strong>Password:</strong> User Password</div>
                      </div>
                  </div>
                </div>
              `;
    }
    else if (colAuthType === 'apiKey') {
        
        colAuth = `<div class="sub-section">
                  <h5> Authorization (API Key) </h5>
                  <div class="kv-container">
                       ${col.auth && Object.entries(col.auth.credentials).map(([key, value]) => `
                            <div class="kv-item">
                            <div style="color: black"><strong>${key}:</strong> ${key === 'value' ? dummyval : value}</div>
                            </div>
                        `).join('')}
                  </div>
                </div>
              `;
    }
    else if (colAuthType === 'bearer') {
        colAuth = `<div class="sub-section">
                  <h5> Authorization (Bearer) </h5>
                  <div class="kv-container">
                       <div style="color: black"><strong>token:</strong> Add Token</div>
                  </div>
                </div>
              `;
    }
    else if (colAuthType === 'oauth2') {

        colAuth = `<div class="sub-section">
                  <h5> Authorization (OAuth 2.0) </h5>
                  <div class="kv-container">
                       ${col.auth && Object.entries(col.auth.credentials).map(([key, value]) => `
                            <div class="kv-item">
                            <div style="color: black"><strong>${key}:</strong> ${value}</div>
                            </div>
                        `).join('')}
                  </div>
                </div>
              `;
    }
    else if (colAuthType === 'oauth1') {

        colAuth = `<div class="sub-section">
                  <h5> Authorization (OAuth 1.0) </h5>
                  <div class="kv-container">
                       ${col.auth && Object.entries(col.auth.credentials).map(([key, value]) => `
                            <div class="kv-item">
                            <div style="color: black"><strong>${key}:</strong> ${value}</div>
                            </div>
                        `).join('')}
                  </div>
                </div>
              `;
    }
    else {
        colAuth = `<div class="sub-section">
                  <h5> Authorization (Inherit From Parent) </h5>
                  <div class="kv-container">
                      <div class="kv-item">
                        <div style="color: black"><strong></strong> This Request Inherit Authorization Form Parent </div>
                      </div>
                  </div>
                </div>
              `;
    }
    function renderKeyValueTable(title: string, items: { key: string; value: string; description?: string }[]): string {
        const filtered = items.filter(item => item.key && item.value);
        if (filtered.length === 0) return '';
        return `
      <div class="sub-section">
        <h5 style="color: black">${title}</h5>
        <table>
          <thead>
            <tr><th style="color: black">Key</th><th style="color: black">Value</th><thstyle="color: black">Description</th></tr>
          </thead>
          <tbody>
            ${filtered.map(item => `
              <tr style="color: black">
                <td style="color: black" >${item.key}</td>
                <td style="color: black">${item.value}</td>
                <td style="color: black">${item.description || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    }
    function renderKeyValueBlock(title: string, items: { key: string; value: string; description?: string }[]): string {
        const filtered = items.filter(item => item.key && item.value);
        if (filtered.length === 0) return '';
        return `
    <div class="sub-section">
      <h5 style="color: black">${title}</h5>
      <div class="kv-container">
        ${filtered.map(item => `
          <div class="kv-item">
            <div style="color: black"><strong>Key:</strong> ${item.key}</div>
            <div style="color: black"><strong>Value:</strong> ${item.value}</div>
            ${item.description ? `<div style="color: black"><strong>Description:</strong> ${item.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
    }

    //function renderAuth(auth?: AuthState): string {
    //    if (!auth) return '';
    //    const rows = Object.entries(auth.credentials)
    //        .map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`)
    //        .join('');
    //    return `
    //  <div class="sub-section">
    //    <h5>Authentication (${auth.type})</h5>
    //    <table>
    //      <thead><tr><th>Key</th><th>Value</th></tr></thead>
    //      <tbody>${rows}</tbody>
    //    </table>
    //  </div>
    //`;
    //}

    function renderRequest(request: APIRequest): string {
        const headers = request.headers?.filter(h => h.isSelected !== false && h.key && h.value) || [];
        const queryParams = request.queryParams?.filter(q => q.key && q.value) || [];

        const headersTable = renderKeyValueBlock('Headers', headers);
        const queryParamsTable = renderKeyValueBlock('Query Parameters', queryParams);
        const requestAuthType = request.auth?.type || '';
        let authSection = ''
        if (requestAuthType === '' || requestAuthType === 'inheritCollection' || requestAuthType === 'none') {
            authSection = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (Inherit From Parent) </h5>
                  <div class="kv-container">
                      <div class="kv-item">
                        <div style="color: black"><strong></strong> This Request Inherit Authorization Form Parent </div>
                      </div>
                  </div>
                </div>
              `;
        }
        else if (requestAuthType === 'noAuth') {
            authSection = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (No Authorization) </h5>
                  <div class="kv-container">
                      <div class="kv-item">
                        <div style="color: black"><strong></strong> No Authrization Required </div>
                      </div>
                  </div>
                </div>
              `;
        }
        else if (requestAuthType === 'basic') {
            authSection = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (Basic Auth) </h5>
                  <div class="kv-container">
                      <div class="kv-item">
                        <div style="color: black"><strong>User Name:</strong> User </div>
                        <div style="color: black"><strong>Password:</strong> User Password </div>
                      </div>
                  </div>
                </div>
              `;
        }
        else if (requestAuthType === 'apiKey') {
            authSection = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (API Key) </h5>
                  <div class="kv-container">
                       ${request.auth && Object.entries(request.auth.credentials).map(([key, value]) => `
                            <div class="kv-item">
                            <div style="color: black"><strong>${key}:</strong> ${key === 'value' ? dummyval : value}</div>
                            </div>
                        `).join('')}
                  </div>
                </div>
              `;
        }
        else if (requestAuthType === 'bearer') {
            authSection = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (Bearer) </h5>
                  <div class="kv-container">
                       <div style="color: black"><strong>token:</strong> Add Token </div>
                  </div>
                </div>
              `;
        }
        else if (colAuthType === 'oauth2') {

            colAuth = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (OAuth 2.0) </h5>
                  <div class="kv-container">
                       ${request.auth && Object.entries(request.auth.credentials).map(([key, value]) => `
                            <div class="kv-item">
                            <div style="color: black"><strong>${key}:</strong> ${value}</div>
                            </div>
                        `).join('')}
                  </div>
                </div>
              `;
        }
        else if (colAuthType === 'oauth1') {

            colAuth = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (OAuth 1.0) </h5>
                  <div class="kv-container">
                       ${request.auth && Object.entries(request.auth.credentials).map(([key, value]) => `
                            <div class="kv-item">
                            <div style="color: black"><strong>${key}:</strong> ${value}</div>
                            </div>
                        `).join('')}
                  </div>
                </div>
              `;
        }
        else {
            authSection = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (Inherit From Parent) </h5>
                  <div class="kv-container">
                      <div class="kv-item">
                        <div style="color: black"><strong></strong> This Request Inherit Authorization Form Parent </div>
                      </div>
                  </div>
                </div>
              `;
        }
        
        let bodySection = '';
        if (request.body && request.body.mode !== 'none') {
            const { mode } = request.body;

            if (mode === 'raw' && request.body.raw) {
                bodySection = `
                    <div class="sub-section">
                        <h5 style="color: black">Body (Raw)</h5>
                        <pre style="color: black">${request.body.raw}</pre>
                    </div>
                    `;
            } else if (mode === 'formdata' && request.body.formData?.length) {
                const filtered = request.body.formData.filter(i => i.isSelected !== false && i.key && i.value);
                if (filtered.length) {
                    bodySection = `
                                <div class="sub-section">
                                <h5 style="color: black">Body (Form Data)</h5>
                                <table>
                                    <thead>
                                    <tr><th style="color: black">Key</th><th style="color: black">Value</th><th style="color: black">Description</th></tr>
                                    </thead>
                                    <tbody>
                                    ${filtered.map(item => `
                                        <tr>
                                        <td style="color: black">${item.key}</td>
                                        <td style="color: black">${item.src || ''}</td>
                                        </tr>
                                    `).join('')}
                                    </tbody>
                                </table>
                                </div>
                            `;
                }
            } else if (mode === 'urlencoded' && request.body.urlencoded?.length) {
                const filtered = request.body.urlencoded.filter(i => i.isSelected !== false && i.key && i.value);
                if (filtered.length) {
                    bodySection = renderKeyValueTable('Body (Urlencoded)', filtered);
                }
            } else if (mode === 'file' && request.body.file && request.body.file.name) {
                bodySection = `
                        <div class="sub-section">
                          <h5 style="color: black">Body (File)</h5>
                          <p style="color: black"><strong>Name:</strong> ${request.body.file.name}</p>
                          ${request.body.file.src ? `<p style="color: black"><strong>Source:</strong> ${request.body.file.src}</p>` : ''}
                        </div>
                      `;
            }
            else if (mode === 'graphql' && request.body.graphql) {
                bodySection = `
                    <div class="sub-section">
                        <h5 style="color: black">Body (GraphQL)</h5>
                        <pre style="color: black">${request.body.graphql?.query}</pre>
                        <pre style="color: black">${request.body.graphql?.variables}</pre>
                    </div>
                    `
            }
        }

        const responseSection = request.response?.length
            ? `
        <div class="sub-section">
          <h5 style="color: black">Responses</h5>
          ${request.response.map(r => `
            <div style="margin-bottom: 12px;">
              <p style="color: black"><strong>Status:</strong> ${r.status} (${r.code})</p>
              <pre style="color: black">${r.body}</pre>
            </div>
          `).join('')}
        </div>
      ` : '';

        return `
      <div class="request-block">
        <h4>
          <span style="color: black" class="request-method method-${request.method}">${request.method}</span>
          ${request.name}
        </h4>
        <p style="color: black" class="url">${request.url}</p>
        ${authSection}
        ${headersTable}
        ${queryParamsTable}
        ${bodySection}
        ${responseSection}
      </div>
    `;
    }

    function renderFolder(folder: APIFolder): string {
        const folderAuthType = folder.auth?.type || '';
        let folderAuth = '';
        if (folderAuthType === '' || folderAuthType === 'inheritCollection' || folderAuthType === 'none') {
            folderAuth = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (Inherit From Parent) </h5>
                  <div class="kv-container">
                      <div class="kv-item">
                        <div style="color: black"><strong></strong> This Folder Inherit Authorization Form Parent </div>
                      </div>
                  </div>
                </div>
              `;
        }
        else if (folderAuthType === 'noAuth') {
            folderAuth = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (No Authorization) </h5>
                  <div class="kv-container">
                      <div class="kv-item">
                        <div style="color: black"><strong></strong> No Authrization Required </div>
                      </div>
                  </div>
                </div>
              `;
        }
        else if (folderAuthType === 'basic') {
            folderAuth = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (Basic Auth) </h5>
                  <div class="kv-container">
                      <div class="kv-item">
                        <div style="color: black"><strong>User Name:</strong> User </div>
                        <div style="color: black"><strong>Password:</strong> User Password </div>
                      </div>
                  </div>
                </div>
              `;
        }
        else if (folderAuthType === 'apiKey') {
            folderAuth = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (API Key) </h5>
                  <div class="kv-container">
                       ${folder.auth && Object.entries(folder.auth.credentials).map(([key, value]) => `
                            <div class="kv-item">
                            <div style="color: black"><strong>${key}:</strong> ${key === 'value' ? dummyval : value}</div>
                            </div>
                        `).join('')}
                  </div>
                </div>
              `;
        }
        else if (folderAuthType === 'bearer') {
            folderAuth = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (Bearer) </h5>
                  <div class="kv-container">
                       <div style="color: black"><strong>token:</strong> Add token </div>
                  </div>
                </div>
              `;
        }
        else if (colAuthType === 'oauth2') {

            colAuth = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (OAuth 2.0) </h5>
                  <div class="kv-container">
                       ${folder.auth && Object.entries(folder.auth.credentials).map(([key, value]) => `
                            <div class="kv-item">
                            <div style="color: black"><strong>${key}:</strong> ${value}</div>
                            </div>
                        `).join('')}
                  </div>
                </div>
              `;
        }
        else if (colAuthType === 'oauth1') {

            colAuth = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (OAuth 1.0) </h5>
                  <div class="kv-container">
                       ${folder.auth && Object.entries(folder.auth.credentials).map(([key, value]) => `
                            <div class="kv-item">
                            <div style="color: black"><strong>${key}:</strong> ${value}</div>
                            </div>
                        `).join('')}
                  </div>
                </div>
              `;
        }
        else {
            folderAuth = `<div class="sub-section">
                  <h5 style="color: black"> Authorization (Inherit From Parent) </h5>
                  <div class="kv-container">
                      <div class="kv-item">
                        <div style="color:black"><strong>Inherit:</strong> This Request Inherit Authorization Form Parent </div>
                      </div>
                  </div>
                </div>
              `;
        }
        const folderHeader = `
        <div class="folder-block" style="color: black">
          <h3 style="color: black">📁 ${folder.name}</h3>
          ${folder.description ? `<p class="description" style="color: black">${folder.description}</p>` : ''}
          ${folderAuth}
      `;

        const nestedFolders = folder.folders && folder.folders.length
            ? folder.folders.map(renderFolder).join('')
            : '';

        const folderRequests = folder.requests && folder.requests.length
            ? folder.requests.map(renderRequest).join('')
            : '';

        return `
        <div class="section" style="color: black">
          ${folderHeader}
          ${nestedFolders}
          ${folderRequests}
        </div>
      `;
    }

    const renderedFolders = col.folders && col.folders.length
        ? col.folders.map(renderFolder).join('')
        : '<p style="color: black">No folders available.</p>';

    const renderedRequests = col.requests && col.requests.length
        ? col.requests.map(renderRequest).join('')
        : '<p style="color: black">No standalone requests available.</p>';

    return `
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow-y: auto;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #fff;
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
        color:rgb(0, 0, 0);
      }
      h2 {
        margin-top: 40px;
        border-bottom: 2px solidrgb(0, 0, 0);
        padding-bottom: 6px;
        color: rgb(0, 0, 0);
      }
      h3 {
        margin-top: 24px;
        font-size: 1.3em;
        color:rgb(0, 0, 0);
      }
      h4 {
        margin: 16px 0 4px;
        font-size: 1.1em;
        color:rgb(0, 0, 0);
      }
      h5 {
        margin: 12px 0 4px;
        font-size: 1em;
        color: #555;
      }
      p{
        color: rgb(0, 0, 0);
      }
      strong{
        color: rgb(0, 0, 0);
      }
      .description {
        color: #555;
        font-style: italic;
        margin-bottom: 8px;
      }
      .url {
        font-family: monospace;
        color:rgb(0, 0, 0);
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
      .method-PATCH { background-color: #9b59b6; }
      .method-OPTIONS { background-color: #16a085; }
      .method-HEAD { background-color: #7f8c8d; }
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
      .kv-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .kv-item {
          padding: 10px;
          border: 1px solid #ddd;
          background:rgb(255, 255, 255);
          border-radius: 6px;
          line-height: 1.5;
          colour: rgb(0, 0, 0);
        }
      .titlecol{
        color: var(--primary-color);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
      }
      th, td, tr {
        border: 1px solid #ddd;
        padding: 8px 10px;
        text-align: left;
        color: rgb(0, 0, 0);
      }
      th {
        background-color:rgb(255, 255, 255);
        color: rgb(0, 0, 0);
      }
      t
      .sub-section {
        margin-top: 12px;
      }
      pre {
        background:rgb(255, 255, 255);
        padding: 10px;
        border: 1px solid #ddd;
        overflow-x: auto;
      }
    </style>
    <body>
      <div id="container">
        <h1>${col.name}</h1>
        <p class="description">${col.description || ''}</p>
        ${colAuth}

        <div class="section">
          <h2>Variables</h2>
          ${col.variables && col.variables.length ? `
            <table>
              <thead>
                <tr><th>Name</th><th>Value</th></tr>
              </thead>
              <tbody>
                ${col.variables.map(v => `<tr><td>${v.name}</td><td>${v.currentValue ?? v.initialValue ?? ''}</td></tr>`).join('')}
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
        <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 className='titlecol'>{tabState.title}</h2>
            <div style={{ margin: '16px 0' }}>
                <button onClick={handleExport}>Export as {exportType.toUpperCase()}</button>
                <select value={exportType} onChange={e => setExportType(e.target.value as 'pdf' | 'html')}>
                    <option value="pdf">PDF</option>
                    <option value="html">HTML</option>
                </select>
            </div>
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    border: '1px solid #eee',
                    borderRadius: 8,
                    background: '#fff',
                    padding: 16,
                }}
            >
                {/* Render documentation content here */}
                <div dangerouslySetInnerHTML={{ __html: renderCollectionHTML(collection) }} />
            </div>
        </div>
    );
};

export default DocumentationPane;