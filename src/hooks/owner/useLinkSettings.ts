import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/app/AppContext';
import { getLinkSettingsApi } from '@/api/endpoints/owner/getLinkSettingsApi';
import type { DefaultLinkSettingsData } from '@/api/endpoints/owner/getLinkSettingsApi';
import { updateLinkSettingsApi } from '@/api/endpoints/owner/updateLinkSettingsApi';
import type { UpdateLinkSettingsPayload } from '@/api/endpoints/owner/updateLinkSettingsApi';

export function useLinkSettings() {
  const { showToast, t } = useApp();
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
        showToast('success', res.message ? (t(res.message) || res.message) : t('settingsUpdatedSuccess'));
        return true;
      } else {
        showToast('error', res.message ? (t(res.message) || res.message) : t('settingsUpdatedFailed'));
        return false;
      }
    } catch (err: any) {
      console.error('Failed to update default link settings:', err);
      const msg = err?.response?.data?.message || t('settingsUpdatedFailed');
      showToast('error', t(msg) || msg);
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
