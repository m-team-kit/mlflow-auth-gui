'use client';

import type { Metadata } from 'next';
import { FC } from 'react';

import config from '../next.config';

// does not work (yet):
// https://github.com/vercel/next.js/issues/45620
export const metadata: Metadata = {
  title: '404',
};

const Error: FC = () => {
  return (
    <>
      <h1>Page not found</h1>
      <div className="flex justify-center">
        <a href={config.basePath}>Go back</a>
      </div>
    </>
  );
};

export default Error;
