import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { FC, PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';

const oidcConfig: AuthProviderProps = {
  authority:
    process.env['NEXT_PUBLIC_OAUTH_AUTHORITY'] ??
    (process.env.NODE_ENV === 'development'
      ? 'https://aai-demo.egi.eu/auth/realms/egi/'
      : 'https://aai.egi.eu/auth/realms/egi/'),
  client_id: process.env['NEXT_PUBLIC_OIDC_CLIENT_ID'] ?? 'eosc-performance',
  redirect_uri:
    process.env['NEXT_PUBLIC_OIDC_REDIRECT_URL'] ?? 'http://localhost:3000/oidc-redirect',
  scope: [
    // basic
    'openid',
    // oidc email used as identifier
    'email',
    // required to check group memberships for access
    'eduperson_entitlement',
    // required for refreshing tokens
    'offline_access',
    // vault secrets api requires having a name
    'profile',
  ].join(' '),
  //autoSignIn: false,
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
