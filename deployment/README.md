# Deployment

Static assets served by `nginx-unprivileged` in a Docker container.
Deployed to Kubernetes via Helm.

## Prerequisites

- `helm` ≥ 3.14
- `kubectl` configured for the target cluster
- GHCR pull secret created in the target namespace (see below)

---

## Local dev

```bash
cp .env.example .env.local
# set VITE_API_URL to the backend address
npm install
npm run dev
```

Build the production bundle:
```bash
npm run build
```

---

## Docker

Build locally (API URL baked in at build time):
```bash
docker build --build-arg VITE_API_URL=http://localhost:8080 -t random-chess-frontend .
docker run -p 8080:8080 random-chess-frontend
```

---

## Helm — install / upgrade

### DEV

```bash
helm upgrade --install random-chess-frontend \
  deployment/helm/random-chess-frontend \
  --namespace random-chess \
  --create-namespace \
  --values deployment/values-dev.yaml \
  --set image.tag=<SHA_OR_TAG>
```

### Dry-run / template preview

```bash
helm template random-chess-frontend deployment/helm/random-chess-frontend \
  --values deployment/values-dev.yaml \
  --set image.tag=dev-latest
```

### Lint

```bash
helm lint deployment/helm/random-chess-frontend
```

---

## Secrets required in the target namespace

| Secret name        | Type                  | Used for         |
|--------------------|-----------------------|------------------|
| `ghcr-random-chess`| `kubernetes.io/dockerconfigjson` | Pull image from GHCR |

Create the GHCR pull secret:
```bash
kubectl create secret docker-registry ghcr-random-chess \
  --namespace random-chess \
  --docker-server=ghcr.io \
  --docker-username=<GITHUB_USER> \
  --docker-password=<GHCR_PAT>
```

---

## GitHub Actions secrets / variables

The deploy workflows require these to be set in the GitHub repository or environment:

| Name              | Kind     | Description                        |
|-------------------|----------|------------------------------------|
| `SSH_PRIVATE_KEY` | Secret   | SSH key for tunnel to K3s host     |
| `KUBECONFIG_B64`  | Secret   | Base64-encoded kubeconfig          |
| `GHCR_PULL_TOKEN` | Secret   | GHCR PAT for creating pull secret  |
| `SSH_HOST`        | Variable | Hostname / IP of the K3s server    |
| `SSH_USER`        | Variable | SSH username on the K3s server     |
