export type UserRole = 'ExecutiveAdmin' | 'RegionalManager' | 'SocialWorker' | 'Donor';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  privacyPolicyAccepted: boolean;
  cookieConsentAccepted: boolean;
}
