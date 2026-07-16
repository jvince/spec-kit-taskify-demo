# Security boundaries

The active actor is valid only when `TASKIFY_DEPLOYMENT_MODE=local-demo`; all other modes fail closed. Services validate their own input, authorize calls, and require a rotated service credential. Correlation IDs are safe to expose; diagnostics and credentials are not.

## Rotation and diagnostics

Store distinct service credentials in deployment secret storage, rotate them before expiry, and
restart only the affected service. For a rotation, provision the replacement credential, update the
BFF and target service atomically, verify credential-rejection metrics, then revoke the old value.
Never log credential values, request bodies, notification payloads, or SQLite paths. Use the API
correlation ID to locate redacted server-side diagnostics. The BFF is the sole browser-facing API
layer: it validates seeded actors and injects service credentials; services must reject direct
requests without that credential.
