#!/bin/sh
set -eu
bun audit
gitleaks dir --redact --exit-code 1 .
