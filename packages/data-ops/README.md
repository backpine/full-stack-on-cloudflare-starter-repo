# Data-ops
This is the repo that will contain all the data ops scripts to be shared. 

## Sync the D1 db to define schema
Run `pnpm run pull` in the `data-ops` package. 

Create `src/dirzzle-out` that will have the schema for the D1 db.
```zsh
pnpm run pull
```

## Building

This will build the project with tsc
```zsh
pnpm run build
```