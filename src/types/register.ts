export type RegistrationRole = 'owner' | 'issuer' | 'verifier';

export interface BusinessData {
  orgName: string;
  taxCode: string;
  address: string;
  legalRep: string;
  email: string;
  phone: string;
  regName: string;
  regTitle: string;
}