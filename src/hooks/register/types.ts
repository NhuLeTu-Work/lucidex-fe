import type { RegistrationRole, BusinessData } from '../../types/register';
import type { useRegisterState } from './useRegisterState';

export type RegisterState = ReturnType<typeof useRegisterState>;
export type { RegistrationRole, BusinessData };