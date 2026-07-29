#!/bin/bash
set -e

# Configuration
PROJECT_ID="saws-lambda-legends-503718"
REGION="us-central1"
REPO_NAME="saws-frontend-repo"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/saws-frontend:latest"

echo "=== SAWS Frontend Cloud Run Deployment Script ==="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# 1. Enable Required APIs
echo "[1/4] Enabling required GCP APIs..."
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project $PROJECT_ID

# 2. Apply Terraform to create the Artifact Registry first
echo "[2/4] Provisioning Artifact Registry via Terraform..."
cd terraform/modules/frontend
terraform init
# Apply the artifact registry first so we can push the image to it
terraform apply -target=google_artifact_registry_repository.frontend_repo -auto-approve -var="project_id=${PROJECT_ID}" -var="region=${REGION}"
cd ../../..

echo "Waiting 20 seconds for Artifact Registry to fully propagate across GCP..."
sleep 20

# Just in case Terraform failed silently, let's ensure it exists via gcloud
gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --project=$PROJECT_ID 2>/dev/null || true

# 3. Build and push Docker image using Cloud Build
echo "[3/4] Building Docker image for frontend using Cloud Build..."
cd frontend
gcloud builds submit --tag $IMAGE_NAME --project $PROJECT_ID
cd ..

# 4. Apply Terraform to deploy the Cloud Run service
echo "[4/4] Deploying Cloud Run service via Terraform..."
cd terraform/modules/frontend
terraform apply -auto-approve -var="project_id=${PROJECT_ID}" -var="region=${REGION}" -var="image_name=${IMAGE_NAME}"

echo ""
echo "=== Deployment Complete ==="
echo "Your frontend URL should be listed in the terraform outputs above!"
