# MLFlow Docker Compose

Based on [awesome-compose](https://github.com/docker/awesome-compose).

## Getting started

1.  Customize deployment with a `.env` file from `.env.sample`.
2.  Create a database password on `database/password` file.

## Development

Use `docker compose up -d`, docker compose overrides automatically using
`docker-compose.override.yml` file.

## Production

Use:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
