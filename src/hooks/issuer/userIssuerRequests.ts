import { useState } from 'react';
import { mockReviewQueue } from '../../data/mockData';
import type { ReviewItem } from '../../data/mockData';
import type { IssuerTab, UploadState } from '../../types/issuer';

export function useIssuerPortal() {
  const [activeTab, setActiveTab] = useState<IssuerTab>('dashboard');
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(mockReviewQueue);
  const [uploadState, setUploadState] = useState<UploadState>('idle');

  const handleApprove = (id: string) => {
    setReviewItems(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
  };

  const handleReject = (id: string) => {
    setReviewItems(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
  };

  const handleUpload = () => {
    setUploadState('uploading');
    setTimeout(() => setUploadState('success'), 2000);
  };

  const pendingCount = reviewItems.filter(r => r.status === 'pending').length;

  return {
    activeTab, setActiveTab,
    reviewItems,
    uploadState,
    handleApprove, handleReject, handleUpload,
    pendingCount
  };
}