# HPC Kupwara

Responsive Next.js App Router + Tailwind CSS school registration form with Sanity CMS storage. Registration page: `/registration`.

## Setup
1. Install Node.js 20.9+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and enter your Sanity project ID, dataset and a write token.
4. Add `sanity/schemaTypes/hpcSchoolRegistration.ts` to the schema types array in your Sanity Studio. The schema exports are in `sanity/schemaTypes/index.ts`.
5. Run `npm run dev` and open `http://localhost:3000/registration`.

## Deploy
Push to GitHub, import into Vercel, and add the same environment variables in Vercel project settings. Deploy.

## Validation and behavior
- UDISE: exactly 11 digits, beginning with zero.
- Zone: restricted to the 13 options supplied.
- Choosing No reveals a required reason textarea.
- Choosing Yes reveals total staff, registered staff, KG–Class 8 student enrollment, registered enrollment and school admin phone.
- API validates submissions server-side and saves them as `hpcSchoolRegistration` documents in Sanity.
- Registered counts cannot exceed total counts.

The school name is entered manually; this starter does not perform a live UDISE lookup. Keep `SANITY_API_TOKEN` private and never prefix it with `NEXT_PUBLIC_`. Add authentication/rate limiting if submissions should be restricted.
