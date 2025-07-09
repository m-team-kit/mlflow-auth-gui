import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { FC, PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';


const introspectionEndpoint = process.env['NEXT_PUBLIC_OAUTH_INTROSPECTION_ENDPOINT'] ?? 
                      process.env['OAUTH_INTROSPECTION_ENDPOINT'] ?? '';
const isAI4EOSC = introspectionEndpoint.includes('ai4eosc');

// Role/Group validation for AI4EOSC
//const requiredGroupAI4EOSC = process.env['REQUIRED_GROUP_AI4EOSC'] ?? 'vo.ai4eosc.eu';
const requiredRealmRoles = process.env['REQUIRED_REALM_ROLES_AI4EOSC']?.split(',') ?? ['vo.ai4eosc.eu', 'platform-access:vo.ai4eosc.eu'];

// Role/Group validation for EGI
const requiredEntitlement = process.env['REQUIRED_ENTITLEMENT'] ?? 'urn:mace:egi.eu:group:vo.ai4eosc.eu:role=member#aai.egi.eu';

// Validation function for AI4EOSC user roles
const validateAI4EOSCUser = (userInfo: any): boolean => {
  const realmRoles = userInfo?.realm_access?.roles || [];
  const groups = userInfo?.groups || [];
  
  // Check if user has required group
  //const hasRequiredGroup = groups.includes(requiredGroupAI4EOSC);
  
  // Check if user has all required realm roles
  const hasRequiredRoles = requiredRealmRoles.every(role => realmRoles.includes(role));
  
  //return hasRequiredGroup && hasRequiredRoles;
  return hasRequiredRoles;
};

// Validation function for EGI user entitlements
const validateEGIUser = (userInfo: any): boolean => {
  const entitlements = userInfo?.eduperson_entitlement || [];
  return entitlements.includes(requiredEntitlement);
};

const oidcConfig: AuthProviderProps = {
  authority: isAI4EOSC
    ? 'https://login.cloud.ai4eosc.eu/realms/ai4eosc'
    : 'https://aai-demo.egi.eu/auth/realms/egi',
  client_id: process.env['NEXT_PUBLIC_OIDC_CLIENT_ID'] ?? (isAI4EOSC ? 'mlflow-dev-ai4eosc' : 'eosc-performance'),
  redirect_uri: process.env['NEXT_PUBLIC_OIDC_REDIRECT_URL'] ?? 'http://localhost:3000/oidc-redirect',
  scope: isAI4EOSC
    ? ['openid', 'email', 'profile', 'offline_access'].join(' ')
    : ['openid', 'email', 'eduperson_entitlement', 'offline_access', 'profile'].join(' '),
  response_type: 'code',
};

// Main validation function that chooses the appropriate validator based on provider
const validateUser = (userInfo: any): boolean => {
  return isAI4EOSC 
    ? validateAI4EOSCUser(userInfo) 
    : validateEGIUser(userInfo);
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
