# Security Documentation

## Security Improvements Implemented

### 1. Input Validation & Sanitization

**Slug (Organization Name)**
- Maximum length: 50 characters
- Allowed characters: letters, numbers, spaces, hyphens, underscores
- Automatic filtering of invalid characters
- Real-time feedback when invalid characters are entered

**Color Values**
- Strict hex validation: `#RRGGBB` format only
- Invalid colors default to safe fallback: `#111948`
- Visual feedback for invalid hex input

**Size Values**
- Whitelist validation: only `s`, `m`, `l` allowed
- Invalid sizes default to `m`

**Target ID (in badge.js)**
- Maximum length: 100 characters
- Allowed characters: letters, numbers, hyphens, underscores
- Prevents DOM injection attacks

### 2. XSS Prevention

**HTML Escaping**
- All user inputs are escaped before being inserted into HTML
- `escapeHtml()` function converts special characters to HTML entities
- Applied to slug, color, and URL values in embed code

**DOM Manipulation**
- Using `textContent` instead of `innerHTML` where possible
- SVG markup is validated and constructed safely
- No `eval()` or dynamic code execution

### 3. Content Security Policy (CSP)

Added CSP meta tag to index.html:
```
default-src 'self'
script-src 'self' 'unsafe-inline' https://badgebuilder.la.io
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
connect-src 'self' https://*.supabase.co
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

**What this does:**
- Prevents loading resources from unauthorized domains
- Blocks clickjacking attacks (frame-ancestors 'none')
- Restricts form submissions to same origin
- Only allows scripts from trusted sources

### 4. Additional Security Headers (Recommended)

For production deployment, configure your web server to send these HTTP headers:

**Apache (.htaccess)**
```apache
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>
```

**Nginx**
```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

**Cloudflare/CDN**
- Enable "Auto Minify" for JS/CSS/HTML
- Turn on "Always Use HTTPS"
- Enable "HSTS" (HTTP Strict Transport Security)
- Use "Firewall Rules" to block suspicious traffic

### 5. Error Handling

**User Feedback**
- Visual indicators for invalid input (red borders, error messages)
- Helpful error messages guide users to fix issues
- Copy validation prevents empty slug from being copied

**Graceful Degradation**
- Fallback values for all inputs
- Try-catch blocks around clipboard operations
- Safe defaults prevent breaking errors

### 6. URL Encoding

**Badge Links**
- All slug values in URLs use `encodeURIComponent()`
- Prevents URL injection attacks
- Handles special characters safely

### 7. Tracking Endpoint Security

**Current Implementation:**
- Uses Supabase Edge Function endpoint
- Pixel tracking via Image requests (GET)
- SendBeacon API for click tracking (POST, more reliable)

**Security Features:**
- Row Level Security (RLS) on Supabase tables
- CORS configuration via Supabase Edge Functions
- Input sanitization in both badge.js and Edge Function
- Rate limiting via Supabase infrastructure

## Remaining Security Considerations

### For Production Deployment:

1. **HTTPS Only**
   - Serve all pages over HTTPS
   - Set HSTS header with long max-age

2. **Subresource Integrity (SRI)**
   - Add integrity hashes if loading external libraries
   - Example: `<script src="..." integrity="sha384-..." crossorigin="anonymous"></script>`

3. **Rate Limiting**
   - Implement rate limiting on badge generation
   - Prevent abuse of tracking endpoint

4. **Monitoring**
   - Set up error logging (Sentry, LogRocket, etc.)
   - Monitor for suspicious patterns in tracking data
   - Alert on unusual traffic spikes

5. **Regular Updates**
   - Keep dependencies updated (if you add any)
   - Review security advisories
   - Conduct periodic security audits

## Testing Security

### Manual Testing Checklist:

- [ ] Try entering `<script>alert('xss')</script>` in organization name
- [ ] Try entering `javascript:alert(1)` in organization name
- [ ] Enter invalid hex colors (missing #, wrong length, invalid chars)
- [ ] Test with very long inputs (>1000 chars)
- [ ] Try SQL injection patterns: `'; DROP TABLE--`
- [ ] Test copy functionality without entering org name
- [ ] Verify embed code HTML-escapes all values
- [ ] Check browser console for CSP violations
- [ ] Test badge.js with malicious data attributes

### Expected Results:
- All malicious input should be sanitized or blocked
- No JavaScript execution from user input
- No CSP violations in console
- Helpful error messages guide users

## Security Contact

If you discover a security vulnerability, please report it to your security team immediately. Do not disclose publicly until patched.
