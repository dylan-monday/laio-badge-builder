# Deployment Guide

This guide covers deploying the LA.IO Badge Builder to various hosting platforms.

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] Run `npm run build` successfully
- [ ] Test the production build with `npm run preview`
- [ ] Update environment variables for production
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Verify all security headers are configured
- [ ] Check that fonts load correctly
- [ ] Test badge embedding on sample website
- [ ] Verify analytics/tracking is working
- [ ] Review and update CSP headers if needed

---

## 🚀 Deployment Options

### Option 1: Netlify (Recommended)

**Pros**: Zero configuration, automatic HTTPS, global CDN, continuous deployment

**Steps**:

1. **Connect Repository**
   ```bash
   # Push your code to GitHub/GitLab/Bitbucket first
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy via Netlify Dashboard**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider
   - Select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Configure Environment Variables**
   - Go to Site settings → Environment variables
   - Add your production variables:
     ```
     VITE_BADGE_JS_URL=https://your-domain.com/badge.js
     VITE_TRACKING_ENDPOINT=<your-endpoint>
     VITE_ENV=production
     ```

4. **Add Custom Domain** (Optional)
   - Go to Domain settings
   - Add your custom domain (e.g., badgebuilder.la.io)
   - Update DNS records as instructed

5. **Configure Headers** (Security)
   - Create `netlify.toml` in project root:
   ```toml
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-Content-Type-Options = "nosniff"
       X-XSS-Protection = "1; mode=block"
       Referrer-Policy = "strict-origin-when-cross-origin"
       Permissions-Policy = "geolocation=(), microphone=(), camera=()"
   ```

---

### Option 2: Vercel

**Pros**: Excellent performance, zero config, preview deployments

**Steps**:

1. **Install Vercel CLI** (Optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI**
   ```bash
   vercel
   # Follow prompts to link project
   vercel --prod  # Deploy to production
   ```

3. **Or Deploy via Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your Git repository
   - Build settings (auto-detected):
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables
   - Click "Deploy"

4. **Configure Headers**
   - Create `vercel.json`:
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           },
           {
             "key": "X-XSS-Protection",
             "value": "1; mode=block"
           }
         ]
       }
     ]
   }
   ```

---

### Option 3: AWS S3 + CloudFront

**Pros**: Full control, excellent for enterprise, scalable

**Steps**:

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   # Using AWS CLI
   aws s3 mb s3://badgebuilder-laio
   ```

3. **Configure Bucket for Static Hosting**
   ```bash
   aws s3 website s3://badgebuilder-laio \
     --index-document index.html \
     --error-document index.html
   ```

4. **Upload Build Files**
   ```bash
   aws s3 sync dist/ s3://badgebuilder-laio \
     --delete \
     --cache-control max-age=31536000,public

   # Cache HTML files shorter
   aws s3 cp dist/index.html s3://badgebuilder-laio/index.html \
     --cache-control max-age=3600,public \
     --metadata-directive REPLACE
   ```

5. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Compress Objects Automatically: Yes
   - Default Root Object: index.html

6. **Configure Custom Headers** (Lambda@Edge)
   - Create Lambda function to add security headers
   - Attach to CloudFront as Origin Response trigger

---

### Option 4: GitHub Pages

**Pros**: Free, simple, good for public projects

**Steps**:

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add Deploy Script** to `package.json`:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update Vite Config** for correct base path:
   ```js
   // vite.config.js
   export default defineConfig({
     base: '/badge-builder/',  // Replace with your repo name
     // ... rest of config
   });
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: gh-pages
   - Save

**Note**: GitHub Pages doesn't support custom headers, so security headers must be added via meta tags in HTML.

---

### Option 5: Self-Hosted (Apache/Nginx)

**Pros**: Complete control, can integrate with existing infrastructure

#### Apache Configuration

1. **Build and Upload**
   ```bash
   npm run build
   # Upload dist/ folder to your server
   scp -r dist/* user@server:/var/www/badgebuilder/
   ```

2. **Apache VirtualHost** (`/etc/apache2/sites-available/badgebuilder.conf`):
   ```apache
   <VirtualHost *:80>
       ServerName badgebuilder.la.io
       DocumentRoot /var/www/badgebuilder

       <Directory /var/www/badgebuilder>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>

       # Redirect to HTTPS
       RewriteEngine On
       RewriteCond %{HTTPS} off
       RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
   </VirtualHost>

   <VirtualHost *:443>
       ServerName badgebuilder.la.io
       DocumentRoot /var/www/badgebuilder

       SSLEngine on
       SSLCertificateFile /path/to/cert.pem
       SSLCertificateKeyFile /path/to/key.pem

       <Directory /var/www/badgebuilder>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted

           # Security Headers
           Header always set X-Frame-Options "DENY"
           Header always set X-Content-Type-Options "nosniff"
           Header always set X-XSS-Protection "1; mode=block"
           Header always set Referrer-Policy "strict-origin-when-cross-origin"
       </Directory>

       # Cache static assets
       <FilesMatch "\.(js|css|woff|woff2|ttf|svg|jpg|jpeg|png|gif|ico)$">
           Header set Cache-Control "max-age=31536000, public"
       </FilesMatch>
   </VirtualHost>
   ```

3. **Enable and Restart**
   ```bash
   sudo a2ensite badgebuilder
   sudo a2enmod headers rewrite ssl
   sudo systemctl restart apache2
   ```

#### Nginx Configuration

1. **Build and Upload** (same as Apache)

2. **Nginx Server Block** (`/etc/nginx/sites-available/badgebuilder`):
   ```nginx
   server {
       listen 80;
       server_name badgebuilder.la.io;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name badgebuilder.la.io;

       root /var/www/badgebuilder;
       index index.html;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       # Security Headers
       add_header X-Frame-Options "DENY" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;

       # Compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

       # Cache static assets
       location ~* \.(js|css|woff|woff2|ttf|svg|jpg|jpeg|png|gif|ico)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # SPA fallback
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **Enable and Restart**
   ```bash
   sudo ln -s /etc/nginx/sites-available/badgebuilder /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 🔒 SSL/TLS Certificates

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx  # For Nginx
sudo apt-get install certbot python3-certbot-apache  # For Apache

# Obtain certificate
sudo certbot --nginx -d badgebuilder.la.io  # Nginx
sudo certbot --apache -d badgebuilder.la.io  # Apache

# Auto-renewal (runs automatically)
sudo certbot renew --dry-run
```

---

## 📊 Post-Deployment Testing

After deployment, verify:

1. **HTTPS Works**
   - Visit https://your-domain.com
   - Check for secure padlock icon
   - Verify certificate is valid

2. **Security Headers**
   ```bash
   curl -I https://your-domain.com | grep -i "x-frame-options\|x-content-type\|x-xss"
   ```

3. **Performance**
   - Test on [PageSpeed Insights](https://pagespeed.web.dev/)
   - Check [WebPageTest](https://www.webpagetest.org/)
   - Verify 90+ scores

4. **Functionality**
   - Create a badge
   - Copy embed code
   - Test embed on external site
   - Verify tracking works (if enabled)

5. **Browser Testing**
   - Chrome/Edge
   - Firefox
   - Safari (macOS and iOS)
   - Mobile browsers

---

## 🔄 Continuous Deployment

### GitHub Actions (Example)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_BADGE_JS_URL: ${{ secrets.BADGE_JS_URL }}
          VITE_TRACKING_ENDPOINT: ${{ secrets.TRACKING_ENDPOINT }}
          VITE_ENV: production

      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 🐛 Troubleshooting

### Fonts Not Loading

**Problem**: Aktiv Grotesk fonts don't display

**Solutions**:
- Check font file paths are correct
- Verify CORS headers allow font loading
- Ensure fonts are included in build output
- Check Content-Security Policy allows font sources

### Badge.js Not Found

**Problem**: Badge embed script returns 404

**Solutions**:
- Verify `badge.js` is in build output
- Check build configuration includes badge.js
- Update `VITE_BADGE_JS_URL` environment variable
- Clear CDN cache if using CloudFront/Cloudflare

### CSP Violations

**Problem**: Browser console shows CSP errors

**Solutions**:
- Review and update CSP meta tag
- Add missing sources to CSP policy
- Check inline scripts have proper nonces
- Verify external scripts are whitelisted

---

## 📞 Support

If you encounter deployment issues:

- Check the [troubleshooting section](#-troubleshooting)
- Review server/platform logs
- Test locally with `npm run preview`
- Email: [info@la.io](mailto:info@la.io)

---

**Last Updated**: November 2025
