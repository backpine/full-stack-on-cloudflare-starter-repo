# cf-services-the-course-playground

[Course videos](https://learn.backpine.com/full-stack-on-cloudflare/687af278-494d-4375-977f-cb4303da1c48)
[Course repo](https://github.com/backpine/full-stack-on-cloudflare-starter-repo)
[My repo](https://github.com/sanchezg7/full-stack-on-cloudflare-starter-repo)


Mono repo setup.
Multiple apps packaged in a single repo
There are two different services. 

## Services

## Packages
### data-ops
`data-ops` is shared and must be built before it gets used. 

## Apps
### user-application
user-application is the ui
### data-service
`data-service` will do all of the data operations

## Deployment
We want to continuously deploy. 
Refer to `apps/user-application/README.md` for how to deploy it. 

## Architecture

### Cloudflare KV
[KV Dashboard - Staging](https://dash.cloudflare.com/dba950c0645b0e21ff1ef9d7465012ac/workers/kv/namespaces/3e3c3f86ef414f8ea08e7144f5697e29/metrics)
