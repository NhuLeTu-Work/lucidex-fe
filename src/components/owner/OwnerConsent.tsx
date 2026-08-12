import { useState, useRef, useEffect } from 'react';
import { Search, X, Check, ChevronDown, Loader2 } from 'lucide-react';
import { useLinkSettings } from '@/hooks/owner/useLinkSettings';
import { useVerifiersList } from '@/hooks/owner/useVerifiersList';
import { Skeleton } from '@/components/ui/skeleton';

export function OwnerConsent({ t }: { t: (k: string) => string }) {
  const { settings, isLoading, isSaving, updateSettings } = useLinkSettings();
  const { verifiers, isLoading: isVerifiersLoading } = useVerifiersList();

  const [defaultConsent, setDefaultConsent] = useState('');
  const [accessCount, setAccessCount] = useState<number>(5);
  const [timeLimitHours, setTimeLimitHours] = useState<number>(24);

  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settings) {
      if (settings.default_consent_mode === 'access_count') setDefaultConsent('access_number');
      else if (settings.default_consent_mode === 'time_bound') setDefaultConsent('time_bound');
      else if (settings.default_consent_mode === 'custom') setDefaultConsent('customize');

      if (settings.default_max_access_count !== null && settings.default_max_access_count !== undefined) {
        setAccessCount(settings.default_max_access_count);
      }
      if (settings.default_expiry_hours !== null && settings.default_expiry_hours !== undefined) {
        setTimeLimitHours(settings.default_expiry_hours);
      }
      if (settings.default_allowed_org_ids && settings.default_allowed_org_ids.length > 0) {
        setSelectedOrgIds(settings.default_allowed_org_ids);
      }
    }
  }, [settings]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const consentOptions = [
    {
      value: 'access_number',
      label: t('accessNumberConsent'),
      desc: t('accessNumberDesc'),
    },
    {
      value: 'time_bound',
      label: t('timeBoundConsent'),
      desc: t('timeBoundDesc'),
    },
    {
      value: 'customize',
      label: t('customizeConsent'),
      desc: t('customizeDesc'),
    },
  ];

  const filteredVerifiers = verifiers.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOrg = (orgId: string) => {
    if (selectedOrgIds.includes(orgId)) {
      setSelectedOrgIds(selectedOrgIds.filter(id => id !== orgId));
    } else {
      setSelectedOrgIds([...selectedOrgIds, orgId]);
    }
  };

  const getVerifierName = (id: string) => {
    const found = verifiers.find(v => v.id === id);
    return found ? found.name : id;
  };

  const currentApiMode =
    defaultConsent === 'access_number'
      ? 'access_count'
      : defaultConsent === 'time_bound'
        ? 'time_bound'
        : defaultConsent === 'customize'
          ? 'custom'
          : '';

  const initialApiMode = settings?.default_consent_mode || '';
  const initialMaxAccess = settings?.default_max_access_count ?? null;
  const initialExpiryHours = settings?.default_expiry_hours ?? null;
  const initialAllowedOrgs = settings?.default_allowed_org_ids || [];

  const currentMaxAccess =
    defaultConsent === 'access_number' || defaultConsent === 'customize' ? accessCount : null;
  const currentExpiryHours =
    defaultConsent === 'time_bound' || defaultConsent === 'customize' ? timeLimitHours : null;

  const orgsChanged =
    selectedOrgIds.length !== initialAllowedOrgs.length ||
    selectedOrgIds.some(id => !initialAllowedOrgs.includes(id));

  const hasChanged =
    currentApiMode !== initialApiMode ||
    currentMaxAccess !== initialMaxAccess ||
    currentExpiryHours !== initialExpiryHours ||
    orgsChanged;

  const handleSave = () => {
    const apiMode =
      defaultConsent === 'access_number'
        ? 'access_count'
        : defaultConsent === 'time_bound'
          ? 'time_bound'
          : defaultConsent === 'customize'
            ? 'custom'
            : 'access_count';

    updateSettings({
      default_consent_mode: apiMode,
      default_max_access_count: currentMaxAccess,
      default_expiry_hours: currentExpiryHours,
      default_allowed_org_ids: selectedOrgIds,
    });
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('consentSettings')}</h1>
      <div className="max-w-xl space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-3">
            {consentOptions.map(opt => (
              <div
                key={opt.value}
                className={`rounded-lg border transition-all ${defaultConsent === opt.value ? 'border-black' : 'opacity-70'
                  }`}
                style={{
                  background: defaultConsent === opt.value ? 'var(--ct-surface)' : 'transparent',
                  borderColor: defaultConsent === opt.value ? 'var(--ct-text)' : 'var(--ct-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setDefaultConsent(opt.value)}
                  className="w-full text-left p-3 flex items-start gap-3"
                >
                  <div
                    className="w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 transition-all"
                    style={{ borderColor: defaultConsent === opt.value ? 'var(--ct-text)' : 'var(--ct-border)' }}
                  >
                    {defaultConsent === opt.value && (
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--ct-text)' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm block" style={{ color: 'var(--ct-text)' }}>
                      {opt.label}
                    </span>
                    <p className="text-xs mt-0.5 opacity-60" style={{ color: 'var(--ct-text)' }}>
                      {opt.desc}
                    </p>
                  </div>
                </button>

                {defaultConsent === opt.value && (
                  <div className="px-4 pb-4 pt-1 border-t mt-1 space-y-3" style={{ borderColor: 'var(--ct-border)' }}>
                    {(opt.value === 'access_number' || opt.value === 'customize') && (
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium min-w-[120px]" style={{ color: 'var(--ct-text-secondary)' }}>
                          {t('accessNumberConsent')}:
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={accessCount}
                          onChange={(e) => setAccessCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-24 px-3 py-1.5 text-sm rounded-lg border focus:outline-none"
                          style={{
                            background: 'var(--ct-surface)',
                            borderColor: 'var(--ct-border)',
                            color: 'var(--ct-text)',
                          }}
                        />
                      </div>
                    )}

                    {(opt.value === 'time_bound' || opt.value === 'customize') && (
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium min-w-[120px]" style={{ color: 'var(--ct-text-secondary)' }}>
                          {t('timeBoundConsent')}:
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={8760}
                          value={timeLimitHours}
                          onChange={(e) => setTimeLimitHours(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-24 px-3 py-1.5 text-sm rounded-lg border focus:outline-none"
                          style={{
                            background: 'var(--ct-surface)',
                            borderColor: 'var(--ct-border)',
                            color: 'var(--ct-text)',
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('autoApproveFor')}</h3>

          {selectedOrgIds.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedOrgIds.map(orgId => (
                <span
                  key={orgId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={{
                    background: 'var(--ct-bg)',
                    borderColor: 'var(--ct-border)',
                    color: 'var(--ct-text)',
                  }}
                >
                  {getVerifierName(orgId)}
                  <button
                    type="button"
                    onClick={() => toggleOrg(orgId)}
                    className="hover:opacity-75 focus:outline-none p-0.5 rounded-full"
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="min-h-[44px] px-3 py-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:border-black"
              style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}
            >
              <span className="text-sm opacity-60" style={{ color: 'var(--ct-text)' }}>
                {isVerifiersLoading ? 'Loading verifiers...' : 'Select trusted organizations...'}
              </span>
              <div className="opacity-60 flex items-center gap-2">
                {isVerifiersLoading && <Loader2 size={16} className="animate-spin" />}
                <ChevronDown size={18} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {isDropdownOpen && (
              <div
                className="absolute z-20 top-full left-0 right-0 mt-2 rounded-xl border shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1"
                style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)' }}
              >
                <div className="p-2.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--ct-border)' }}>
                  <Search size={16} className="opacity-50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search organizations..."
                    className="w-full text-sm bg-transparent focus:outline-none"
                    style={{ color: 'var(--ct-text)' }}
                    autoFocus
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="opacity-50 hover:opacity-100">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                  {isVerifiersLoading ? (
                    <div className="p-4 text-center text-xs opacity-50 flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Loading verifiers list...
                    </div>
                  ) : filteredVerifiers.length === 0 ? (
                    <div className="p-3 text-xs text-center opacity-50">No organizations found</div>
                  ) : (
                    filteredVerifiers.map(v => {
                      const isSelected = selectedOrgIds.includes(v.id);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => toggleOrg(v.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${isSelected ? 'font-medium' : 'opacity-80'
                            }`}
                          style={{
                            background: isSelected ? 'var(--ct-bg)' : 'transparent',
                          }}
                        >
                          <span style={{ color: 'var(--ct-text)' }}>{v.name}</span>
                          {isSelected && <Check size={16} className="text-green-600" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Only render Save button if there are changes */}
        {hasChanged && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: '#000' }}
          >
            {isSaving ? '...' : t('save')}
          </button>
        )}
      </div>
    </div>
  );
}
