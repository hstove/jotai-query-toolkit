import { useCallback, useMemo } from 'react';
import { atom } from 'jotai';
import { useAtomCallback, useAtomValue } from 'jotai/utils';

import { infiniteQueryKeyStatusAtom } from '../atoms/react-query/infinite-query-key-status-atom';
import { queryKeyCache } from '../utils';
import { getWeakCacheItem } from '../cache';

import type { WritableAtom } from 'jotai';
import type { InfiniteQueryStatus } from '../atoms/react-query/infinite-query-key-status-atom';
import type { InfiniteData, QueryKey } from 'react-query';
import type { AtomWithInfiniteQueryAction } from 'jotai/query';

const noopAtom = atom<undefined>(undefined);

const conditionalQueryKeyAtom = (queryKey: QueryKey | undefined) => {
  if (!queryKey) return noopAtom;
  return infiniteQueryKeyStatusAtom(queryKey);
};

export interface UseInfiniteQueryAtomBaseExtras {
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  refetch: () => void;
}

export interface OptionalStatus extends UseInfiniteQueryAtomBaseExtras {
  isFetchingPreviousPage: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useInfiniteQueryAtom<T>(
  anAtom: WritableAtom<InfiniteData<T> | undefined, AtomWithInfiniteQueryAction<T>>
): [InfiniteData<T> | undefined, OptionalStatus] {
  const value = useAtomValue<InfiniteData<T> | undefined>(anAtom);
  const deps = [anAtom] as const;
  const queryKey = getWeakCacheItem<QueryKey>(queryKeyCache, deps);
  if (!queryKey)
    throw Error(
      `[Jotai Query Toolkit] no query key was found for ${
        anAtom.debugLabel || anAtom.toString()
      }, is it an atomFamilyWithInfiniteQuery atom?`
    );
  const statusAtom = useMemo(() => conditionalQueryKeyAtom(queryKey), [queryKey]);
  const status = useAtomValue(statusAtom);

  const fetchNextPage = useAtomCallback(
    useCallback((get, set) => set(anAtom, { type: 'fetchNextPage' }), [])
  );
  const fetchPreviousPage = useAtomCallback(
    useCallback((get, set) => set(anAtom, { type: 'fetchPreviousPage' }), [])
  );
  const refetch = useAtomCallback(useCallback((get, set) => set(anAtom, { type: 'refetch' }), []));

  const optionalStatus = {
    isFetchingPreviousPage: (status as InfiniteQueryStatus).isFetchingPreviousPage,
    isFetchingNextPage: (status as InfiniteQueryStatus).isFetchingNextPage,
    hasNextPage: !!(status as InfiniteQueryStatus).hasNextPage,
    hasPreviousPage: !!(status as InfiniteQueryStatus).hasPreviousPage,
  };

  return [
    value,
    {
      fetchNextPage,
      fetchPreviousPage,
      refetch,
      ...optionalStatus,
    },
  ];
}
