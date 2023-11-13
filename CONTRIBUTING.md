# Thanks for contributing!

Below is a short and sweet guide to contributing to this project. If you have any questions, please feel free to reach to me on [Mastodon](https://hachyderm.io/@parcifal) or raise an issue!

## Pre-requisites

- Node.js v16 or higher, [here](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) is how to install Node.js
- Install Yarn 3, you can read more on this [here](https://yarnpkg.com/getting-started/install)
- Install Docker and Docker Compose, you can read more on this [here](https://docs.docker.com/get-docker/)

## Setting up your environment

Here is what you need to do to get started with this plugin:

- Fork this repository
- Clone your forked repository
- Run `yarn install` in the root of the repository
- Run `docker-compose up -d` in the root of the repository to start up the postgres database and the OPA server
- You can use `yarn start` to start the app in development mode

## Adding the OPA policies to the OPA server

You can add the OPA policies to the OPA server by running the following command:

```bash
curl -X PUT \
--data-binary @rbac_policy.rego \
http://localhost:8181/v1/policies/rbac_policy
```

## Testing the endpoints

You can test the endpoints by running the following command:

`POST /opa/opa-permissions`

```bash
curl -X POST http://localhost:7007/opa/opa-permissions \
-H "Content-Type: application/json" \
-d '{
    "policyInput": {
        "permission": {
            "name": "catalog.entity.delete"
        },
        "identity": {
            "user": "user:default/parsifal-m",
            "claims": [
                "user:default/parsifal-m",
                "group:default/maintainers"
            ]
        }
    }
}'
```

You can do the same as above for the `POST /opa/opa-entity-checker` endpoint.

```bash
{
   "input":{
      "metadata":{
         "namespace":"default",
         "annotations":{
            "backstage.io/managed-by-location":"file:/home/peterm/Personal/brewed-backstage/examples/entities.yaml",
            "backstage.io/managed-by-origin-location":"file:/home/peterm/Personal/brewed-backstage/examples/entities.yaml"
         },
         "name":"example-website",
         "uid":"8daaf1d5-e298-455c-b3c9-ba001b80713d",
         "etag":"5f3d6703c8c025224d6ef27da118c753a3f7fcd9"
      },
      "apiVersion":"backstage.io/v1alpha1",
      "kind":"Component",
      "spec":{
         "type":"website",
         "lifecycle":"experimental",
         "owner":"guests",
         "system":"examples",
         "providesApis":[
            "example-grpc-api"
         ]
      },
      "relations":[
         {
            "type":"ownedBy",
            "targetRef":"group:default/guests",
            "target":{
               "kind":"group",
               "namespace":"default",
               "name":"guests"
            }
         },
         {
            "type":"partOf",
            "targetRef":"system:default/examples",
            "target":{
               "kind":"system",
               "namespace":"default",
               "name":"examples"
            }
         },
         {
            "type":"providesApi",
            "targetRef":"api:default/example-grpc-api",
            "target":{
               "kind":"api",
               "namespace":"default",
               "name":"example-grpc-api"
            }
         }
      ]
   }
}
```

Although, it would be better to use something like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) to test the endpoints.