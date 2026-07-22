import { useGetAdmins } from './useGetAdmins';
import { useCreateAdmin } from './useCreateAdmin';
// TODO: Sau này bạn import thêm useAuditLogs, useSuperTabs, v.v. vào đây

export function useSuper(t: any) {
  // 1. Khởi tạo Hook Get (để lấy danh sách và hàm fetch)
  const { accounts, isLoadingAccounts, fetchAccounts } = useGetAdmins(t);

  // 2. Khởi tạo Hook Create (truyền hàm fetch vào để Create có thể gọi lại)
  const { isCreating, newAdminCredentials, handleCreateAdmin, closeCreateModal } = useCreateAdmin(t, fetchAccounts);

  return {
    // Trả về cho UI phần Danh sách
    accounts,
    isLoadingAccounts,
    fetchAccounts,

    // Trả về cho UI phần Tạo Admin
    isCreating,
    newAdminCredentials,
    handleCreateAdmin,
    closeCreateModal
  };
}