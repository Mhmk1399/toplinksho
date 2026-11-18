# Production deployment

This project is packaged for the existing server architecture described in
`server-inventory.txt`: Docker Compose runs the application on a loopback-only
port and the host Nginx instance provides the public HTTP/HTTPS endpoint.

## Chosen server settings

- Target: Ubuntu 24.04, Linux `amd64`, Docker 29, Compose 2
- Server directory: `/opt/apps/toplinksho`
- Container: `toplinksho-app`
- Private upstream: `127.0.0.1:3140`
- Public endpoint: host Nginx on ports 80 and 443
- Runtime limit: 1 CPU and 768 MiB RAM

Port 3140 is used because the inventory shows 3010 through 3130 already in
use. The container port is deliberately bound to `127.0.0.1`, not the public
network interface.

## 1. Upload the project

Run from the project root on the development machine. Replace `SSH_USER` and
`SERVER_IP` with the real SSH destination:

```bash
rsync -az --delete \
  --exclude='.git' \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='.env*' \
  ./ SSH_USER@SERVER_IP:/opt/apps/toplinksho/
```

The current application does not read any environment variables. The local
`.env` is therefore intentionally excluded and must not be uploaded or copied
into the Docker image.

## 2. Build and start

On the server:

```bash
cd /opt/apps/toplinksho
docker compose build
docker compose up -d
docker compose ps
curl --fail --show-error http://127.0.0.1:3140/
```

For later releases, repeat the upload and run:

```bash
cd /opt/apps/toplinksho
docker compose up -d --build --remove-orphans
docker image prune -f
```

The final prune removes only dangling images from older builds, which matters
because the server inventory reports 12 GiB free disk space.

## 3. Configure Nginx and HTTPS

First create an A record for the production domain pointing to the server IP.
Then, on the server, replace `DOMAIN` in the provided template and install it:

```bash
sed 's/DOMAIN/example.com/g' deploy/nginx/toplinksho.conf.example \
  | sudo tee /etc/nginx/sites-available/toplinksho >/dev/null
sudo ln -s /etc/nginx/sites-available/toplinksho /etc/nginx/sites-enabled/toplinksho
sudo nginx -t
sudo systemctl reload nginx
```

Do not request a certificate until DNS resolves to the server. Once it does:

```bash
sudo certbot --nginx -d example.com -d www.example.com
sudo nginx -t
curl --fail --show-error --head https://example.com/
```

If the site does not use `www`, remove that server name and omit the second
`-d` argument.

## Operations and rollback

Inspect status and logs:

```bash
docker compose -f /opt/apps/toplinksho/compose.yaml ps
docker compose -f /opt/apps/toplinksho/compose.yaml logs --tail=100 app
```

Before an update, optionally preserve the currently working image:

```bash
docker tag toplinksho:latest toplinksho:rollback
```

To roll back:

```bash
cd /opt/apps/toplinksho
docker compose down
docker tag toplinksho:rollback toplinksho:latest
docker compose up -d --no-build
```

