import { initialDataAtom } from 'jotai-query-toolkit';
import { hashQueryKey } from 'react-query';
import type { Atom } from 'jotai';

/**
 * useQueryInitialValues
 *
 * This hook is made to be used on next.js pages only to provide the initial data for our query atoms.
 * Note: This should only be used by advanced users, withInitialQueries makes use of this internally.
 *
 * ```typescript
 * const queryKeys = [SomeEnum.SomeKey];
 * const props = { '["SomeEnum.SomeKey"]": { foo: "bar' } }; // this will be autogenerated via {@link getInitialPropsFromQueries}`
 * const initialValues = useQueryInitialValues(queryKeys, props);
 * ```
 *
 * @param props - the data generated from {@link getInitialPropsFromQueries}, should not be created manually.
 */
export function useQueryInitialValues(props: Record<string, unknown> = {}) {
  const queryKeys = Object.keys(props);
  const atoms = queryKeys
    .map(queryKey => {
      const value = props[queryKey];
      if (!value) {
        console.error(`[Jotai Query Toolkit] no initial data found for ${hashQueryKey(queryKey)}`);
        return;
      }
      return [initialDataAtom(queryKey), value] as const;
    })
    .filter(Boolean);
  return [...atoms] as Iterable<readonly [Atom<unknown>, unknown]>;
}
