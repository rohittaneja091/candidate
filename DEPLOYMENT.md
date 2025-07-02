# PhD Recruiting Database - Production Deployment Guide

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Domain** (optional): For custom domain

## Step 1: Set up Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor and run the scripts in this order:
   - `scripts/create-database.sql`
   - `scripts/seed-data.sql`
   - `scripts/supabase-setup.sql`

3. Get your Supabase credentials:
   - Go to Settings > API
   - Copy the Project URL and anon public key

## Step 2: Get API Keys (Optional but Recommended)

### Semantic Scholar API Key
1. Visit [Semantic Scholar API](https://www.semanticscholar.org/product/api)
2. Request an API key for higher rate limits
3. Add to environment variables

## Step 3: Deploy to Vercel

1. **Connect GitHub Repository**:
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   \`\`\`

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:

   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_api_key
   CONTACT_EMAIL=your-email@domain.com
   \`\`\`

3. **Deploy**: Click "Deploy" and wait for deployment to complete

## Step 4: Configure Domain (Optional)

1. In Vercel dashboard, go to your project
2. Go to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed

## Step 5: Test the Application

1. Visit your deployed URL
2. Test adding a candidate with publication search
3. Verify data is being stored in Supabase
4. Test all filters and search functionality

## Step 6: Set up Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Supabase Monitoring**: Check database performance
3. **Error Tracking**: Consider adding Sentry

## API Rate Limits

- **OpenAlex**: No API key required, generous rate limits
- **Semantic Scholar**: 100 requests/5 minutes without key, 1000/5 minutes with key
- **CrossRef**: Polite pool (50 requests/second) with proper User-Agent

## Security Considerations

1. **Row Level Security**: Already enabled in Supabase setup
2. **API Keys**: Store in environment variables only
3. **Input Validation**: Implemented in API routes
4. **CORS**: Configured for your domain only

## Scaling Considerations

1. **Database**: Supabase auto-scales
2. **API Limits**: Monitor usage and upgrade plans if needed
3. **Caching**: Consider Redis for frequently accessed data
4. **Background Jobs**: Use Vercel Cron for periodic data updates

## Maintenance

1. **Regular Backups**: Supabase provides automatic backups
2. **Update Dependencies**: Keep packages updated
3. **Monitor Performance**: Use Vercel and Supabase dashboards
4. **Data Quality**: Regularly review and clean scraped data

## Troubleshooting

### Common Issues:

1. **API Rate Limits**: Implement exponential backoff
2. **Duplicate Publications**: Deduplication logic is in place
3. **Missing Data**: Check API responses and error logs
4. **Slow Queries**: Database indexes are optimized

### Support:

- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Academic APIs: Check respective documentation
