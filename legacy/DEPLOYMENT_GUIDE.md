# 7Sense Landing Page - Deployment Guide

Since your domain is hosted on **Squarespace**, but your website is a **static HTML site**, you need to host the files elsewhere and then "point" your Squarespace domain to that host.

## Step 1: Upload Your Files

I recommend using **Vercel** (Fastest & Free for this scale) or **GitHub Pages**.

### Option A: Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com) and create a free account.
2. Drag and drop your `7sense_landing` folder onto the Vercel dashboard.
3. Vercel will give you a temporary URL (e.g., `7sense.vercel.app`).

## Step 2: Connect Your Squarespace Domain

Once your site is uploaded, you need to tell Squarespace where to find it.

1. Log in to your **Squarespace** account.
2. Go to **Settings > Domains**.
3. Click on your `7sense.net` domain.
4. Click **DNS Settings**.
5. Add the following records (Vercel will provide the exact values during their "Add Domain" setup):
   - **Type A**: Point `@` to Vercel's IP (`76.76.21.21`).
   - **Type CNAME**: Point `www` to `cname.vercel-dns.com`.

## Step 3: Wait for Propagation

DNS changes can take up to 24 hours to take effect globally, but usually work within 1-2 hours.

---
**Need help?** If you provide me with your preferred hosting choice, I can generate the specific DNS records for you.
