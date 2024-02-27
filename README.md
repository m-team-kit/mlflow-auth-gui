[![SQAaaS badge](https://github.com/EOSC-synergy/SQAaaS/raw/master/badges/badges_150x116/badge_software_silver.png)](https://api.eu.badgr.io/public/assertions/_am9qRYnSGCcG-MzsW6UdQ "SQAaaS silver badge achieved")

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-1.4-4baaaa.svg)](CODE_OF_CONDUCT.md)
# MLflow Auth GUI

This web application provides a Web GUI to the [MLflow Authentication API](https://mlflow.org/docs/latest/auth/rest-api.html).

GUI provides:
* self-registration of users in MLflow
* self-registration service requires Authentication via a pre-configured OIDC Provider (e.g. [EGI Check-In](https://docs.egi.eu/users/aai/check-in/))
* one can limit users eligible for self-registration using `REQUIRED_ENTITLEMENT`
* created in the MLflow user name is the email address retrieved from the OIDC token (registered email)
* after the user is registered in MLflow, he/she can:
   * update his/her MLflow password
   * update permissions to his/her experiments
   * update permissions to his/her registered models
   * delete account

## Deployment

The deployment is containerised and includes provision of the fully running MLflow service:
* GUI for the MLflow Authentication REST API (frontend + backend)
* MLflow instance
* Postgresql database as the backend store
* databases backup
* traefik reverse proxy

docker compose configuration is based on [awesome-compose](https://github.com/docker/awesome-compose).

### Configuration

Customize deployment with an `.env` file from `.env.sample`.

### Deploy for development

Use `docker compose up -d`, docker compose overrides automatically using
`compose.override.yml` file.

### Deploy in Production

Use:

```bash
docker compose -f compose.yml -f compose.prod.yml up -d
```

## Usage
For the example usage, please, see [https://docs.ai4os.eu/en/latest/user/howto/mlops/mlflow.html](https://docs.ai4os.eu/en/latest/user/howto/mlops/mlflow.html)

## Contributing
Please, see our [CONTRIBUTING](CONTRIBUTING.md) description and the [CODE OF CONDUCT](CODE_OF_CONDUCT.md).

## License
This code is distributed under the Apache 2.0 License. Please, see the [LICENSE](LICENSE) file.

Copyright (c) 2023 - 2024 Karlsruhe Institute of Technology - Scientific Computing Center.
