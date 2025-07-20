import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { FC, PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';


// Role/Group required for OIDC Option 1. No defaults! Otherwise requiredEntitlement always has a value
const requiredEntitlement = process.env['REQUIRED_ENTITLEMENT']?.trim() ?? '';

// Role/Group required for OIDC Option 2. No defaults! Otherwise requiredRealmRoles always has a value
const requiredRealmRoles = process.env['REQUIRED_REALM_ROLES']?.split(',') ?? '';

// Define which config to use based on the presence of requiredEntitlement or requiredRealmRoles
const hasRealmRoles = requiredRealmRoles.length > 0;
const hasEntitlement = requiredEntitlement.length > 1;

// OIDC Scope (expects OIDC_SCOPE scopes being separated with commas "," )
const oidcScope = process.env['NEXT_PUBLIC_OIDC_SCOPE']?.split(',').join(' ') ?? 
  'openid email offline_access eduperson_entitlement profile';

const oidcConfig: AuthProviderProps = {
  authority:
    process.env['NEXT_PUBLIC_OAUTH_AUTHORITY']?.trim() ??
    (hasRealmRoles
      ? 'https://login.cloud.ai4eosc.eu/realms/ai4eosc'
      : 'https://aai-demo.egi.eu/auth/realms/egi'),

  client_id: process.env['NEXT_PUBLIC_OIDC_CLIENT_ID'] ?? 'mlflow-dev-ai4eosc',

  redirect_uri: process.env['NEXT_PUBLIC_OIDC_REDIRECT_URL'] ?? 'http://localhost:3000/oidc-redirect',

  scope: oidcScope,

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
