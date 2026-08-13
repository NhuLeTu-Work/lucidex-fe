import React, { useState, useMemo } from 'react';
import { Copy, Check, Search } from 'lucide-react';
import { useGetVerifiedLinks } from '@/hooks/owner/useGetVerifiedLinks';
import { useRevokeVerifiedLink } from '@/hooks/owner/useRevokeVerifiedLink';
import { useApp } from '@/app/AppContext';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

interface OwnerLinksProps {
  t: (k: string) => string;
  links?: any[];
  onRevoke?: (id: string) => void;
  onCreate?: () => void;
}

export function OwnerLinks({ t, onRevoke }: OwnerLinksProps) {
  const { showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Gọi API lấy danh sách mã chia sẻ và thu hồi mã
  const { items: apiItems, isLoading, refetch } = useGetVerifiedLinks();
  const { revokeLink, isRevoking } = useRevokeVerifiedLink();

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    showToast('success', t('codeCopied') || 'Đã sao chép mã chia sẻ!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper rút gọn hiển thị mã (ví dụ: LX5...N8Q nếu quá dài)
  const formatShortCode = (code: string) => {
    if (!code) return '';
    if (code.length <= 10) return code;
    return `${code.slice(0, 3)}...${code.slice(-3)}`;
  };

  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');

  // Lọc theo từ khóa tìm kiếm & trạng thái (active vs inactive: expired + revoked)
  const filteredItems = useMemo(() => {
    return apiItems.filter((item) => {
      const status = item.display_status || 'active';
      const isInactive = status === 'expired' || status === 'revoked';

      if (statusFilter === 'active' && isInactive) return false;
      if (statusFilter === 'inactive' && !isInactive) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.code?.toLowerCase().includes(q) ||
        (item.degree_type || (item as any).credential_name)?.toLowerCase().includes(q) ||
        item.issuer_name?.toLowerCase().includes(q) ||
        String(item.graduation_year || '').includes(q) ||
        item.id?.toLowerCase().includes(q)
      );
    });
  }, [apiItems, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Title & Search Bar */}
      <h1 className="font-display text-2xl">{t('verifiedLinks')}</h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            type="text"
            placeholder={t('searchCodePlaceholder') || 'Search verification code or credential...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Toggle Filter 2 lựa chọn: Hoạt động (active) / Ngưng hoạt động (inactive: expired + revoked) */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'active'
                ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {t('active') || 'Hoạt động'}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'inactive'
                ? 'bg-background text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {t('inactive') || 'Ngưng hoạt động'}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[240px] font-bold text-sm text-muted-foreground py-4 px-6">
                {t('verificationCode') || 'Verification Code'}
              </TableHead>
              <TableHead className="font-bold text-sm text-muted-foreground py-4 px-6">
                {t('credentialName') || 'Credential Name'}
              </TableHead>
              <TableHead className="w-[140px] font-bold text-sm text-muted-foreground py-4 px-6">
                {t('status') || 'Status'}
              </TableHead>
              <TableHead className="w-[160px] text-right font-bold text-sm text-muted-foreground py-4 px-6">
                {t('actions') || 'Actions'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-5 px-6">
                    <Skeleton className="h-6 w-28" />
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <Skeleton className="h-6 w-48" />
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right py-5 px-6">
                    <Skeleton className="h-9 w-20 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground text-base px-6">
                  {searchQuery
                    ? t('noMatchingCodes') || 'No matching verification codes found.'
                    : t('noLinks') || 'No verification codes created yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const status = item.display_status || 'active';
                const isRevoked = status === 'revoked';
                const isExpired = status === 'expired';
                const isInactive = isRevoked || isExpired;
                const isCopied = copiedId === item.id;
                const degreeType = item.degree_type || (item as any).credential_name || '(blank)';
                const issuerName = item.issuer_name || '';
                const gradYear = item.graduation_year ? String(item.graduation_year) : '';

                return (
                  <React.Fragment key={item.id}>
                    <TableRow className={`hover:bg-muted/30 transition-colors ${isRevoked ? 'opacity-50 select-none' : ''}`}>
                      {/* Column 1: Verification Code + Copy Button (khong hien copy nut khi expired/revoked) */}
                      <TableCell className="py-5 px-6 font-mono font-bold text-base">
                        <div className="flex items-center gap-2">
                          <span title={item.code}>{formatShortCode(item.code)}</span>
                          {!isInactive && (
                            <button
                              onClick={() => handleCopyCode(item.id, item.code)}
                              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                              title={t('copy') || 'Copy Code'}
                            >
                              {isCopied ? (
                                <Check size={16} className="text-emerald-600" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </TableCell>

                      {/* Column 2: Credential Name (degree_type, cùng dòng với issuer_name + graduation_year) */}
                      <TableCell className="py-5 px-6 text-base font-medium">
                        <div>
                          <span>{degreeType}</span>
                          {(issuerName || gradYear) && (
                            <p className="text-xs font-normal text-muted-foreground mt-0.5">
                              {[issuerName, gradYear].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Column 3: Status Badge */}
                      <TableCell className="py-5 px-6">
                        {status === 'active' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            {t('active') || 'Active'}
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            {t('expired') || 'Expired'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            {t('revoked') || 'Revoked'}
                          </span>
                        )}
                      </TableCell>

                      {/* Column 4: Actions (Revoke Button - Red background, White text) */}
                      <TableCell className="text-right py-5 px-6">
                        {status === 'active' && (
                          <button
                            onClick={() => setRevokingId(revokingId === item.id ? null : item.id)}
                            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                            title={t('revokeLink') || 'Revoke'}
                          >
                            {t('revokeLink') || 'Revoke'}
                          </button>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Original Confirm Revoke Box Row */}
                    {revokingId === item.id && (
                      <TableRow className="bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50/40">
                        <TableCell colSpan={4} className="p-4">
                          <div
                            className="p-4 rounded-xl border text-left space-y-3"
                            style={{ borderColor: '#fecaca', background: 'var(--ct-accent-red)' }}
                          >
                            <p className="text-sm text-foreground font-medium">
                              {t('revokeConfirm') || 'Bạn chắc chắn muốn thu hồi mã chia sẻ này?'}
                            </p>
                            <div className="flex gap-2">
                              <button
                                disabled={isRevoking}
                                onClick={async () => {
                                  const ok = await revokeLink(item.id, () => {
                                    refetch();
                                    setRevokingId(null);
                                  });
                                  if (!ok && onRevoke) {
                                    onRevoke(item.id);
                                    setRevokingId(null);
                                  }
                                }}
                                className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                              >
                                {isRevoking ? '...' : (t('confirm') || 'Xác nhận')}
                              </button>
                              <button
                                disabled={isRevoking}
                                onClick={() => setRevokingId(null)}
                                className="px-4 py-1.5 text-sm font-medium rounded-lg border bg-background transition-opacity hover:opacity-80 disabled:opacity-50"
                                style={{ borderColor: 'var(--ct-border)' }}
                              >
                                {t('cancel') || 'Hủy'}
                              </button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}