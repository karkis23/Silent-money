import { Helmet } from 'react-helmet-async';

/**
 * SEO Component: The authoritative engine for injecting high-fidelity metadata into the document head.
 * 
 * CORE OPERATIONS:
 * - Title Normalization: Dynamically appends the 'Silent Money' brand suffix to page titles.
 * - Open Graph Orchestration: Injects social-ready signals for Facebook, LinkedIn, and dynamic link previews.
 * - Twitter Card Management: Handles institutional previews for high-velocity information sharing.
 * - Discovery Optimization: Manages robots, language, and canonical URL normalization for search indexing.
 * 
 * @param {Object} props - Component properties.
 * @param {string} props.title - The primary page title.
 * @param {string} props.description - High-impact SEO summary of the page content.
 * @param {string} props.keywords - Targeted discovery tags for search indexing.
 * @param {string} props.ogImage - Path to the social sharing visual asset.
 * @param {string} props.ogType - Open Graph classification (e.g., 'website', 'article').
 */
export default function SEO({
    title = 'Silent Money - Build Your Financial Dynasty Quietly',
    description = 'Discover 60+ vetted passive income ideas and franchise opportunities tailored for India. Data-backed blueprints with realistic ROI projections.',
    keywords = 'passive income india, franchise opportunities, income ideas, financial freedom, side hustle india',
    ogImage = '/og-image.jpg',
    ogType = 'website',
    twitterCard = 'summary_large_image',
    schemaData = null
}) {
    const siteUrl = 'https://silent-money.vercel.app'; // Update with your actual domain
    const fullTitle = title.includes('Silent Money') ? title : `${title} | Silent Money`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`${siteUrl}${ogImage}`} />

            {/* Twitter */}
            <meta property="twitter:card" content={twitterCard} />
            <meta property="twitter:url" content={siteUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />

            {/* Structured Data (JSON-LD) */}
            {schemaData && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            )}

            {/* Additional SEO */}
            <meta name="robots" content="index, follow" />
            <meta name="language" content="English" />
            <meta name="author" content="Silent Money" />
            <link rel="canonical" href={siteUrl} />
        </Helmet>
    );
}
