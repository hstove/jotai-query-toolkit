import { atomFamily } from 'jotai/utils';
import { InfiniteQueryObserver, InfiniteQueryObserverOptions, QueryKey } from 'react-query';
import { atom } from 'jotai';
import { getQueryClientAtom } from 'jotai/query';
import deepEqual from 'fast-deep-equal';

export const infiniteQueryKeyObserver = atomFamily<QueryKey, InfiniteQueryObserver>(
  queryKey =>
    atom(get => {
      const queryClient = get(getQueryClientAtom);
      const options = queryClient.getQueryCache().find(queryKey)?.options || {
        queryKey,
      };
      const defaultedOptions = queryClient.defaultQueryObserverOptions({
        ...options,
        notifyOnChangeProps: [
          'data',
          'error',
          'isFetchingPreviousPage',
          'isFetchingNextPage',
          'hasNextPage',
          'hasPreviousPage',
        ],
      });
      const observer = new InfiniteQueryObserver(
        queryClient,
        defaultedOptions as InfiniteQueryObserverOptions
      );
      return observer;
    }),
  deepEqual
);