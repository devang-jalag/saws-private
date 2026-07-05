# Messaging + Notifications module

Independent microservice covering:

- **Messaging** (GCP: Pub/Sub + Cloud Functions + Firestore) — a patient submits a concern,
  it's routed to a random active coordinator, and both sides can chat in real time.
- **Notifications** (AWS: SNS + SQS + Lambda) — fans registration/login/booking/
  cancellation/reminder events out to a per-user notification history.

This folder is self-contained: its own code, its own tests, its own Terraform. It reads
the Auth module's Cognito user pool and the Appointments/Users tables **by name** (via
variables/env vars), not by depending on their Terraform - it deploys independently of
whatever your teammates build.

See [API.md](./API.md) for every endpoint with real request/response payloads captured
from an actual deployment.

```
aws/                AWS Lambda side (Notifications)
  shared/            dynamo/response/auth-context helpers
  notifications/     subscriber, getMine, reminder + their logic
  scripts/           local dev helpers (seed data, invoke handlers directly)
gcp/                GCP Cloud Functions side (Messaging)
  *.js               submitConcern, assignCoordinator, respondToConcern, listConcerns
  scripts/           local dev helper for the Pub/Sub-triggered function
infra/               Terraform for both sides
```

## Running the tests

Pure-logic unit tests need no cloud services at all:

```bash
cd aws && npm install && npm test     # coordinator... reminder scheduling, SNS envelope parsing
cd gcp && npm install && npm test     # random-but-only-active coordinator assignment
```

## Running it locally

You don't need a real AWS/GCP account to exercise the actual code paths. Two local
environments, one for each cloud side.

### AWS side (Notifications) — DynamoDB Local

```bash
docker run -d --name saws-dynamodb-local -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -inMemory -sharedDb

cd aws
export DYNAMODB_ENDPOINT=http://localhost:8000
export AWS_ACCESS_KEY_ID=local AWS_SECRET_ACCESS_KEY=local AWS_REGION=us-east-1

npm run seed:local          # creates saws-notifications/-users/-appointments, seeds 1 coordinator + 1 appointment due tomorrow
npm run dev:subscriber -- BOOKING user_patient_1 "Your appointment is confirmed."
npm run dev:get-mine -- user_patient_1     # reads back the notification just written
npm run dev:reminder                        # scans Appointments, finds tomorrow's CONFIRMED one
```

Verified working end-to-end in this repo: `dev:subscriber` writes a row, `dev:get-mine`
reads it straight back, and `dev:reminder` correctly finds the seeded appointment due
tomorrow (it reaches the SNS publish call and stops there - see caveat below).

**Caveat:** `dev:reminder` (and the deployed `reminder`/`assignCoordinator`/
`respondToConcern` Lambdas) also call `sns.send(...)`. There's no SNS emulator without
[LocalStack](https://github.com/localstack/localstack); set `SNS_ENDPOINT=http://localhost:4566`
if you have LocalStack running, otherwise expect an `InvalidClientTokenId` error at that
last step - everything before it (the DynamoDB read/write logic) still ran for real.

### GCP side (Messaging) — functions-framework + Firestore emulator

```bash
cd gcp
npm install
export LOCAL_DEV=true   # skips real Cognito JWKS verification for local testing

npm run dev:submit-concern       # serves submitConcern on :8081
curl -X POST http://localhost:8081/ \
  -H "Content-Type: application/json" \
  -H 'Authorization: Bearer {"userId":"user_patient_1","role":"PATIENT"}' \
  -d '{"concernText":"I cannot find my appointment reference code."}'
```

Verified working in this repo: the request reaches the handler, passes the `LOCAL_DEV`
auth bypass and field validation, and fails only at the Pub/Sub publish call (no project/
emulator configured) - same "logic proven, external call is the boundary" story as the
AWS side.

For the Firestore-backed endpoints (`listConcerns`, `respondToConcern`) and the
Pub/Sub-triggered `assignCoordinator`, you'd normally add:

```bash
firebase emulators:start --only firestore --project demo-saws
export FIRESTORE_EMULATOR_HOST=localhost:8080
npm run dev:assign-coordinator -- concern_001 user_patient_1 "test concern"
npm run dev:list-concerns        # serves on :8083
npm run dev:respond-to-concern   # serves on :8082
```

`@google-cloud/firestore` auto-connects to `FIRESTORE_EMULATOR_HOST` with no code changes.
**Note:** the `firebase-tools` install in this particular dev environment is broken
(unrelated to this repo - a corrupted global npm install), so the Firestore emulator step
above is documented but not verified here. If `firebase emulators:start` errors on a
missing file under `firebase-tools/lib/...`, reinstall it (`npm i -g firebase-tools`)
rather than debugging the existing install.

`assignCoordinator` reads the Users table cross-cloud via AWS SDK, so it needs the same
`DYNAMODB_ENDPOINT`/`AWS_*` env vars as the AWS side, seeded with at least one
`role: "COORDINATOR"` user (the `seed:local` script above already writes one).

## Deploying

State is stored in GitLab's built-in Terraform-state HTTP backend (`backend "http" {}` in
`providers.tf`), not locally - this way local ad-hoc runs and CI never disagree about
what's already deployed. That means `terraform init` needs backend-config flags even for
a local run:

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # fill in user_pool_id, table names, GCP project, etc.

PROJECT_ID=<find this on the GitLab project page, under the project name>
terraform init \
  -backend-config="address=https://git.cs.dal.ca/api/v4/projects/${PROJECT_ID}/terraform/state/messaging-notifications" \
  -backend-config="lock_address=https://git.cs.dal.ca/api/v4/projects/${PROJECT_ID}/terraform/state/messaging-notifications/lock" \
  -backend-config="unlock_address=https://git.cs.dal.ca/api/v4/projects/${PROJECT_ID}/terraform/state/messaging-notifications/lock" \
  -backend-config="username=<your-gitlab-username>" \
  -backend-config="password=<a GitLab personal access token with 'api' scope>" \
  -backend-config="lock_method=POST" \
  -backend-config="unlock_method=DELETE" \
  -backend-config="retry_wait_min=5"

terraform plan
terraform apply
```

Requirements on whatever machine runs `terraform apply`: Terraform itself, and Node.js +
npm on `PATH` (the AWS Lambda package is built automatically as part of `apply` - see
below - there is no separate manual build step).

### Or via CI/CD instead

`.gitlab-ci.yml` at the repo root runs this same deploy through a pipeline: `fmt`/
`validate` on every push, `plan` on merge requests and `main`, `apply`/`destroy` as a
manual gate on `main` (so nothing deploys without a person clicking it). It needs these
CI/CD variables set (Settings > CI/CD > Variables) - see the comments at the top of
`.gitlab-ci.yml` for the full list and types:

- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` (the last one only
  if using temporary/STS creds like Learner Lab issues)
- `GCP_SA_KEY_FILE` - a GCP service account JSON key, since `gcloud auth
  application-default login`'s browser flow can't run on a CI runner. Create one with:
  ```bash
  gcloud iam service-accounts create saws-ci-deployer
  gcloud projects add-iam-policy-binding <project-id> \
    --member="serviceAccount:saws-ci-deployer@<project-id>.iam.gserviceaccount.com" \
    --role="roles/editor"
  gcloud iam service-accounts keys create key.json \
    --iam-account=saws-ci-deployer@<project-id>.iam.gserviceaccount.com
  ```
  then paste `key.json`'s contents into a **File**-type CI/CD variable named
  `GCP_SA_KEY_FILE`.
- `TF_VAR_*` variables matching everything in `terraform.tfvars.example` (Terraform
  reads `TF_VAR_x` env vars automatically - no tfvars file needed in CI at all).

**Learner Lab doesn't fit CI/CD well**: sessions expire in a few hours, so you'd be
manually refreshing the `AWS_SESSION_TOKEN` CI variable before nearly every pipeline run,
which defeats a lot of the point. This works best once deploying with a permanent IAM
user's keys.

`terraform validate` passes, and a `terraform plan` with placeholder credentials gets as
far as computing both cloud sides' deployment packages and stops only at the real
AWS/GCP credential check (`GetCallerIdentity` / GCP ADC) - i.e. the only thing stopping a
real `apply` is filling in real values, not a config bug.

**Cross-module inputs you need real values for** (owned by teammates' modules, not
created here): `user_pool_id`, `user_pool_client_id` (Auth), `users_table_name`,
`appointments_table_name` (defaults match the naming convention in the other modules'
docs - override if your teammates named theirs differently).

**Packaging, handled automatically:**
- AWS Lambda has no build step of its own, so a `null_resource` runs `npm ci --omit=dev`
  into `infra/.build/aws-src` (a throwaway copy - your real `aws/node_modules`, which still
  has `jest` for local testing, is never touched) before zipping. It only reruns when the
  Lambda source actually changes.
- GCP Cloud Functions gen2 builds from source with Buildpacks, which run their own
  production `npm install` from `package.json` - so the GCP archive deliberately excludes
  `node_modules` entirely rather than shipping ~90MB of it.

**AWS Academy Learner Lab:** Learner Lab sandboxes typically block `iam:CreateRole`/
`iam:PutRolePolicy` entirely, so the default (each Lambda gets its own least-privilege
role) will fail immediately in that kind of account. Set `existing_lambda_role_arn` in
`terraform.tfvars` to your lab's pre-existing role ARN (commonly `LabRole` - find it with
`aws iam list-roles --query "Roles[?RoleName=='LabRole'].Arn"`) and every Lambda uses that
role instead; no custom policies get attached to it, so it relies on LabRole's own
(typically broad) permissions.

**Not fully wired for you, by design:**
- **Cross-cloud AWS credentials** (`gcp_functions_aws_access_key_id/secret`) are passed to
  GCP as plain environment variables - acceptable for a graded sprint demo, not something
  to reuse verbatim for a real deployment (use Secret Manager / a scoped IAM user, not your
  personal AWS keys).
