-- Migration 004: Expand creator_profiles to match PRD profile fields

ALTER TABLE creator_profiles
  ADD COLUMN IF NOT EXISTS primary_platform TEXT NOT NULL DEFAULT 'instagram',
  ADD COLUMN IF NOT EXISTS geo_region TEXT NOT NULL DEFAULT 'KR',
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'KRW';
