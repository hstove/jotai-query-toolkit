import { GetStaticProps, GetStaticPropsContext, GetStaticPropsResult } from 'next';
import { GetQueries, Queries, QueryPropsGetter } from './types';
import { getInitialPropsFromQueries } from './get-initial-props-from-queries';
import { queryClient } from 'jotai-query-toolkit';

export function getStaticQueryProps<QueryProps = undefined, PageProps = any>(
  getQueries: Queries<QueryProps> | GetQueries<QueryProps>,
  getQueryProps?: QueryPropsGetter<QueryProps>
) {
  return (getStaticProps?: GetStaticProps<PageProps>) => {
    return async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<PageProps>> => {
      const _getStaticProps = async () => {
        if (getStaticProps) return getStaticProps(ctx);
        return { props: {} };
      };

      const promises: Promise<any>[] = [
        getInitialPropsFromQueries<QueryProps>({
          getQueries,
          getQueryProps,
          ctx,
          queryClient,
        }),
        _getStaticProps(),
      ];

      const [initialQueryData, staticProps] = await Promise.all(promises);

      return {
        ...staticProps,
        props: {
          ...staticProps.props,
          initialQueryData,
        },
      };
    };
  };
}

// // the same kind of getQueries from withInitialQueries
// const getQueries: GetQueries = context => {
//   return [['query-key', async () => 'hello-world']];
// };
//
// // the getStaticProps that will be exported from a page
// export const getStaticProps = getStaticQueryProps(getQueries)(async context => {
//   return {
//     props: {},
//     revalidate: 60,
//   };
// });
