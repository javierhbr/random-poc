# Platform Truth MCP Server

This is the v1 local read-only MCP server for the unified SDD methodology.

It is designed for developer machines that keep a local clone of the platform
repository and want fast local query and validation without hosted
infrastructure.

## Design goals

- Go single binary
- stdio transport
- newline-delimited JSON-RPC messages
- read-only only
- no external Go dependencies
- version-aware validation based on `platform-ref.yaml`

## Implemented tools

- `get_platform_version`
- `list_platform_refs`
- `get_platform_ref`
- `get_jira_mapping`
- `validate_component_alignment`
- `validate_component_jira_chain`
- `detect_platform_drift_from_pinned_version`

## Make targets

From `/Users/javierbenavides/others/dev/poc/random-poc/custom-skills/sdd/platform-truth-mcp-server`:

```bash
make setup
make test
make build
make install
make start
make status
make stop
```

Useful targets:

- `make setup` prepares `./bin`, `./.gocache`, and the local install directory
- `make fmt` runs `gofmt -w .`
- `make test` runs `go test ./...` with a local `GOCACHE`
- `make build` writes the binary to `./bin/platform-truth-mcp`
- `make install` copies the binary to `$HOME/.local/bin/platform-truth-mcp` by default
- `make run-demo` starts the server with the demo config
- `make start` starts a local stdio harness for manual MCP testing
- `make status` shows whether the local stdio harness is running
- `make stop` stops the local stdio harness
- `make smoke-test` runs `initialize` and `validate_component_alignment` against the sample component repo
- `make uninstall` removes the installed binary from the install directory

Override install paths when needed:

```bash
make install PREFIX=/tmp/platform-mcp
make install INSTALL_DIR=/usr/local/bin
```

The `start` target is a local dev harness, not a network daemon. It keeps the
stdio server alive behind a request pipe so you can inspect liveness and logs on
a developer machine. Normal MCP client integration should still launch the
binary directly.

Runtime files:

- request pipe: `./.runtime/platform-truth-mcp.requests.pipe`
- log file: `./.runtime/platform-truth-mcp.log`
- supervisor pid: `./.runtime/platform-truth-mcp.pid`

If you override `CONFIG` or `COMPONENT_REPO`, use real local paths instead of
the placeholder `/absolute/path/...` examples.

## Run without Make

```bash
go run ./cmd/platform-truth-mcp serve --config ./examples/demo-platform-mcp-config.yaml
```

## Example config

- `examples/demo-platform-mcp-config.yaml`

## Notes

- the server reads platform truth from a local platform clone
- the server reads component alignment from `platform-ref.yaml` and
  `jira-traceability.yaml`
- the server defaults to pinned-version behavior for component validation
