import { useState, useEffect } from 'react';
import { db } from '../services/dbService';
import { subscribe } from '../services/dbService';

export function useDb() {
  const [dbState, setDbState] = useState({ ...db });

  useEffect(() => {
    return subscribe(() => {
      setDbState({ ...db });
    });
  }, []);

  return dbState;
}
