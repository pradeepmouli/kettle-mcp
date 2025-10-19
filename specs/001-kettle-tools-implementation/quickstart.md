# Quickstart: Kettle Tools

This guide shows how to use the Kettle tools for inspecting, validating, searching, editing, and (optionally) executing artifacts locally.

## Prerequisites

- Node 18+
- Local Kettle artifacts in `examples/sample_kettle_files/`

## Inspect

- Input: path to .ktr or .kjb
- Output: name, steps/entries, hops, parameters, variables, notes

## Validate

- Input: path to .ktr or .kjb
- Output: list of issues with severity, code, message, location

## Search

- Input: directory + query (name substring, type, parameter, step type)
- Output: list of matching artifacts with paths

## Edit (Preview)

- Input: artifact path + patch (e.g., update description)
- Output: unified diff without writing

## Edit (Save)

- Input: artifact path + patch
- Behavior: creates timestamped backup and writes atomically
- Output: success confirmation + backup path

## Dependencies

- Input: artifact path
- Output: dependencies (calls) and dependents (called by)

## Execute (Local Only, Opt-in)

- Disabled by default. Enable with an environment variable and tool option.
- Input: artifact path + execution params
- Output: execution summary
