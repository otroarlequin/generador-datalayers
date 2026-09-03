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
      'by-brand': string;
      'by-country': string;
      'by-structureType': string;
      'by-updatedAt': string;
    };
  };
  [GUIDES_STORE]: {
    key: string;
    value: MeasurementGuide;
    indexes: {
      'by-brand': string;
      'by-country': string;
      'by-updatedAt': string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<MeasurementGuideDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<MeasurementGuideDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MeasurementGuideDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (!db.objectStoreNames.contains(LIBRARY_STORE)) {
          const store = db.createObjectStore(LIBRARY_STORE, { keyPath: 'id' });
          store.createIndex('by-signature', 'signature', { unique: true });
          store.createIndex('by-brand', 'brand');
          store.createIndex('by-country', 'country');
          store.createIndex('by-structureType', 'structureType');
          store.createIndex('by-updatedAt', 'updatedAt');
        } else if (oldVersion < 3) {
          const store = transaction.objectStore(LIBRARY_STORE);
          if (!store.indexNames.contains('by-brand')) {
            store.createIndex('by-brand', 'brand');
          }
          if (!store.indexNames.contains('by-country')) {
            store.createIndex('by-country', 'country');
          }
        }

        if (!db.objectStoreNames.contains(GUIDES_STORE)) {
          const guides = db.createObjectStore(GUIDES_STORE, { keyPath: 'id' });
          guides.createIndex('by-brand', 'brand');
          guides.createIndex('by-country', 'country');
          guides.createIndex('by-updatedAt', 'updatedAt');
        } else if (oldVersion < 3) {
          const guides = transaction.objectStore(GUIDES_STORE);
          if (!guides.indexNames.contains('by-brand')) {
            guides.createIndex('by-brand', 'brand');
          }
          if (!guides.indexNames.contains('by-country')) {
            guides.createIndex('by-country', 'country');
          }
        }
      },
    });
  }
  return dbPromise;
}
