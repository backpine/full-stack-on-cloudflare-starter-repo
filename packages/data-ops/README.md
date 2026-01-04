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

## Link 
CRUD

### Create
You can create a link 

### Read/List
You can read/list link(s)


### Update
There are two different operations that can be performed on a link.
They are exposed as two methods
- update link name
- update link destination