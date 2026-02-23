/**
 * LA.IO Badge Embed Script v2
 * Standalone vanilla JS - no dependencies, no build step
 *
 * Usage:
 * <script async src="https://badgebuilder.la.io/badge.js"
 *         data-slug="company-name"
 *         data-color="#00BAFF"
 *         data-size="m"
 *         data-layout="standard"></script>
 */
(function() {
  'use strict';

  // ===== Configuration =====
  // Tracking endpoint (Supabase Edge Function)
  var ENDPOINT = 'https://mteigxlxuvvqdagffvqw.supabase.co/functions/v1/track';
  var VERSION = 'v2';

  // ===== Validation & Sanitization =====
  function sanitizeSlug(input) {
    if (!input || typeof input !== 'string') return 'unknown';
    return input.trim().slice(0, 50).replace(/[^a-zA-Z0-9\s\-_]/g, '').toLowerCase() || 'unknown';
  }

  function isValidHex(hex) {
    if (!hex || typeof hex !== 'string') return false;
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  }

  function sanitizeColor(color) {
    if (!color || typeof color !== 'string') return '#101948';
    var cleaned = color.trim().toUpperCase();
    return isValidHex(cleaned) ? cleaned : '#101948';
  }

  function sanitizeSize(size) {
    if (!size || typeof size !== 'string') return 'm';
    var s = size.toLowerCase().trim();
    return (s === 's' || s === 'm' || s === 'l' || s === 'auto') ? s : 'm';
  }

  function sanitizeLayout(layout) {
    if (!layout || typeof layout !== 'string') return 'standard';
    var l = layout.toLowerCase().trim();
    return (l === 'standard' || l === 'pill' || l === 'horizontal') ? l : 'standard';
  }

  function sanitizeTargetId(target) {
    if (!target || typeof target !== 'string') return '';
    return target.trim().slice(0, 100).replace(/[^a-zA-Z0-9\-_]/g, '');
  }

  // Accept many variations partners might use for slug
  function pickSlug(ds) {
    var raw = (
      ds.slug ||
      ds.org_slug ||
      ds.orgSlug ||
      ds.orgslug ||
      ds.org ||
      ds.partner ||
      ds.client ||
      ''
    );
    return sanitizeSlug(raw);
  }

  // ===== DOM Utilities =====
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function getSelfScript() {
    var s = document.currentScript;
    if (s) return s;
    // Fallback: search for badge.js script
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      var sc = scripts[i];
      var ds = sc.dataset || {};
      if ((sc.src && /\/badge\.js(\?|$)/.test(sc.src)) || ds.slug || ds.color || ds.size) {
        return sc;
      }
    }
    return null;
  }

  // ===== SVG Badge Markup =====
  function getPixels(size) {
    var sizes = { s: 120, m: 160, l: 220, auto: 160 };
    return sizes[size] || sizes.m;
  }

  // Helper to determine if color is light (for contrast)
  function isLightColor(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }

  // Standard badge SVG (original layout)
  function standardSvgMarkup(px, color) {
    var safePx = parseInt(px, 10);
    if (isNaN(safePx) || safePx < 50 || safePx > 500) safePx = 160;
    var safeColor = sanitizeColor(color);
    var F = 'style="fill:currentColor"';

    return '' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 274.03 67.72" width="' + safePx + '" role="img" aria-label="LA.IO badge">' +
        '<g style="color:' + safeColor + '">' +
          // "LOUISIANA" text
          '<path ' + F + ' d="M60.08,49.06v5.15h3.32v1.61h-5.15v-6.76h1.82Z"/>' +
          '<path ' + F + ' d="M68.85,55.94c-1.74,0-3.03-1.43-3.03-3.51s1.3-3.51,3.03-3.51,3.03,1.43,3.03,3.51-1.3,3.51-3.03,3.51ZM68.85,50.54c-.73,0-1.19.75-1.19,1.9s.46,1.9,1.19,1.9,1.19-.75,1.19-1.9-.46-1.9-1.19-1.9Z"/>' +
          '<path ' + F + ' d="M74.22,53.09v-4.03h1.81v3.73c0,1.03.17,1.62,1,1.62s1-.59,1-1.62v-3.73h1.82v4.03c0,1.97-1.19,2.85-2.82,2.85s-2.81-.88-2.81-2.85Z"/>' +
          '<path ' + F + ' d="M82.64,55.81v-1.58h1.68v-3.6h-1.68v-1.58h5.19v1.58h-1.68v3.6h1.68v1.58h-5.19Z"/>' +
          '<path ' + F + ' d="M91.44,53.47c.49.66,1.22,1,2.01,1,.65,0,1.04-.2,1.04-.58s-.32-.44-.61-.5l-1.38-.31c-1.01-.23-1.77-.77-1.77-1.95,0-1.32,1.02-2.2,2.58-2.2,1.2,0,2.09.49,2.73,1.24l-1.09,1.14c-.35-.51-.8-.91-1.64-.91-.5,0-.88.23-.88.57,0,.31.25.41.51.47l1.34.31c1.34.31,1.93.93,1.93,2.04,0,1.4-1.24,2.16-2.77,2.16-1.34,0-2.29-.43-3.02-1.18l1.02-1.29Z"/>' +
          '<path ' + F + ' d="M99.03,55.81v-1.58h1.68v-3.6h-1.68v-1.58h5.19v1.58h-1.68v3.6h1.68v1.58h-5.19Z"/>' +
          '<path ' + F + ' d="M110.77,54.5h-2l-.36,1.31h-1.77l2.07-6.76h2.23l2.07,6.76h-1.87l-.37-1.31ZM109.15,53.14h1.24l-.6-2.14h-.04l-.6,2.14Z"/>' +
          '<path ' + F + ' d="M119.17,53v-3.95h1.65v6.76h-1.7l-2.26-4.62v4.62h-1.65v-6.76h2.17l1.8,3.95Z"/>' +
          '<path ' + F + ' d="M127.16,54.5h-2l-.36,1.31h-1.77l2.07-6.76h2.23l2.07,6.76h-1.87l-.37-1.31ZM125.54,53.14h1.24l-.6-2.14h-.04l-.6,2.14Z"/>' +
          // "INNOVATION" text
          '<path ' + F + ' d="M137.17,55.81v-.8h1.91v-5.15h-1.91v-.8h4.75v.8h-1.9v5.15h1.9v.8h-4.75Z"/>' +
          '<path ' + F + ' d="M149.4,54.29v-5.23h.87v6.76h-.83l-3.35-5.58v5.58h-.87v-6.76h1.09l3.08,5.23Z"/>' +
          '<path ' + F + ' d="M157.59,54.29v-5.23h.87v6.76h-.83l-3.35-5.58v5.58h-.87v-6.76h1.09l3.08,5.23Z"/>' +
          '<path ' + F + ' d="M164.14,55.94c-1.63,0-2.81-1.43-2.81-3.51s1.18-3.51,2.81-3.51,2.81,1.43,2.81,3.51-1.18,3.51-2.81,3.51ZM164.14,49.74c-1.11,0-1.84,1.04-1.84,2.69s.73,2.69,1.84,2.69,1.84-1.04,1.84-2.69-.73-2.69-1.84-2.69Z"/>' +
          '<path ' + F + ' d="M171.77,55.81l-2.26-6.76h1.01l1.82,5.65h.04l1.8-5.65h.97l-2.26,6.76h-1.11Z"/>' +
          '<path ' + F + ' d="M181.73,53.84h-2.47l-.63,1.97h-.92l2.25-6.76h1.14l2.25,6.76h-.98l-.64-1.97ZM179.51,53.09h1.98l-.98-3h-.04l-.97,3Z"/>' +
          '<path ' + F + ' d="M188.24,55.81v-5.94h-2.39v-.82h5.75v.82h-2.42v5.94h-.93Z"/>' +
          '<path ' + F + ' d="M194.54,55.81v-.8h1.91v-5.15h-1.91v-.8h4.75v.8h-1.9v5.15h1.9v.8h-4.75Z"/>' +
          '<path ' + F + ' d="M205.11,55.94c-1.63,0-2.81-1.43-2.81-3.51s1.18-3.51,2.81-3.51,2.81,1.43,2.81,3.51-1.18,3.51-2.81,3.51ZM205.11,49.74c-1.11,0-1.84,1.04-1.84,2.69s.73,2.69,1.84,2.69,1.84-1.04,1.84-2.69-.73-2.69-1.84-2.69Z"/>' +
          '<path ' + F + ' d="M214.96,54.29v-5.23h.87v6.76h-.83l-3.35-5.58v5.58h-.87v-6.76h1.09l3.08,5.23Z"/>' +
          // Dot (period)
          '<path ' + F + ' d="M131.44,31.94h8.5v8.5h-8.5v-8.5Z"/>' +
          // LA.IO main text
          '<path ' + F + ' d="M65.72,12.56v21.24h13.72v6.64h-21.24V12.56h7.52Z"/>' +
          '<path ' + F + ' d="M105.81,35.03h-8.27l-1.5,5.4h-7.3l8.54-27.88h9.2l8.54,27.88h-7.7l-1.5-5.4ZM99.13,29.41h5.13l-2.48-8.85h-.18l-2.48,8.85Z"/>' +
          '<path ' + F + ' d="M158.79,40.43v-6.5h6.95v-14.87h-6.95v-6.5h21.42v6.5h-6.95v14.87h6.95v6.5h-21.42Z"/>' +
          '<path ' + F + ' d="M203.3,40.96c-7.17,0-12.52-5.89-12.52-14.47s5.35-14.47,12.52-14.47,12.52,5.88,12.52,14.47-5.35,14.47-12.52,14.47ZM203.3,18.66c-3.01,0-4.91,3.1-4.91,7.83s1.9,7.83,4.91,7.83,4.91-3.1,4.91-7.83-1.9-7.83-4.91-7.83Z"/>' +
          // Left arrow
          '<polygon ' + F + ' points="14.69 33.86 41.21 60.38 33.86 67.72 0 33.86 33.86 0 41.21 7.35 14.69 33.86"/>' +
          // Right arrow
          '<polygon ' + F + ' points="259.33 33.86 232.82 7.35 240.16 0 274.03 33.86 240.16 67.72 232.82 60.38 259.33 33.86"/>' +
        '</g>' +
      '</svg>';
  }

  // Pill badge SVG (compact horizontal ~5.5:1 ratio) - based on la.io pill.svg
  // Supports two-color scheme with bgColor/fgColor
  function pillSvgMarkup(px, color, bgColor, fgColor) {
    var safePx = parseInt(px, 10);
    if (isNaN(safePx) || safePx < 50 || safePx > 500) safePx = 160;
    var width = safePx;
    var height = Math.round(safePx / 5.5);

    // Two-color mode: use explicit bg/fg colors
    // Single-color mode: use color for background, auto-contrast for text
    var bg = bgColor ? sanitizeColor(bgColor) : sanitizeColor(color);
    var fg = fgColor ? sanitizeColor(fgColor) : (isLightColor(bg) ? '#03243c' : '#ffffff');

    return '' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.23 23.58" width="' + width + '" height="' + height + '" role="img" aria-label="LA.IO badge">' +
        '<rect x="0" y="0" width="130.23" height="23.58" rx="11.79" ry="11.79" fill="' + bg + '"/>' +
        '<g fill="' + fg + '">' +
          // INNOVATION text - top row
          '<path d="M79.28,15.33v-.3h.71v-1.91h-.71v-.3h1.76v.3h-.7v1.91h.7v.3h-1.76Z"/>' +
          '<path d="M84.32,14.77v-1.94h.32v2.51h-.31l-1.24-2.07v2.07h-.32v-2.51h.41l1.14,1.94Z"/>' +
          '<path d="M87.87,14.77v-1.94h.32v2.51h-.31l-1.24-2.07v2.07h-.32v-2.51h.41l1.14,1.94Z"/>' +
          '<path d="M90.8,15.38c-.61,0-1.04-.53-1.04-1.3s.44-1.3,1.04-1.3,1.04.53,1.04,1.3-.44,1.3-1.04,1.3ZM90.8,13.08c-.41,0-.68.39-.68,1s.27,1,.68,1,.68-.39.68-1-.27-1-.68-1Z"/>' +
          '<path d="M94.14,15.33l-.84-2.51h.37l.68,2.1h.02l.67-2.1h.36l-.84,2.51h-.41Z"/>' +
          '<path d="M98.34,14.6h-.92l-.23.73h-.34l.84-2.51h.42l.84,2.51h-.36l-.24-.73ZM97.51,14.32h.74l-.36-1.11h-.02l-.36,1.11Z"/>' +
          '<path d="M101.26,15.33v-2.21h-.89v-.3h2.13v.3h-.9v2.21h-.35Z"/>' +
          '<path d="M104.1,15.33v-.3h.71v-1.91h-.71v-.3h1.76v.3h-.7v1.91h.7v.3h-1.76Z"/>' +
          '<path d="M108.53,15.38c-.61,0-1.04-.53-1.04-1.3s.44-1.3,1.04-1.3,1.04.53,1.04,1.3-.44,1.3-1.04,1.3ZM108.53,13.08c-.41,0-.68.39-.68,1s.27,1,.68,1,.68-.39.68-1-.27-1-.68-1Z"/>' +
          '<path d="M112.69,14.77v-1.94h.32v2.51h-.31l-1.24-2.07v2.07h-.32v-2.51h.41l1.14,1.94Z"/>' +
          // LOUISIANA text - bottom row
          '<path d="M80.05,8.26v2.46h1.59v.77h-2.46v-3.22h.87Z"/>' +
          '<path d="M84.23,11.54c-.83,0-1.45-.68-1.45-1.67s.62-1.67,1.45-1.67,1.45.68,1.45,1.67-.62,1.67-1.45,1.67ZM84.23,8.96c-.35,0-.57.36-.57.91s.22.91.57.91.57-.36.57-.91-.22-.91-.57-.91Z"/>' +
          '<path d="M86.79,10.18v-1.92h.86v1.78c0,.49.08.77.48.77s.48-.28.48-.77v-1.78h.87v1.92c0,.94-.57,1.36-1.35,1.36s-1.34-.42-1.34-1.36Z"/>' +
          '<path d="M90.81,11.48v-.75h.8v-1.72h-.8v-.75h2.48v.75h-.8v1.72h.8v.75h-2.48Z"/>' +
          '<path d="M95,10.37c.24.32.58.48.96.48.31,0,.5-.1.5-.28s-.15-.21-.29-.24l-.66-.15c-.48-.11-.84-.37-.84-.93,0-.63.49-1.05,1.23-1.05.57,0,1,.24,1.3.59l-.52.54c-.17-.25-.38-.43-.78-.43-.24,0-.42.11-.42.27,0,.15.12.19.25.23l.64.15c.64.15.92.45.92.97,0,.67-.59,1.03-1.32,1.03-.64,0-1.09-.2-1.44-.56l.49-.61Z"/>' +
          '<path d="M98.63,11.48v-.75h.8v-1.72h-.8v-.75h2.48v.75h-.8v1.72h.8v.75h-2.48Z"/>' +
          '<path d="M104.23,10.86h-.96l-.17.62h-.84l.99-3.22h1.06l.99,3.22h-.89l-.17-.62ZM103.45,10.21h.59l-.29-1.02h-.02l-.29,1.02Z"/>' +
          '<path d="M108.23,10.14v-1.88h.79v3.22h-.81l-1.08-2.2v2.2h-.79v-3.22h1.03l.86,1.88Z"/>' +
          '<path d="M112.04,10.86h-.96l-.17.62h-.84l.99-3.22h1.06l.99,3.22h-.89l-.17-.62ZM111.27,10.21h.59l-.29-1.02h-.02l-.29,1.02Z"/>' +
          // LA.IO text
          '<path d="M30.93,8.86v4.6h2.97v1.44h-4.6v-6.04h1.63Z"/>' +
          '<path d="M39.62,13.73h-1.79l-.33,1.17h-1.58l1.85-6.04h1.99l1.85,6.04h-1.67l-.33-1.17ZM38.17,12.51h1.11l-.54-1.92h-.04l-.54,1.92Z"/>' +
          '<path d="M45.17,13.06h1.84v1.84h-1.84v-1.84Z"/>' +
          '<path d="M51.09,14.9v-1.41h1.5v-3.22h-1.5v-1.41h4.64v1.41h-1.5v3.22h1.5v1.41h-4.64Z"/>' +
          '<path d="M60.73,15.01c-1.55,0-2.71-1.27-2.71-3.13s1.16-3.13,2.71-3.13,2.71,1.27,2.71,3.13-1.16,3.13-2.71,3.13ZM60.73,10.18c-.65,0-1.06.67-1.06,1.7s.41,1.7,1.06,1.7,1.06-.67,1.06-1.7-.41-1.7-1.06-1.7Z"/>' +
          // Left arrow
          '<polygon points="20.2 11.79 25.75 17.34 24.21 18.88 17.13 11.79 24.21 4.7 25.75 6.24 20.2 11.79"/>' +
          // Right arrow
          '<polygon points="72.55 11.79 67 6.24 68.54 4.7 75.63 11.79 68.54 18.88 67 17.34 72.55 11.79"/>' +
        '</g>' +
      '</svg>';
  }

  // Horizontal badge SVG (full wordmark ~6.8:1 ratio) - based on la.io horz.svg
  function horizontalSvgMarkup(px, color) {
    var safePx = parseInt(px, 10);
    if (isNaN(safePx) || safePx < 50 || safePx > 500) safePx = 160;
    var safeColor = sanitizeColor(color);
    var width = safePx;
    var height = Math.round(safePx / 6.8);

    return '' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 459.69 67.88" width="' + width + '" height="' + height + '" role="img" aria-label="LA.IO badge">' +
        '<g fill="' + safeColor + '">' +
          // INNOVATION text - bottom row
          '<path d="M297.67,50.91v-1.43h3.39v-9.15h-3.39v-1.43h8.45v1.43h-3.37v9.15h3.37v1.43h-8.45Z"/>' +
          '<path d="M321.82,48.21v-9.3h1.54v12.01h-1.47l-5.95-9.91v9.91h-1.54v-12.01h1.94l5.47,9.3Z"/>' +
          '<path d="M338.8,48.21v-9.3h1.54v12.01h-1.47l-5.95-9.91v9.91h-1.54v-12.01h1.94l5.47,9.3Z"/>' +
          '<path d="M352.85,51.14c-2.9,0-5-2.54-5-6.23s2.1-6.23,5-6.23,5,2.54,5,6.23-2.1,6.23-5,6.23ZM352.85,40.12c-1.98,0-3.28,1.85-3.28,4.79s1.3,4.79,3.28,4.79,3.28-1.85,3.28-4.79-1.3-4.79-3.28-4.79Z"/>' +
          '<path d="M368.84,50.91l-4.02-12.01h1.79l3.24,10.05h.08l3.2-10.05h1.72l-4.02,12.01h-1.98Z"/>' +
          '<path d="M388.95,47.4h-4.38l-1.13,3.51h-1.64l4-12.01h2.02l4,12.01h-1.73l-1.14-3.51ZM385,46.07h3.53l-1.74-5.34h-.08l-1.72,5.34Z"/>' +
          '<path d="M402.94,50.91v-10.56h-4.25v-1.45h10.22v1.45h-4.31v10.56h-1.66Z"/>' +
          '<path d="M416.55,50.91v-1.43h3.39v-9.15h-3.39v-1.43h8.45v1.43h-3.37v9.15h3.37v1.43h-8.45Z"/>' +
          '<path d="M437.76,51.14c-2.9,0-5-2.54-5-6.23s2.1-6.23,5-6.23,5,2.54,5,6.23-2.1,6.23-5,6.23ZM437.76,40.12c-1.98,0-3.28,1.85-3.28,4.79s1.3,4.79,3.28,4.79,3.28-1.85,3.28-4.79-1.3-4.79-3.28-4.79Z"/>' +
          '<path d="M457.68,48.21v-9.3h1.54v12.01h-1.47l-5.95-9.91v9.91h-1.54v-12.01h1.94l5.47,9.3Z"/>' +
          // LOUISIANA text - top row
          '<path d="M301.37,17.03v11.76h7.59v3.67h-11.76v-15.43h4.16Z"/>' +
          '<path d="M321.39,32.76c-3.97,0-6.93-3.26-6.93-8.01s2.96-8.01,6.93-8.01,6.93,3.26,6.93,8.01-2.96,8.01-6.93,8.01ZM321.39,20.41c-1.67,0-2.72,1.71-2.72,4.34s1.05,4.34,2.72,4.34,2.72-1.71,2.72-4.34-1.05-4.34-2.72-4.34Z"/>' +
          '<path d="M333.66,26.24v-9.21h4.14v8.52c0,2.35.39,3.7,2.28,3.7s2.28-1.35,2.28-3.7v-8.52h4.16v9.21c0,4.51-2.72,6.52-6.44,6.52s-6.42-2.01-6.42-6.52Z"/>' +
          '<path d="M352.9,32.46v-3.6h3.85v-8.23h-3.85v-3.6h11.86v3.6h-3.85v8.23h3.85v3.6h-11.86Z"/>' +
          '<path d="M372.99,27.12c1.13,1.52,2.79,2.28,4.58,2.28,1.49,0,2.38-.47,2.38-1.32s-.73-1-1.4-1.15l-3.16-.71c-2.3-.51-4.04-1.76-4.04-4.46,0-3.01,2.33-5.02,5.9-5.02,2.74,0,4.78,1.13,6.25,2.84l-2.5,2.6c-.81-1.18-1.84-2.08-3.75-2.08-1.15,0-2.01.51-2.01,1.3,0,.71.56.93,1.18,1.08l3.06.71c3.06.71,4.41,2.13,4.41,4.65,0,3.21-2.84,4.92-6.32,4.92-3.06,0-5.24-.98-6.91-2.69l2.33-2.94Z"/>' +
          '<path d="M390.33,32.46v-3.6h3.85v-8.23h-3.85v-3.6h11.86v3.6h-3.85v8.23h3.85v3.6h-11.86Z"/>' +
          '<path d="M417.16,29.47h-4.58l-.83,2.99h-4.04l4.73-15.43h5.1l4.73,15.43h-4.26l-.83-2.99ZM413.46,26.36h2.84l-1.37-4.9h-.1l-1.37,4.9Z"/>' +
          '<path d="M436.34,26.05v-9.01h3.77v15.43h-3.9l-5.17-10.56v10.56h-3.77v-15.43h4.95l4.11,9.01Z"/>' +
          '<path d="M454.6,29.47h-4.58l-.83,2.99h-4.04l4.73-15.43h5.1l4.73,15.43h-4.26l-.83-2.99ZM450.9,26.36h2.84l-1.37-4.9h-.1l-1.37,4.9Z"/>' +
          // Large LA.IO text
          '<path d="M66.14,19.91v22.03h14.23v6.89h-22.03v-28.92h7.8Z"/>' +
          '<path d="M107.72,43.23h-8.58l-1.56,5.6h-7.57l8.86-28.92h9.55l8.86,28.92h-7.99l-1.56-5.6ZM100.79,37.4h5.32l-2.57-9.18h-.18l-2.57,9.18Z"/>' +
          '<path d="M134.3,40.02h8.81v8.81h-8.81v-8.81Z"/>' +
          '<path d="M162.67,48.83v-6.75h7.21v-15.42h-7.21v-6.75h22.22v6.75h-7.21v15.42h7.21v6.75h-22.22Z"/>' +
          '<path d="M208.85,49.38c-7.44,0-12.99-6.11-12.99-15.01s5.55-15.01,12.99-15.01,12.99,6.1,12.99,15.01-5.55,15.01-12.99,15.01ZM208.85,26.25c-3.12,0-5.1,3.21-5.1,8.12s1.97,8.12,5.1,8.12,5.09-3.21,5.09-8.12-1.97-8.12-5.09-8.12Z"/>' +
          // Left chevron arrow
          '<polygon points="14.73 33.94 41.3 60.51 33.94 67.88 0 33.94 33.94 0 41.3 7.36 14.73 33.94"/>' +
          // Right chevron arrow
          '<polygon points="265.45 33.94 238.87 7.36 246.24 0 280.17 33.94 246.24 67.88 238.87 60.51 265.45 33.94"/>' +
        '</g>' +
      '</svg>';
  }

  // Get SVG markup based on layout
  function getSvgMarkup(layout, px, color, bgColor, fgColor) {
    switch (layout) {
      case 'pill':
        return pillSvgMarkup(px, color, bgColor, fgColor);
      case 'horizontal':
        return horizontalSvgMarkup(px, color);
      default:
        return standardSvgMarkup(px, color);
    }
  }

  // ===== Badge Creation =====
  function makeBadge(opts) {
    var safeSize = sanitizeSize(opts.size);
    var safeColor = sanitizeColor(opts.color);
    var safeSlug = sanitizeSlug(opts.slug);
    var safeLayout = sanitizeLayout(opts.layout);
    var safeBgColor = opts.bgColor ? sanitizeColor(opts.bgColor) : null;
    var safeFgColor = opts.fgColor ? sanitizeColor(opts.fgColor) : null;
    var px = getPixels(safeSize);

    var el = document.createElement('span');
    el.setAttribute('data-laio-badge', '');
    el.style.display = 'inline-block';
    el.style.lineHeight = '0';

    if (opts.debug) {
      el.style.outline = '1px dashed #f0f';
    }

    var a = document.createElement('a');
    a.href = 'https://la.io/?ref=badge&slug=' + encodeURIComponent(safeSlug);
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = getSvgMarkup(safeLayout, px, safeColor, safeBgColor, safeFgColor);

    el.appendChild(a);
    return el;
  }

  // ===== Tracking =====
  function ping(kind, payload, debug) {
    if (!ENDPOINT) return;

    try {
      var data = {
        t: kind,
        slug: payload.slug,
        color: payload.color,
        size: payload.size,
        layout: payload.layout || 'standard',
        v: VERSION,
        domain: location.hostname,
        page: location.href,
        ua: navigator.userAgent
      };

      // For clicks, use sendBeacon if available (more reliable)
      if (kind === 'click' && navigator.sendBeacon) {
        try {
          var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          navigator.sendBeacon(ENDPOINT, blob);
          return;
        } catch (e) {
          // Fall through to pixel method
        }
      }

      // Pixel fallback (GET request)
      var qs = new URLSearchParams(data);
      qs.set('r', Math.random().toString(36).slice(2));
      if (debug) qs.set('debug', '1');
      var url = ENDPOINT + '?' + qs.toString();
      (new Image(1, 1)).src = url;
    } catch (e) {
      // Silent fail - tracking should never break the badge
    }
  }

  // ===== Badge Mounting =====
  function mountBadge(state) {
    var where = state.targetId ? document.getElementById(state.targetId) : null;
    var anchorParent = where || (state.anchor && state.anchor.parentNode) || document.body || document.documentElement;

    if (!anchorParent) return null;

    // Don't re-mount if already connected
    if (state.badge && state.badge.isConnected) return state.badge;

    var b = makeBadge(state);

    // Insert before script tag if possible, else append to target
    if (!where && state.anchor && state.anchor.parentNode) {
      state.anchor.parentNode.insertBefore(b, state.anchor);
    } else {
      anchorParent.appendChild(b);
    }

    // Track impression (once per page load)
    if (!state.logged && state.track) {
      ping('impression', {
        slug: state.slug,
        color: state.color,
        size: state.size,
        layout: state.layout
      }, state.debug);
      state.logged = true;
    }

    // Track clicks
    try {
      b.querySelector('a').addEventListener('click', function() {
        if (!state.track) return;
        ping('click', {
          slug: state.slug,
          color: state.color,
          size: state.size,
          layout: state.layout
        }, state.debug);
      });
    } catch (e) {
      // Silent fail
    }

    state.badge = b;
    return b;
  }

  // ===== SPA Support =====
  function startObserver(state) {
    if (state.observer) return;

    // Re-mount badge if SPA removes it
    state.observer = new MutationObserver(function() {
      if (!state.badge || !state.badge.isConnected) {
        mountBadge(state);
      }
    });

    state.observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Handle client-side navigation
    ['pushState', 'replaceState'].forEach(function(fn) {
      var orig = history[fn];
      history[fn] = function() {
        var r = orig.apply(this, arguments);
        setTimeout(function() {
          mountBadge(state);
        }, 0);
        return r;
      };
    });

    window.addEventListener('popstate', function() {
      setTimeout(function() {
        mountBadge(state);
      }, 0);
    });
  }

  // ===== Initialization =====
  onReady(function() {
    var s = getSelfScript() || { dataset: {} };
    var ds = (s && s.dataset) || {};

    var state = {
      slug: pickSlug(ds),
      color: sanitizeColor(ds.color),
      size: sanitizeSize(ds.size),
      layout: sanitizeLayout(ds.layout),
      bgColor: ds.bgColor || null, // Two-color mode for Pill
      fgColor: ds.fgColor || null, // Two-color mode for Pill
      targetId: sanitizeTargetId(ds.target),
      debug: ds.debug === '1',
      track: ds.track !== '0',
      anchor: s,
      badge: null,
      logged: false,
      observer: null
    };

    mountBadge(state);
    startObserver(state);
  });
})();
