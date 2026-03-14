-- Migration 006: Add reply_drafts_json column to inquiries
-- Stores user-edited reply drafts so they persist across sessions.
-- Nullable: null means no edits saved yet.

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS reply_drafts_json JSONB DEFAULT NULL;
