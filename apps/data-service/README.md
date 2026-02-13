# Data Service

## Deployment

```zsh
pnpm run deploy

> data-service@0.0.0 deploy /Users/gerardo/dev/learning/full-stack-on-cloudflare-starter-repo/apps/data-service
> wrangler deploy


 ⛅️ wrangler 4.59.3 (update available 4.61.1)
─────────────────────────────────────────────
Total Upload: 23.62 KiB / gzip: 5.61 KiB
Worker Startup Time: 15 ms
Uploaded data-service (2.32 sec)
Deployed data-service triggers (5.90 sec)
  https://data-service.noisy-resonance-8ddf.workers.dev
Current Version ID: f2125c26-6fdf-41e7-8124-a0eccfd781ec
```

Test the deployment worked
```zsh
curl https://data-service.noisy-resonance-8ddf.workers.dev/
Hello World!%
```
