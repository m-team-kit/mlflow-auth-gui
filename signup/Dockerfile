FROM node:22-alpine AS base

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY [".env", ".eslintrc.json", ".prettierrc", "next.config.js", "next-env.d.ts", "package.json", "postcss.config.js", "tailwind.config.ts", "tsconfig.json", "pnpm-lock.yaml", "./"]
ENV NEXT_TELEMETRY_DISABLED=1

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY app app
COPY components components
COPY lib lib

FROM base AS prod-build

WORKDIR /app
ARG OIDC_AUTHORITY
ENV NEXT_PUBLIC_OAUTH_AUTHORITY=${OIDC_AUTHORITY}
ARG OIDC_CLIENT_ID
ENV NEXT_PUBLIC_OIDC_CLIENT_ID=${OIDC_CLIENT_ID}
ARG OIDC_REDIRECT_URI
ENV NEXT_PUBLIC_OIDC_REDIRECT_URL=${OIDC_REDIRECT_URI}
ARG OIDC_SCOPE
ENV NEXT_PUBLIC_OIDC_SCOPE=${OIDC_SCOPE}
ARG PRIVACY_POLICY_URL
ENV NEXT_PUBLIC_PRIVACY_POLICY_URL=${PRIVACY_POLICY_URL}
ARG TERMS_OF_USE_URL
ENV NEXT_PUBLIC_TERMS_OF_USE_URL=${TERMS_OF_USE_URL}

RUN pnpm run build

FROM node:22-alpine AS production
# intermediary build stage that only copies the files from nextjs standalone build,
#  which does not carry unused code
# this should also drop envs from previous steps

# TODO: is this necessary?
ENV NODE_ENV=production

WORKDIR /app
COPY --from=prod-build /app/package.json .
COPY --from=prod-build /app/pnpm-lock.yaml .
COPY --from=prod-build /app/next.config.js .
#COPY --from=prod-build /app/public ./public
COPY --from=prod-build /app/.next/static ./.next/static
COPY --from=prod-build /app/.next/standalone ./

EXPOSE 3000
CMD ["node", "server.js"]

FROM base AS development
ENV NODE_ENV=development

EXPOSE 3000
CMD [ "pnpm", "run", "dev" ]
