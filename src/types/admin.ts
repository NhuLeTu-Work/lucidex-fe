export interface RegistrationData {
  orgName: string;
  taxCode: string;
  address: string;
  legalRep: string;
  contactPhone: string;
  regName: string;
  regTitle?: string;
  submittedAt: string;
  rejectedReason?: string;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  type: 'owner' | 'issuer' | 'verifier' | 'admin';
  status: 'active' | 'inactive' | 'pending' | 'setup_required' | 'rejected';
  createdAt: string;
  lastActive: string;
  registrationData?: RegistrationData;
}

export type AdminTab = 'dashboard' | 'requests' | 'accounts';
export type RequestSubTab = 'issuer' | 'verifier';