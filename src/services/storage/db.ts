import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import {
  DB_NAME,
  DB_VERSION,
  GUIDES_STORE,
  LIBRARY_STORE,
} from '@/constants';
import type { LibraryEvent, MeasurementGuide } from '@/types';

interface MeasurementGuideDB extends DBSchema {
  [LIBRARY_STORE]: {
    key: string;
    value: LibraryEvent;
    indexes: {
      'by-signature': string;
      'by-client': string;
      'by-project': string;
      'by-structureType': string;
      'by-updatedAt': string;
    };
  };
  [GUIDES_STORE]: {
    key: string;
    value: MeasurementGuide;
    indexes: {
      'by-client': string;
      'by-project': string;
      'by-updatedAt': string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<MeasurementGuideDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<MeasurementGuideDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MeasurementGuideDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(LIBRARY_STORE)) {
          const store = db.createObjectStore(LIBRARY_STORE, { keyPath: 'id' });
          store.createIndex('by-signature', 'signature', { unique: true });
          store.createIndex('by-client', 'client');
          store.createIndex('by-project', 'project');
          store.createIndex('by-structureType', 'structureType');
          store.createIndex('by-updatedAt', 'updatedAt');
        }

        if (oldVersion < 2 && !db.objectStoreNames.contains(GUIDES_STORE)) {
          const guides = db.createObjectStore(GUIDES_STORE, { keyPath: 'id' });
          guides.createIndex('by-client', 'client');
          guides.createIndex('by-project', 'project');
          guides.createIndex('by-updatedAt', 'updatedAt');
        }
      },
    });
  }
  return dbPromise;
}
