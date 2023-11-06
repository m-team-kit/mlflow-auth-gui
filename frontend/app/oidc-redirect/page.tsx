'use client';

import { type FC } from 'react';
import AuthContext from '@/components/AuthContext';

const OidcRedirect: FC = () => {
  return <main>Redirecting...</main>;
};

const Page: FC = () => {
  return (
    <AuthContext>
      <OidcRedirect />
    </AuthContext>
  );
};

export default Page;
