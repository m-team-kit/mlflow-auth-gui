import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { FC, PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';


// Role/Group required for OIDC Option 1
const requiredEntitlement = process.env['REQUIRED_ENTITLEMENT'] ?? 'urn:mace:egi.eu:group:vo.ai4eosc.eu:role=member#aai.egi.eu';

// Role/Group required for OIDC Option 2
const requiredRealmRoles = process.env['REQUIRED_REALM_ROLES']?.split(',') ?? ['vo.ai4eosc.eu', 'platform-access:vo.ai4eosc.eu'];


// Define which config to use based on the presence of requiredEntitlement or requiredRealmRoles
const hasRealmRoles = requiredRealmRoles.length > 0;
const hasEntitlement = requiredEntitlement.trim().length > 0;

const oidcConfig: AuthProviderProps = {
  authority: hasRealmRoles
    ? (process.env['NEXT_PUBLIC_OAUTH_AUTHORITY']?.trim() || 'https://login.cloud.ai4eosc.eu/realms/ai4eosc')
    : hasEntitlement
    ? (process.env['NEXT_PUBLIC_OAUTH_AUTHORITY']?.trim() || 'https://aai-demo.egi.eu/auth/realms/egi')
    : '',

  client_id: process.env['NEXT_PUBLIC_OIDC_CLIENT_ID'] ?? (hasRealmRoles ? 'mlflow-dev-ai4eosc' : 'eosc-performance'),

  redirect_uri: process.env['NEXT_PUBLIC_OIDC_REDIRECT_URL'] ?? 'http://localhost:3000/oidc-redirect',

  scope: hasRealmRoles
    ? ['openid', 'email', 'profile', 'offline_access'].join(' ')
    : hasEntitlement
    ? ['openid', 'email', 'eduperson_entitlement', 'offline_access', 'profile'].join(' ')
    : '',

  response_type: 'code',
};

const AuthContext: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();

  return (
    <AuthProvider
      {...oidcConfig}
      onSigninCallback={() => {
        router.push('/');
      }}
    >
      {children}
    </AuthProvider>
  );
};

export default AuthContext;
