export type UserRole = 'ExecutiveAdmin' | 'RegionalManager' | 'SocialWorker' | 'Donor';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  privacyPolicyAccepted: boolean;
  cookieConsentAccepted: boolean;
  /** Set for regional managers (and others linked to a site). */
  safehouseId?: number | null;
}
