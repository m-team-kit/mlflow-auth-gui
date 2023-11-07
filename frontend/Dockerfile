FROM node:20-alpine as base

ENV YARN_VERSION 4.0.1
RUN yarn policies set-version $YARN_VERSION

WORKDIR /app
COPY [".yarn/releases", ".yarn/releases"]
COPY [".env", ".eslintrc.json", ".prettierrc", ".yarnrc.yml", "next.config.js", "next-env.d.ts", "package.json", "postcss.config.js", "tailwind.config.ts", "tsconfig.json", "yarn.lock", "./"]
ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn install --immutable

COPY app app
COPY components components
COPY lib lib
COPY public public

FROM base as prod-build

ARG OIDC_AUTHORITY
ENV NEXT_PUBLIC_OAUTH_AUTHORITY=${OIDC_AUTHORITY}
ARG OIDC_CLIENT_ID
ENV NEXT_PUBLIC_OIDC_CLIENT_ID=${OIDC_CLIENT_ID}
ARG OIDC_REDIRECT_URI
ENV NEXT_PUBLIC_OIDC_REDIRECT_URL=${OIDC_REDIRECT_URI}
ARG PRIVACY_POLICY_URL
ENV NEXT_PUBLIC_PRIVACY_POLICY_URL=${PRIVACY_POLICY_URL}
ARG TERMS_OF_USE_URL
ENV NEXT_PUBLIC_TERMS_OF_USE_URL=${TERMS_OF_USE_URL}

RUN yarn run build

FROM node:20-alpine as production
# intermediary build stage that only copies the files from nextjs standalone build,
#  which does not carry unused code
# this should also drop envs from previous steps

# TODO: is this necessary?
ENV NODE_ENV=production

WORKDIR /app
COPY --from=prod-build /app/package.json .
COPY --from=prod-build /app/yarn.lock .
COPY --from=prod-build /app/next.config.js .
COPY --from=prod-build /app/public ./public
COPY --from=prod-build /app/.next/static ./.next/static
COPY --from=prod-build /app/.next/standalone ./

EXPOSE 3000
CMD ["node", "server.js"]

FROM base as development
ENV NODE_ENV=development

EXPOSE 3000
CMD [ "yarn", "dev" ]
