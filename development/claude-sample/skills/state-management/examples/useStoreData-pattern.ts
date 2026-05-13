/**
 * useStoreData Hook Pattern
 *
 * Centralized hook for fetching data from multiple stores with cache validation.
 * This is a simplified version of the actual useStoreData hook.
 */

import { useState, useEffect } from 'react';

type StoreType = 'tasks' | 'categories' | 'rewards' | 'punishments';

export function useStoreData(storeTypes: StoreType[]) {
  const familyId = useFamilyStore(selectFamilyId);
  const [loadingStores, setLoadingStores] = useState<Set<StoreType>>(new Set());

  // Get fetch functions (stable references from stores)
  const fetchTasks = useTasksStore((s) => s.fetch);
  const fetchCategories = useCategoriesStore((s) => s.fetch);

  // Get cache validation methods
  const isTasksCacheValid = useTasksStore((s) => s.isCacheValid);
  const isCategoriesCacheValid = useCategoriesStore((s) => s.isCacheValid);

  // Helper to remove store from loading set
  const removeLoadingStore = (type: StoreType) => {
    setLoadingStores((prev) => {
      const next = new Set(prev);
      next.delete(type);
      return next;
    });
  };

  useEffect(() => {
    if (!familyId) return;

    const controller = new AbortController();

    const fetchStores = async () => {
      const toFetch: StoreType[] = [];

      // Check which stores need fetch (cache validation)
      if (storeTypes.includes('tasks') && !isTasksCacheValid(familyId)) {
        toFetch.push('tasks');
      }
      if (storeTypes.includes('categories') && !isCategoriesCacheValid(familyId)) {
        toFetch.push('categories');
      }

      if (toFetch.length === 0) {
        console.debug('[useStoreData] All caches valid');
        return;
      }

      setLoadingStores(new Set(toFetch));

      // Parallel fetch with Promise.allSettled
      const fetchPromises = toFetch.map(async (type) => {
        try {
          switch (type) {
            case 'tasks':
              await fetchTasks(familyId, dataService, { signal: controller.signal });
              break;
            case 'categories':
              await fetchCategories(familyId, dataService, { signal: controller.signal });
              break;
          }
        } catch (err) {
          if (err.name === 'AbortError') return;
          console.error(`Error fetching ${type}:`, err);
        } finally {
          removeLoadingStore(type);
        }
      });

      await Promise.allSettled(fetchPromises);
    };

    fetchStores();

    return () => {
      controller.abort(); // ✅ Cancel HTTP requests on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]); // ✅ Only depends on familyId (primitive)

  return {
    isLoading: loadingStores.size > 0,
    loadingStores,
  };
}
