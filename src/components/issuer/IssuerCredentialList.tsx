import { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { useCredentialList } from '@/hooks/issuer/useCredentialList';
import { IssuerCredentialDetailModal } from './IssuerCredentialDetailModal';
import { formatDateDDMMYYYY } from '@/utils/timeUtils';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RefreshCcw, Eye, ChevronRight, ChevronLeft } from 'lucide-react';

export function IssuerCredentialList() {
  const { t } = useApp();
  const { data, isLoading, filters, setFilters, setPage, refetch } = useCredentialList();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 10, status: [], student_id: '', class_id: '', graduation_year: '', search: '', sort: 'created_at:desc' });
  };

  const toggleStatusFilter = (statusValue: string) => {
    setFilters(prev => {
      const newStatus = prev.status?.includes(statusValue)
        ? prev.status.filter(s => s !== statusValue)
        : [...(prev.status || []), statusValue];
      return { ...prev, status: newStatus, page: 1 };
    });
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('credentialListTitle')}</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ct-text-secondary)' }}>
            {t('totalCredentials')}
          </p>
          <p className="text-2xl font-bold mt-1">{data?.summary?.total_credentials ?? 0}</p>
        </div>
        <div className="p-4 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ct-text-secondary)' }}>
            {t('totalClaimed')}
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">{data?.summary?.total_claimed ?? 0}</p>
        </div>
        <div className="p-4 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ct-text-secondary)' }}>
            {t('totalUnclaimed')}
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{data?.summary?.total_unclaimed ?? 0}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-6 rounded-2xl border mb-8" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold" style={{ color: 'var(--ct-text-secondary)' }}>{t('searchGeneral')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--ct-text-secondary)' }} />
              <Input
                placeholder={t('searchPlaceholder')}
                className="pl-10 h-11 rounded-xl border"
                style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}
                value={filters.search}
                onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
              />
            </div>
          </div>

          <div className="space-y-2 w-[140px]">
            <label className="text-xs font-semibold" style={{ color: 'var(--ct-text-secondary)' }}>{t('studentId')}</label>
            <Input
              className="h-11 rounded-xl border"
              style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}
              value={filters.student_id}
              onChange={e => setFilters(p => ({ ...p, student_id: e.target.value, page: 1 }))}
            />
          </div>

          <div className="space-y-2 w-[140px]">
            <label className="text-xs font-semibold" style={{ color: 'var(--ct-text-secondary)' }}>{t('classId')}</label>
            <Input
              className="h-11 rounded-xl border"
              style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}
              value={filters.class_id}
              onChange={e => setFilters(p => ({ ...p, class_id: e.target.value, page: 1 }))}
            />
          </div>

          <div className="space-y-2 w-[120px]">
            <label className="text-xs font-semibold" style={{ color: 'var(--ct-text-secondary)' }}>{t('gradYear')}</label>
            <Input
              type="number"
              className="h-11 rounded-xl border"
              style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}
              value={filters.graduation_year}
              onChange={e => setFilters(p => ({ ...p, graduation_year: e.target.value, page: 1 }))}
            />
          </div>

          <div className="flex items-center gap-4 px-4 h-11 border rounded-xl" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-claimed"
                checked={filters.status?.includes('claimed')}
                onCheckedChange={() => toggleStatusFilter('claimed')}
              />
              <label htmlFor="status-claimed" className="text-sm font-medium cursor-pointer">{t('statusClaimed')}</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-unclaimed"
                checked={filters.status?.includes('unclaimed')}
                onCheckedChange={() => toggleStatusFilter('unclaimed')}
              />
              <label htmlFor="status-unclaimed" className="text-sm font-medium cursor-pointer">{t('statusUnclaimed')}</label>
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            className="h-11 px-6 text-sm font-semibold rounded-xl border-2 transition-all hover:opacity-80 flex items-center gap-2"
            style={{ borderColor: 'var(--ct-text)', color: 'var(--ct-text)' }}
          >
            <RefreshCcw size={16} /> {t('resetFilter')}
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader style={{ background: 'var(--ct-bg)' }}>
              <TableRow className="border-b" style={{ borderColor: 'var(--ct-border)' }}>
                <TableHead className="font-semibold pl-6 pr-4">{t('studentId')}</TableHead>
                <TableHead className="font-semibold px-4">{t('classId')}</TableHead>
                <TableHead className="font-semibold px-4">{t('fullName')}</TableHead>
                <TableHead className="font-semibold px-4">{t('gradYear')}</TableHead>
                <TableHead className="font-semibold px-4">{t('status')}</TableHead>
                <TableHead className="font-semibold px-4">{t('claimedAt')}</TableHead>
                <TableHead className="font-semibold text-right pl-4 pr-6">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b" style={{ borderColor: 'var(--ct-border)' }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j} className={j === 0 ? 'pl-6 pr-4' : j === 6 ? 'pl-4 pr-6' : 'px-4'}>
                        <Skeleton className="h-5 w-full bg-muted/20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !data || data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center" style={{ color: 'var(--ct-text-secondary)' }}>
                    {t('noDataFound')}
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map(item => (
                  <TableRow key={item.id} className="border-b transition-colors hover:bg-muted/5" style={{ borderColor: 'var(--ct-border)' }}>
                    <TableCell className="pl-6 pr-4">{item.student_id}</TableCell>
                    <TableCell className="px-4">{item.class_id}</TableCell>
                    <TableCell className="px-4">{item.full_name}</TableCell>
                    <TableCell className="px-4">{item.graduation_year}</TableCell>
                    <TableCell className="px-4">
                      {item.status === 'claimed' ? (
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">{t('statusClaimed')}</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{t('statusUnclaimed')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4" style={{ color: 'var(--ct-text-secondary)' }}>
                      {formatDateDDMMYYYY(item.claimed_at)}
                    </TableCell>
                    <TableCell className="text-right pl-4 pr-6">
                      <button
                        onClick={() => setSelectedId(item.id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-black/5"
                        style={{ color: 'var(--ct-text)' }}
                      >
                        <Eye size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="py-4 px-6 flex items-center justify-between border-t" style={{ borderColor: 'var(--ct-border)' }}>
          <span className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>
            {t('pageInfo')
              .replace('{page}', String(data?.pagination.page || 1))
              .replace('{total}', String(data?.pagination.total_pages || 1))}
          </span>
          <div className="flex gap-2">
            <button
              disabled={!data || data.pagination.page === 1}
              onClick={() => setPage((data?.pagination.page || 1) - 1)}
              className="p-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5"
              style={{ borderColor: 'var(--ct-border)' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={!data || data.pagination.page >= (data.pagination.total_pages || 1)}
              onClick={() => setPage((data?.pagination.page || 1) + 1)}
              className="p-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5"
              style={{ borderColor: 'var(--ct-border)' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <IssuerCredentialDetailModal
        id={selectedId}
        onClose={() => {
          setSelectedId(null);
          refetch();
        }}
      />
    </div>
  );
}