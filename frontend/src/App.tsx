import React, { useEffect } from 'react';
import CollectionSidebar from './components/collection/CollectionSidebar';
import RequestEditor from './components/collection/RequestEditor';
import ImportAPI from './components/collection/ImportAPI';
import { useCollectionStore } from './store/collectionStore';

const App: React.FC = () => {
  const initialize = useCollectionStore(state => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <CollectionSidebar />
      <RequestEditor />
      <ImportAPI />
    </div>
  );
};

export default App;