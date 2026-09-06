-- 0004_subscribers_nullable_legacy.sql — Appwrite marks attributes "required"
-- only prospectively: 6 of 11 live subscriber docs predate consent_source and
-- status and hold null. The snapshot scan (S4) found no other collection
-- affected. Mirror reality: drop NOT NULL, keep the value checks (null passes
-- a CHECK by SQL semantics, same as Appwrite treated those docs).
alter table ops.subscribers alter column consent_source drop not null;
alter table ops.subscribers alter column status drop not null;
