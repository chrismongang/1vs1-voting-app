/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "www.directupload.eu",
      process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "",
      "rmagjludjqfhcpkmvzae.supabase.co", // Ersetze dies mit deiner Supabase-Domain
    ],
  },
}

module.exports = nextConfig

