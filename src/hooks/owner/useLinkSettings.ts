import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/app/AppContext';
import { getLinkSettingsApi } from '@/api/endpoints/owner/getLinkSettingsApi';
import type { DefaultLinkSettingsData } from '@/api/endpoints/owner/getLinkSettingsApi';
import { updateLinkSettingsApi } from '@/api/endpoints/owner/updateLinkSettingsApi';
import type { UpdateLinkSettingsPayload } from '@/api/endpoints/owner/updateLinkSettingsApi';

export function useLinkSettings() {
  const { showToast } = useApp();
  const [settings, setSettings] = useState<DefaultLinkSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getLinkSettingsApi();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch default link settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = async (payload: UpdateLinkSettingsPayload) => {
    setIsSaving(true);
    try {
      const res = await updateLinkSettingsApi(payload);
      if (res.success && res.data) {
        setSettings(res.data);
        showToast('success', res.message || 'Đã cập nhật cài đặt mặc định.');
        return true;
      } else {
        showToast('error', res.message || 'Cập nhật cài đặt thất bại.');
        return false;
      }
    } catch (err: any) {
      console.error('Failed to update default link settings:', err);
      const msg = err?.response?.data?.message || 'Không thể cập nhật cài đặt mặc định.';
      showToast('error', msg);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    fetchSettings,
    updateSettings,
  };
}
