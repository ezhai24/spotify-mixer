interface UserAuth {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  [key: string]: any;
};

export interface SessionUser {
  isPrimaryUser?: boolean;
  displayName?: string;
  sessionId?: string;
  auth?: UserAuth;
};
