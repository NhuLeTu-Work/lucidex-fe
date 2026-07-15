import { useState } from 'react';
import { mockVerifiedLinks } from '../../data/mockData';
import type { OwnerTab, ClaimStep, VerifiedLink } from '../../types/owner';

export function useOwnerPortal() {
  const [activeTab, setActiveTab] = useState<OwnerTab>('dashboard');
  const [links, setLinks] = useState<VerifiedLink[]>(mockVerifiedLinks as VerifiedLink[]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [claimStep, setClaimStep] = useState<ClaimStep>('form');
  const [otpValue, setOtpValue] = useState('');
  const [showOtpMock, setShowOtpMock] = useState(false);

  const handleRevokeLink = (linkId: string) => {
    setLinks(prev => prev.map(l => l.id === linkId ? { ...l, status: 'revoked', revokedAt: new Date().toISOString() } : l));
  };

  const handleCreateLink = (expiry: string, consentType: string) => {
    const newLink: VerifiedLink = {
      id: `link_${Date.now()}`,
      credentialId: 'cred_001',
      url: `https://lucidex.ctu.edu.vn/v/${Math.random().toString(36).substring(7)}`,
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      expiryLabel: expiry,
      consentType,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setLinks(prev => [newLink, ...prev]);
    setShowCreateModal(false);
  };

  return {
    activeTab, setActiveTab,
    links,
    showCreateModal, setShowCreateModal,
    claimStep, setClaimStep,
    otpValue, setOtpValue,
    showOtpMock, setShowOtpMock,
    handleRevokeLink, handleCreateLink
  };
}