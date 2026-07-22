// src/hooks/admin/useAdminOrganizations.ts
import { useState, useEffect, useCallback } from 'react';
import { getOrganizationsApi } from '@/api/endpoints/admin/getOrganizationsApi';
import type { OrganizationRecord, OrgTypeFilter, OrgStatusFilter } from '@/api/types/admin.types';
import { toast } from 'sonner';

export function useAdminOrganizations(
  initialType?: OrgTypeFilter, 
  initialStatus: OrgStatusFilter = 'pending_review' // Default theo tài liệu API
) {
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State quản lý các bộ lọc
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
      } else {
        toast.error(response.message || 'Lỗi khi tải danh sách tổ chức.');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập Admin đã hết hạn hoặc không hợp lệ.');
      } else {
        toast.error(error.response?.data?.message || 'Không thể kết nối đến máy chủ.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, statusFilter]); // Chạy lại hàm nếu filter thay đổi

  // Tự động fetch data khi component mount hoặc khi filter thay đổi
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return {
    organizations,
    isLoading,
    typeFilter,
    setTypeFilter,     // Dùng hàm này để thay đổi filter type (ví dụ: khi click nút filter trên UI)
    statusFilter,
    setStatusFilter,   // Dùng hàm này để thay đổi filter status
    fetchOrganizations // Export hàm này để có thể gắn vào nút "Refresh"
  };
}