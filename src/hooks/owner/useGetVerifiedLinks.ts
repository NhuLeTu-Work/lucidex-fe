import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/app/AppContext';
import { getVerifiedLinksApi } from '@/api/endpoints/owner/getVerifiedLinksApi';
import type {
  GetVerifiedLinksQueryParams,
  VerifiedLinksResponseData,
} from '@/api/types/owner.types';

export function useGetVerifiedLinks(initialParams?: GetVerifiedLinksQueryParams) {
  const { showToast } = useApp();
  const [params, setParams] = useState<GetVerifiedLinksQueryParams>(
    initialParams || { page: 1, page_size: 20 }
  );
  const [data, setData] = useState<VerifiedLinksResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getVerifiedLinksApi(params);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch verified codes:', err);
      const msg = err?.response?.data?.message || 'Không thể tải danh sách mã chia sẻ';
      showToast('error', msg);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [params, showToast]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return {
    data,
    items: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.page_size || 20,
    isLoading,
    refetch: fetchLinks,
    setParams,
  };
}
