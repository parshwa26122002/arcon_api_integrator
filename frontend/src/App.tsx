import React from 'react';
import CollectionSidebar from './components/collection/CollectionSidebar';
import RequestEditor from './components/collection/RequestEditor';
import ImportAPI from './components/collection/ImportAPI';

const App: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <CollectionSidebar />
      <RequestEditor />
      <ImportAPI />
    </div>
  );
};

export default App;