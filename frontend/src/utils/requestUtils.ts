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
        mode: 'form-data',
        formData: (requestBody.formdata || []).map((item: FormDataItem) => ({
          key: item.key || '',
          value: item.value || '',
          type: item.type || 'text'
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
          name: requestBody.file.src,
          content: ''
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
    case 'form-data':
      return {
        mode: 'formdata',
        formdata: tabBody.formData?.map((item: FormDataItem) => ({
          key: item.key,
          value: item.value,
          type: item.type
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
          src: tabBody.file?.name || ''
        }
      };
    default:
      return { mode: 'none' };
  }
}; 