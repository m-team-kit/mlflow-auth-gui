[![SQAaaS badge](https://github.com/EOSC-synergy/SQAaaS/raw/master/badges/badges_150x116/badge_software_silver.png)](https://api.eu.badgr.io/public/assertions/_am9qRYnSGCcG-MzsW6UdQ "SQAaaS silver badge achieved")

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-1.4-4baaaa.svg)](CODE_OF_CONDUCT.md)

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.10689853.svg)](https://doi.org/10.5281/zenodo.10689853)

# MLflow Auth GUI

This web application provides a Web GUI to the [MLflow Authentication API](https://mlflow.org/docs/latest/auth/rest-api.html).

GUI provides:
* self-registration of users in MLflow
* self-registration service requires Authentication via a pre-configured OIDC Provider (e.g. [EGI Check-In](https://docs.egi.eu/users/aai/check-in/))
* one can limit users eligible for self-registration using either `REQUIRED_ENTITLEMENT` (`eduperson_entitlement`) OR `REQUIRED_REALM_ROLES` (`realm.roles`), depending on what Identity Provider (IdP) supports
* created in the MLflow user name is the email address retrieved from the OIDC token (registered email)
* optionally, the MLflow user credentials are stored in the HashiCorp Vault Secret storage via AI4OS Platform API ([ai4-papi](https://github.com/ai4os/ai4-papi)) 
* after the user is registered in MLflow, he/she can:
   * update his/her MLflow password
   * update permissions to his/her experiments
   * update permissions to his/her registered models
   * delete account

## Deployment

The deployment is containerised and includes provision of the fully running MLflow service:
* GUI for the MLflow Authentication REST API (aka `signup` service)
* MLflow instance (`mlflow` service)
* Postgresql database as the backend store (`database` service)
* databases backup (`backup_db` service)
* traefik reverse proxy (`reverse-proxy` service)

docker compose configuration is based on [awesome-compose](https://github.com/docker/awesome-compose).

### Configuration

Copy `.env.sample` to `.env` and customize the values for your deployment.

Ensure `MLFLOW_USERNAME` & `MLFLOW_PASSWORD` in .env and `admin_username` & `admin_password` in backend/srv/auth_config.ini match.

OR

Once deployed, use e.g. [mlflow_auth](https://codebase.helmholtz.cloud/m-team/ai/mlflow_auth) scripts to update MLflow admin user to match `MLFLOW_USERNAME` & `MLFLOW_PASSWORD`.

If setting up on windows, launch the compose once to create volumes & files, then uncomment `user: postgres` in compose.yml.

### Deploy for development

1. Use `docker compose up -d`, docker compose overrides automatically using
   `compose.override.yml` file.
2. In `signup`:
    1. Install dependencies: `yarn install`
    2. Verify the env in .env, override it in .env.local if necessary
    3. Run `yarn dev` to start the development server

### Deploy in Production

Use:

```bash
docker compose -f compose.yml -f compose.prod.yml up -d
```

To re-build one of the services, e.g. "signup", use:

```bash
docker compose -f compose.yml -f compose.prod.yml up -d --build signup
```

## Usage
For the example usage, please, see [https://docs.ai4os.eu/en/latest/user/howto/mlops/mlflow.html](https://docs.ai4os.eu/en/latest/user/howto/mlops/mlflow.html)

## Contributing
Please, see our [CONTRIBUTING](CONTRIBUTING.md) description and the [CODE OF CONDUCT](CODE_OF_CONDUCT.md).

## License
This code is distributed under the Apache 2.0 License. Please, see the [LICENSE](LICENSE) file.

Copyright (c) 2023 - 2025 Karlsruhe Institute of Technology - Scientific Computing Center.
