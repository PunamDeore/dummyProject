import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { SortKey } from '../lib/catalog';

export interface ProductFilters {
  query: string;
  sort: SortKey;
  category: string;
  page: number;
}

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ProductFilters>(() => {
    const page = Number(searchParams.get('page') ?? '1');
    return {
      query: searchParams.get('q') ?? '',
      // The URL is untyped text; the cast is a promise we keep in updateFilters, where only SortKeys are written.
      sort: (searchParams.get('sort') ?? '') as SortKey,
      category: searchParams.get('category') ?? 'all',
      page: Number.isFinite(page) && page > 0 ? page - 1 : 0,
    };
  }, [searchParams]);


  const updateFilters = useCallback(
    (patch: Partial<ProductFilters>, { replace = true }: { replace?: boolean } = {}) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous); // copy — never mutate the argument

          const write = (key: string, value: string | number | undefined, emptyValue?: string | number) => {
            if (value === undefined) return;
            if (value === '' || value === emptyValue) next.delete(key);
            else next.set(key, String(value));
          };

          write('q', patch.query);
          write('sort', patch.sort);
          write('category', patch.category, 'all');
          if (patch.page !== undefined) write('page', patch.page + 1, 1);
          else next.delete('page'); // a filter change invalidates the current page

          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  return { filters, updateFilters };
}
