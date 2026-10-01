import { api } from '../client';
import { endpoints } from '../endpoints';
import type { ApiCategory, Product, ProductDraft, ProductListResponse } from '../../types';

const LIST_FIELDS = 'id,title,description,category,price,discountPercentage,rating,stock,brand,thumbnail';

interface RequestOptions {
  signal?: AbortSignal;
}

export interface ListProductsOptions extends RequestOptions {
  q?: string;
  category?: string;
  sortBy?: 'price' | 'rating' | '';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}


export async function listProducts({
  q = '',
  category = '',
  sortBy = '',
  order = 'asc',
  page = 0,
  limit = 12,
  signal,
}: ListProductsOptions = {}): Promise<ProductListResponse> {
  const params: Record<string, string | number | undefined> = {
    limit,
    skip: page * limit,
    select: LIST_FIELDS,
    sortBy: sortBy || undefined,
    order: sortBy ? order : undefined,
  };

  let url = endpoints.products.list();
  if (q) {
    url = endpoints.products.search();
    params.q = q;
  } else if (category) {
    url = endpoints.products.byCategory(category);
  }

  const { data } = await api.get<ProductListResponse>(url, { params, signal });
  return data;
}


export async function getProduct(id: number | string, { signal }: RequestOptions = {}): Promise<Product> {
  const { data } = await api.get<Product>(endpoints.products.detail(id), { signal });
  return data;
}

export async function listCategories({ signal }: RequestOptions = {}): Promise<ApiCategory[]> {
  const { data } = await api.get<ApiCategory[]>(endpoints.products.categories(), { signal });
  return data;
}


export async function createProduct(payload: ProductDraft, { signal }: RequestOptions = {}): Promise<Product> {
  const { data } = await api.post<Product>(endpoints.products.create(), payload, { signal });
  return data;
}


export async function updateProduct(id: number | string, patch: Partial<ProductDraft>, { signal }: RequestOptions = {}): Promise<Product> {
  const { data } = await api.patch<Product>(endpoints.products.update(id), patch, { signal });
  return data;
}


export async function deleteProduct(id: number | string, { signal }: RequestOptions = {}): Promise<Product & { isDeleted: boolean; deletedOn: string }> {
  const { data } = await api.delete<Product & { isDeleted: boolean; deletedOn: string }>(endpoints.products.remove(id), { signal });
  return data;
}
