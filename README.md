Starts an HTTP proxy server to the SponsorBlock API. Also runs a healthcheck every minute against the main server and falls back to a mirror when the main server is unhealthy.

To run locally, just run `npm install` and then `npm start`. the server will start at `http://localhost:4480/`, or execute with Docker Compose: `docker compose up -d`. Note that the compose file uses a pre-built image from Docker Hub, so i is not intended for local development.

To deploy to a remote server, I use a simple NGINX setup:
```
  server {
    listen 80;
    server_name sponsorblock-proxy.<YOUR DOMAIN>;
    location / {
      proxy_pass http://localhost:4480;
    }
  }
```
A running instance is currently up in `https://sponsorblock-proxy.lucashmsilva.com`
