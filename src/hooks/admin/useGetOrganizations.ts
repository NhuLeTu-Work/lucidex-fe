import { useState, useEffect, useCallback } from 'react';
import { getOrganizationsApi } from '@/api/endpoints/admin/getOrganizationsApi';
import type { OrganizationRecord, OrgTypeFilter, OrgStatusFilter } from '@/api/types/admin.types';
import axios from 'axios';

export function useAdminOrganizations(
  showToast: (type: 'success' | 'error' | 'warning', message: string) => void,
  initialStatus: OrgStatusFilter = 'pending_review',
  initialType?: OrgTypeFilter,
) {
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);  
  const [typeFilter, setTypeFilter] = useState<OrgTypeFilter | undefined>(initialType);
  const [statusFilter, setStatusFilter] = useState<OrgStatusFilter | undefined>(initialStatus);

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getOrganizationsApi({
        type: typeFilter,
        status: statusFilter,
      });

      if (response.success) {
        setOrganizations(response.data);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) return;
      const status = error.response?.status;
      const errorCode = error.response?.data?.error_code
      if (status === 401 && errorCode === 'INVALID_ADMIN_ACCESS_TOKEN') {
        showToast('error', 'errorAdminSession'); 
      } else if (status === 422) {
        showToast('error', 'errorInvalidRequestData'); 
      }
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, statusFilter]); // Chạy lại hàm nếu filter thay đổi

  useEffect(() => {
    fetchOrganizations();
    const interval = setInterval(fetchOrganizations, 1000); // 15s
    return () => clearInterval(interval);
  }, [fetchOrganizations]);

  return {
    organizations,
    isLoading,
    typeFilter,
    setTypeFilter,     
    statusFilter,
    setStatusFilter,   
    fetchOrganizations 
  };
}