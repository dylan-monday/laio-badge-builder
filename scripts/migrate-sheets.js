#!/usr/bin/env node

/**
 * LA.IO Badge Builder - Google Sheets Migration Script
 *
 * Migrates v1 badge tracking data from a CSV export to the Supabase events table.
 *
 * Usage:
 *   node scripts/migrate-sheets.js <path-to-csv>
 *
 * Environment variables (from .env):
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (NOT the anon key)
 *
 * CSV columns expected (case-insensitive, flexible mapping):
 *   - event_type (or: type, action)
 *   - partner_slug (or: slug, partner, partner_id)
 *   - domain (or: host, hostname, site)
 *   - page_url (or: url, page, full_url)
 *   - created_at (or: timestamp, date, datetime, time)
 *   - user_agent (optional)
 *   - referrer (optional)
 *   - country (optional)
 *
 * IMPORTANT: Run 004_badge_version_column.sql migration first!
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pkg from 'papaparse'
const { parse } = pkg
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env in project root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

// Configuration
const BATCH_SIZE = 500
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Column mappings (CSV column name -> events table column)
const COLUMN_MAPPINGS = {
  event_type: ['event_type', 'type', 'action', 'event', 't'],
  partner_slug: ['partner_slug', 'slug', 'partner', 'partner_id', 'partnerid'],
  domain: ['domain', 'host', 'hostname', 'site', 'website'],
  page_url: ['page_url', 'url', 'page', 'full_url', 'pageurl'],
  created_at: ['ts', 'created_at', 'timestamp', 'date', 'datetime', 'time', 'createdat'],
  user_agent: ['user_agent', 'useragent', 'ua', 'browser'],
  referrer: ['referrer', 'referer', 'ref'],
  country: ['country', 'geo', 'location', 'region'],
}

// Parse timestamp from various formats Google Sheets might export
function parseTimestamp(rawDate) {
  if (!rawDate || typeof rawDate !== 'string') return null

  const trimmed = rawDate.trim()
  if (!trimmed) return null

  // Try direct parsing first (handles ISO format, "YYYY-MM-DD HH:MM:SS", etc.)
  let parsed = new Date(trimmed)

  // If that failed, try some common formats
  if (isNaN(parsed.getTime())) {
    // Try "MM/DD/YYYY HH:MM:SS" format (US date format)
    const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):?(\d{2})?/)
    if (usMatch) {
      const [, month, day, year, hour, minute, second = '0'] = usMatch
      parsed = new Date(year, month - 1, day, hour, minute, second)
    }
  }

  if (isNaN(parsed.getTime())) {
    // Try "DD/MM/YYYY HH:MM:SS" format (EU date format) - if day > 12
    const euMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):?(\d{2})?/)
    if (euMatch) {
      const [, day, month, year, hour, minute, second = '0'] = euMatch
      if (parseInt(day, 10) > 12) {
        parsed = new Date(year, month - 1, day, hour, minute, second)
      }
    }
  }

  if (isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString()
}

// Validate environment
function validateEnv() {
  if (!SUPABASE_URL) {
    console.error('Error: SUPABASE_URL environment variable is not set')
    console.error('Add SUPABASE_URL to your .env file')
    process.exit(1)
  }
  if (!SUPABASE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
    console.error('Add SUPABASE_SERVICE_ROLE_KEY to your .env file')
    console.error('Note: Use the service role key, not the anon key')
    process.exit(1)
  }
}

// Find matching column in CSV headers
function findColumn(headers, possibleNames) {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim().replace(/[\s_-]/g, ''))
  for (const name of possibleNames) {
    const normalizedName = name.toLowerCase().replace(/[\s_-]/g, '')
    const index = normalizedHeaders.indexOf(normalizedName)
    if (index !== -1) {
      return headers[index]
    }
  }
  return null
}

// Map CSV row to events table row
function mapRow(row, columnMap) {
  const event = {
    badge_version: 'v1', // Mark as migrated from v1
  }

  // Map required fields
  if (columnMap.event_type) {
    const rawType = row[columnMap.event_type]?.toLowerCase().trim()
    event.event_type = rawType === 'click' ? 'click' : 'impression'
  } else {
    event.event_type = 'impression' // Default to impression
  }

  if (columnMap.partner_slug) {
    event.partner_slug = row[columnMap.partner_slug]?.trim()
  }

  // Map optional fields
  if (columnMap.domain) {
    event.domain = row[columnMap.domain]?.trim() || null
  }

  if (columnMap.page_url) {
    event.page_url = row[columnMap.page_url]?.trim() || null
  }

  if (columnMap.created_at) {
    const rawDate = row[columnMap.created_at]
    if (rawDate) {
      const parsed = parseTimestamp(rawDate)
      if (parsed) {
        event.created_at = parsed
      }
    }
  }

  if (columnMap.user_agent) {
    event.user_agent = row[columnMap.user_agent]?.trim() || null
  }

  if (columnMap.referrer) {
    event.referrer = row[columnMap.referrer]?.trim() || null
  }

  if (columnMap.country) {
    event.country = row[columnMap.country]?.trim() || null
  }

  return event
}

// Insert batch of events
async function insertBatch(supabase, events, batchNum, totalBatches) {
  const { data, error } = await supabase
    .from('events')
    .insert(events)

  if (error) {
    console.error(`  Batch ${batchNum}/${totalBatches}: FAILED - ${error.message}`)
    return { success: false, count: 0, error }
  }

  console.log(`  Batch ${batchNum}/${totalBatches}: Inserted ${events.length} events`)
  return { success: true, count: events.length }
}

// Main migration function
async function migrate(csvPath) {
  console.log('\n========================================')
  console.log('LA.IO Badge Builder - v1 Data Migration')
  console.log('========================================\n')

  // Validate environment
  validateEnv()

  // Validate CSV file exists
  const absolutePath = path.resolve(csvPath)
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found: ${absolutePath}`)
    process.exit(1)
  }

  console.log(`Reading: ${absolutePath}\n`)

  // Read and parse CSV
  const csvContent = fs.readFileSync(absolutePath, 'utf-8')
  const { data: rows, errors, meta } = parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
  })

  if (errors.length > 0) {
    console.error('CSV parsing errors:')
    errors.slice(0, 5).forEach(e => console.error(`  Line ${e.row}: ${e.message}`))
    if (errors.length > 5) {
      console.error(`  ... and ${errors.length - 5} more errors`)
    }
  }

  console.log(`Parsed ${rows.length} rows with ${meta.fields.length} columns`)
  console.log(`Columns: ${meta.fields.join(', ')}\n`)

  // Build column mapping
  const columnMap = {}
  for (const [targetColumn, possibleNames] of Object.entries(COLUMN_MAPPINGS)) {
    const foundColumn = findColumn(meta.fields, possibleNames)
    if (foundColumn) {
      columnMap[targetColumn] = foundColumn
      console.log(`  ${targetColumn} <- "${foundColumn}"`)
    }
  }

  // Check for required columns
  if (!columnMap.partner_slug) {
    console.error('\nError: Could not find partner_slug column')
    console.error('Expected one of: partner_slug, slug, partner, partner_id')
    process.exit(1)
  }

  // Warn if no timestamp column found
  if (!columnMap.created_at) {
    console.warn('\n⚠️  Warning: No timestamp column found!')
    console.warn('   Events will use current timestamp instead of original.')
    console.warn('   Expected one of: ts, created_at, timestamp, date, datetime')
  }

  console.log('')

  // Create Supabase client with service role key
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Map and validate rows
  const events = []
  const skipped = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const event = mapRow(row, columnMap)

    // Skip rows without partner_slug
    if (!event.partner_slug) {
      skipped.push({ row: i + 2, reason: 'Missing partner_slug' })
      continue
    }

    events.push(event)
  }

  console.log(`Valid events: ${events.length}`)
  console.log(`Skipped rows: ${skipped.length}`)

  if (skipped.length > 0 && skipped.length <= 10) {
    console.log('Skipped:')
    skipped.forEach(s => console.log(`  Row ${s.row}: ${s.reason}`))
  }

  // Show sample of timestamps to verify parsing
  if (columnMap.created_at && events.length > 0) {
    console.log('\nTimestamp samples (first 3 events):')
    events.slice(0, 3).forEach((e, i) => {
      const original = rows[i][columnMap.created_at]
      console.log(`  "${original}" -> ${e.created_at || '(not set)'}`)
    })
  }

  if (events.length === 0) {
    console.error('\nNo valid events to migrate')
    process.exit(1)
  }

  console.log(`\nMigrating ${events.length} events in batches of ${BATCH_SIZE}...\n`)

  // Insert in batches
  const totalBatches = Math.ceil(events.length / BATCH_SIZE)
  let totalInserted = 0
  let totalFailed = 0
  const failedBatches = []

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1

    const result = await insertBatch(supabase, batch, batchNum, totalBatches)

    if (result.success) {
      totalInserted += result.count
    } else {
      totalFailed += batch.length
      failedBatches.push({
        batch: batchNum,
        start: i,
        end: i + batch.length,
        error: result.error.message,
      })
    }
  }

  // Summary
  console.log('\n========================================')
  console.log('Migration Complete')
  console.log('========================================')
  console.log(`Total rows in CSV:    ${rows.length}`)
  console.log(`Skipped (invalid):    ${skipped.length}`)
  console.log(`Successfully inserted: ${totalInserted}`)
  console.log(`Failed to insert:     ${totalFailed}`)

  if (failedBatches.length > 0) {
    console.log('\nFailed batches:')
    failedBatches.forEach(fb => {
      console.log(`  Batch ${fb.batch} (rows ${fb.start + 1}-${fb.end}): ${fb.error}`)
    })
    console.log('\nYou may need to retry these rows manually or fix the data.')
    process.exit(1)
  }

  console.log('\nAll events migrated successfully!')
}

// CLI entry point
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('Usage: node scripts/migrate-sheets.js <path-to-csv>')
  console.log('')
  console.log('Example:')
  console.log('  node scripts/migrate-sheets.js ~/Downloads/badge-events.csv')
  console.log('')
  console.log('Environment variables required in .env:')
  console.log('  SUPABASE_URL')
  console.log('  SUPABASE_SERVICE_ROLE_KEY')
  process.exit(0)
}

migrate(args[0]).catch(err => {
  console.error('\nUnexpected error:', err.message)
  process.exit(1)
})
