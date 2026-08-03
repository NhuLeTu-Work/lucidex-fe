import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '@/app/AppContext';
import { getOwnerCredentialsApi } from '@/api/endpoints/owner/getOwnerCredentialsApi';
import type {
  OwnerCredentialsResponseData,
  OwnerCredentialsQueryParams,
} from '@/api/types/owner.types';

export interface OwnerCredentialsFilterState {
  page: number;
  limit: number;
  student_id?: string;
  class_id?: string;
  graduation_year?: string;
  search?: string;
  sort?: string;
}

export function useOwnerCredentials(enabled: boolean = true) {
  const { t, showToast } = useApp();
  const [data, setData] = useState<OwnerCredentialsResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<OwnerCredentialsFilterState>({
    page: 1,
    limit: 20,
    student_id: '',
    class_id: '',
    graduation_year: '',
    search: '',
    sort: 'created_at:desc',
  });

  const fetchCredentials = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const queryParams: OwnerCredentialsQueryParams = {
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort || 'created_at:desc',
      };

      if (filters.search?.trim()) queryParams.search = filters.search.trim();
      if (filters.student_id?.trim()) queryParams.student_id = filters.student_id.trim();
      if (filters.class_id?.trim()) queryParams.class_id = filters.class_id.trim();
      if (filters.graduation_year?.trim() && !isNaN(Number(filters.graduation_year.trim()))) {
        queryParams.graduation_year = Number(filters.graduation_year.trim());
      }

      // Trả về full list (không lọc status ở Backend API query)
      const res = await getOwnerCredentialsApi(queryParams);
      if (res.success && res.data) {
        console.log(res)
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err: any) {
      setData(null);
      const status = err?.response?.status;
      const errorCode = err?.response?.data?.error_code;
      const backendMessage = err?.response?.data?.message;

      let key = 'errInternalServerError';
      if (status === 401 || errorCode === 'UNAUTHORIZED') {
        key = 'errUnauthorized';
      } else if (errorCode === 'INVALID_OWNER_ACCOUNT') {
        key = 'errInvalidOwnerAccount';
      } else if (errorCode === 'OWNER_ACCESS_REQUIRED') {
        key = 'errOwnerAccessRequired';
      } else if (errorCode === 'OWNER_INACTIVE') {
        key = 'errOwnerInactive';
      } else if (status === 422 || errorCode === 'VALIDATION_ERROR') {
        key = 'errValidationError';
      } else if (status === 500 || errorCode === 'INTERNAL_SERVER_ERROR') {
        key = 'errInternalServerError';
      }

      const displayMsg = backendMessage ? `${t(key)} (${backendMessage})` : t(key);
      showToast('error', displayMsg);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, filters, showToast, t]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const setPage = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Frontend tự phân loại từ Full List trả về
  const allItems = useMemo(() => data?.items || [], [data]);
  const claimedItems = useMemo(() => allItems.filter((item) => item.status === 'claimed'), [allItems]);
  const unclaimedItems = useMemo(() => allItems.filter((item) => item.status === 'unclaimed'), [allItems]);

  return {
    data,
    allItems,
    claimedItems,
    unclaimedItems,
    isLoading,
    filters,
    setFilters,
    setPage,
    refetch: fetchCredentials,
  };
}
