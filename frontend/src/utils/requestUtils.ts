import type { TabBodyType, FormDataItem, UrlEncodedItem } from '../store/collectionStore';

export const convertRequestBodyToTabBody = (requestBody: any): TabBodyType => {
  if (!requestBody) return { mode: 'none' };
  switch (requestBody.mode) {
    case 'raw':
      return {
        mode: 'raw',
        raw: requestBody.raw || '',
        options: {
          raw: {
            language: requestBody.options?.raw?.language || 'json'
          }
        }
      };
    case 'formdata':
      return {
        mode: 'formdata',
        formData: (requestBody.formData || []).map((item: FormDataItem) => ({
          key: item.key || '',
          value: item.value || '',
            type: item.type || 'text',
            src: item.src,
            fileType: item.fileType,
            fileSize: item.fileSize,
            content: item.content
        }))
      };
    case 'urlencoded':
      return {
        mode: 'urlencoded',
        urlencoded: requestBody.urlencoded?.map((item: UrlEncodedItem) => ({
          key: item.key || '',
          value: item.value || ''
        })) || []
      };
    case 'file':
      return requestBody.file?.src ? {
        mode: 'file',
        file: {
          name: requestBody.file.src || '',
          content: requestBody.file.content || '',
          src: requestBody.file.src || ''
        }
      } : { mode: 'none' };
    case 'graphql':
      return {
        mode: 'graphql',
        graphql: {
          query: requestBody.graphql?.query || '',
          variables: requestBody.graphql?.variables || '',
        }
      };
    default:
      return { mode: 'none' };
  }
};

export const convertTabBodyToRequestBody = (tabBody: TabBodyType): any => {
  switch (tabBody.mode) {
    case 'raw':
      return {
        mode: 'raw',
        raw: tabBody.raw || '',
        options: {
          raw: { language: tabBody.options?.raw?.language || 'json' }
        }
      };
    case 'formdata':
      return {
        mode: 'formdata',
        formData: tabBody.formData?.map((item: FormDataItem) => ({
          key: item.key,
          value: item.value,
            type: item.type,
            src: item.src,
            fileType: item.fileType,
            fileSize: item.fileSize,
            content: item.content
        }))
      };
    case 'urlencoded':
      return {
        mode: 'urlencoded',
        urlencoded: tabBody.urlencoded?.map((item: UrlEncodedItem) => ({
          key: item.key,
          value: item.value,
          type: 'text'
        }))
      };
    case 'file':
      return {
        mode: 'file',
        file: {
            src: tabBody.file?.name || '',
            content: tabBody.file?.content || '',
            name: tabBody.file?.name || ''
        }
      };
    case 'graphql':
      return {
        mode: 'graphql',
        graphql: {
          query: tabBody.graphql?.query || '',
          variables: tabBody.graphql?.variables || ''
        }
      };
    default:
      return { mode: 'none' };
  }
}; 