# 3. Use MongoDB as the primary datastore

- **Date:** 2026-07-27
- **Status:** Accepted

## Context

The domain centres on products that own a variable-length list of **variants**, each
with its own price, stock, images and an open-ended set of attributes (Size, Colour,
…). Orders must snapshot their line items at purchase time. Access patterns are
read-heavy catalog queries plus per-user cart and order lookups.

## Decision

Use MongoDB (via Mongoose) as the primary datastore.

## Consequences

- **Natural fit for nested, schema-flexible data.** Variants and their arbitrary
  attribute maps are embedded subdocuments on the product — the data that is always
  read together is stored together, with no join tables.
- **Accurate order history.** Orders store their line items inline, so history stays
  correct even if the underlying product or variant is later edited or deleted.
- **Transactions require a replica set.** Order creation uses a multi-document
  transaction; production runs on MongoDB Atlas (a replica set) and the test suite
  runs against an in-memory replica set.
- Trade-off: no database-level joins or cross-collection referential integrity. We
  compensate with explicit, documented indexes on every filtered/sorted field and
  with application-level checks. A relational database would be the better choice if
  the domain grew many-to-many relationships or needed strong cross-entity
  constraints.
