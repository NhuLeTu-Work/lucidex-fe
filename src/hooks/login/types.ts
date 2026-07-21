import type { Account } from '../../data/mockData';
import type { LoginView, OtpMethod } from '../../types/login';
import type { useLoginState } from './useLoginState';

export type LoginState = ReturnType<typeof useLoginState>;
export type { Account, LoginView, OtpMethod };