# URL Redirector

## Platform

web

## Stack

Chrome Manifest V3 built with WXT, Svelte 5 and ui-sdk (shared Cadence theme). The background service worker is plain JavaScript with no UI dependencies.

## Users

Someone who wants short, memorable URLs (for example `go/docs`) to redirect to a real address.

## Product Purpose

Simple pattern-based URL redirection with no tracking or sync.

## Capabilities and Constraints

An ordered list of rules, each a wildcard pattern plus a redirect template; the first match wins. Rules stay in local extension storage. No browsing-history collection, accounts, servers, remote assets or analytics.

## Product Principles

- Keep settings easy to inspect.
- Store only the rules.
- Keep permissions and code small.
