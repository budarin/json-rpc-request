# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.3] - 2026-03-26

### Changed

- Improved type-safety of JSON-RPC response payloads by using deep readonly typing for `result` and `error`.
- Added explicit request-abort handling with a dedicated `ABORTED_ERROR_CODE`.
