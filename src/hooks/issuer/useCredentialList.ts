import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/app/AppContext';
import { getCredentialsApi } from '@/api/endpoints/issuer/getCredentialsApi';

import type { GetCredentialsResponseData, GetCredentialsQueryParams } from '@/api/endpoints/issuer/getCredentialsApi';
export interface CredentialListFilterState {
  page: number;
  limit: number;
  student_id?: string;
  class_id?: string;
  graduation_year?: string;
  status?: string[];
  search?: string;
  sort?: string;
}

export function useCredentialList() {
  const { t, showToast } = useApp();
  const [data, setData] = useState<GetCredentialsResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<CredentialListFilterState>({
    page: 1,
    limit: 10,
    status: [],
    student_id: '',
    class_id: '',
    graduation_year: '',
    search: '',
    sort: 'created_at:desc',
  });

  const fetchCredentials = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams: GetCredentialsQueryParams = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort || 'created_at:desc',
      };

      if (filters.search?.trim()) queryParams.search = filters.search.trim();
      if (filters.student_id?.trim()) queryParams.student_id = filters.student_id.trim();
      if (filters.class_id?.trim()) queryParams.class_id = filters.class_id.trim();
      if (filters.graduation_year?.trim()) queryParams.graduation_year = Number(filters.graduation_year.trim());

      // If exactly 1 status filter is checked, send it
      if (filters.status && filters.status.length === 1) {
        queryParams.status = filters.status[0];
      }

      const res = await getCredentialsApi(queryParams);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err: any) {
      setData(null);
      const status = err?.response?.status;
      const errorCode = err?.response?.data?.error_code;
      const msg = err?.response?.data?.message || err?.message;

      if (status === 401 || errorCode === 'UNAUTHORIZED') {
        showToast('error', t('errorSessionExpired'));
      } else if (status === 422 || errorCode === 'VALIDATION_ERROR') {
        showToast('error', msg || t('errorRegValidation'));
      } else if (status === 500 || errorCode === 'INTERNAL_SERVER_ERROR') {
        showToast('error', msg || t('errCheckDuplicatesFailed'));
      } else {
        showToast('error', msg || t('noDataFound'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, showToast, t]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const setPage = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return {
    data,
    isLoading,
    filters,
    setFilters,
    setPage,
    refetch: fetchCredentials,
  };
}
