# MLFlow Docker Compose

Based on [awesome-compose](https://github.com/docker/awesome-compose).

## Getting started

Customize deployment with a `.env` file from `.env.sample`.

## Development

Use `docker compose up -d`, docker compose overrides automatically using
`docker-compose.override.yml` file.

## Production

Use:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
