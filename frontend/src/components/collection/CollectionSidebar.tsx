import { useState, type JSX } from 'react';
import { useCollectionStore, type APIRequest } from '../../store/collectionStore';

interface Request {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
  requests: Request[];
}

interface APICollection {
  id: string;
  name: string;
  requests: APIRequest[];
}

export default function CollectionSidebar(): JSX.Element {
  const {
    collections,
    addCollection,
    removeCollection,
    addRequestToCollection,
    setActiveCollection,
    setActiveRequest,
    activeCollectionId,
    activeRequestId,
  } = useCollectionStore();

  const [newCollectionName, setNewCollectionName] = useState<string>('');
  const [newRequestName, setNewRequestName] = useState<string>('');

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      const newId = crypto.randomUUID();
      const newCollection: APICollection = {
        id: newId,
        name: newCollectionName.trim(),
        requests: [],
      };
      addCollection(newCollection);
      setActiveCollection(newId);
      setNewCollectionName('');
    }
  };

  const handleAddRequest = (collectionId: string) => {
    if (newRequestName.trim()) {
      const requestId = crypto.randomUUID();
      const newRequest: Request = {
        id: requestId,
        name: newRequestName.trim(),
      };
      addRequestToCollection(collectionId, newRequest);
      setActiveRequest(requestId);
      setNewRequestName('');
    }
  };

  return (
    <div style={{ width: '250px', background: '#f3f3f3', padding: '10px', borderRight: '1px solid #ddd' }}>
      <h3>Collections</h3>

      <input
        type="text"
        placeholder="New Collection"
        value={newCollectionName}
        onChange={(e) => setNewCollectionName(e.target.value)}
        style={{ width: '80%' }}
      />
      <button onClick={handleAddCollection} style={{ marginLeft: '5px' }}>Add</button>

      <ul style={{ listStyle: 'none', paddingLeft: '0', marginTop: '10px' }}>
        {collections.map((collection: Collection) => (
          <li key={collection.id} style={{ marginBottom: '10px' }}>
            <strong
              onClick={() => setActiveCollection(collection.id)}
              style={{
                cursor: 'pointer',
                color: collection.id === activeCollectionId ? 'blue' : 'black',
              }}
            >
              {collection.name}
            </strong>
            <button onClick={() => removeCollection(collection.id)} style={{ marginLeft: '5px' }}>❌</button>

            {collection.id === activeCollectionId && (
              <>
                <ul style={{ listStyle: 'none', paddingLeft: '15px', marginTop: '5px' }}>
                  {collection.requests.map((req: Request) => (
                    <li
                      key={req.id}
                      onClick={() => setActiveRequest(req.id)}
                      style={{
                        cursor: 'pointer',
                        color: req.id === activeRequestId ? 'green' : '#555',
                        marginBottom: '3px',
                      }}
                    >
                      {req.name}
                    </li>
                  ))}
                </ul>

                <input
                  type="text"
                  placeholder="New Request"
                  value={newRequestName}
                  onChange={(e) => setNewRequestName(e.target.value)}
                  style={{ width: '75%' }}
                />
                <button onClick={() => handleAddRequest(collection.id)} style={{ marginLeft: '5px' }}>Add</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
