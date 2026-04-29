#!/bin/bash
set -e

APP_NAME="eigen-anon-review"
IMAGE_TAG="ghcr.io/$(whoami)/${APP_NAME}:latest"

echo "Building Docker image for linux/amd64..."
docker build --platform linux/amd64 -t "$IMAGE_TAG" .

echo "Pushing image to registry..."
docker push "$IMAGE_TAG"

echo "Deploying to EigenCompute..."
rm -f Dockerfile
touch .env

echo "n" | ecloud compute app deploy \
  --name "$APP_NAME" \
  --image-ref "$IMAGE_TAG" \
  --skip-profile \
  --env-file .env \
  --instance-type g1-standard-4t \
  --log-visibility public \
  --resource-usage-monitoring enable \
  --verbose

echo "Restoring Dockerfile..."
git checkout Dockerfile 2>/dev/null || true

echo "Deployment complete!"
echo "Run 'ecloud compute app list' to see your app"
