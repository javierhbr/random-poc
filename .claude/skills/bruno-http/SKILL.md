---
name: bruno-http
description: Use the Bruno HTTP CLI (`bru run`) instead of curl whenever calling, testing, or hitting any HTTP/REST endpoint of the local project. Triggers on curl, HTTP requests, API calls, "hit the endpoint", testing a route, or sending a request.
---

# Bruno HTTP CLI (use instead of curl)

When you need to call, test, or hit an HTTP/REST endpoint of **this local project**,
use the Bruno HTTP CLI (`bru run`) — **do not use `curl`**.

`curl` is acceptable only for throwaway / non-project checks the user explicitly asks for.

## Preflight

1. Confirm the CLI is available: `bru --version`.
   - If missing, tell the user to install it (do **not** install silently):
     `npm install -g @usebruno/cli`
2. Confirm a Bruno collection exists in the repo (a `bruno.json` at the collection root,
   alongside `.bru` request files).
   - If **no** collection exists, say so and ask the user how to proceed (e.g. point you
     at an existing collection or have them create one in the Bruno app). Do not improvise
     a `.bru` file — this skill is redirect + reference only.
3. Run `bru run` from inside the collection directory.

## Command reference

```bash
bru run                                  # run the whole collection
bru run <folder>                         # run all requests in a folder

# Environments
bru run --env <Name>                     # use a named environment
bru run --env-file ./environments/local.bru   # .bru env file (relative or absolute)
bru run --env-file /path/to/env.json     # JSON env file (Bruno schema)
bru run --global-env <Name>              # workspace/global environment
bru run --global-env <Name> --workspace-path <path/from/collection/root>

# Variables (repeatable; pass secrets here — they are not exported from the app)
bru run --env Local --env-var JWT_TOKEN=1234 --env-var API_KEY=abcd

# Data-driven runs
bru run --csv-file-path /path/to/file.csv     # once per CSV row
bru run --json-file-path /path/to/file.json   # data from JSON file

# Repetition & concurrency
bru run --iteration-count=2              # run N times
bru run --iteration-count 2 --parallel   # run requests in parallel

# Tag filtering
bru run --tags=smoke,sanity              # include requests with these tags
bru run --exclude-tags=skip,draft        # skip requests with these tags
```

### v3.0.0 note — Safe Mode

Since Bruno CLI v3.0.0 the default runtime is **Safe Mode**. If the collection needs
Developer Mode features (external npm packages, filesystem access), add the flag:

```bash
bru run --sandbox=developer
```

## More docs

Discover all available Bruno doc pages from the index before exploring further:
https://docs.usebruno.com/llms.txt
