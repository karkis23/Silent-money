import { Helmet } from 'react-helmet-async';

export default function SEO({
    title = 'Silent Money - Build Your Financial Dynasty Quietly',
    description = 'Discover 60+ vetted passive income ideas and franchise opportunities tailored for India. Data-backed blueprints with realistic ROI projections.',
    keywords = 'passive income india, franchise opportunities, income ideas, financial freedom, side hustle india',
    ogImage = '/og-image.jpg',
    ogType = 'website',
    twitterCard = 'summary_large_image'
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

            {/* Additional SEO */}
            <meta name="robots" content="index, follow" />
            <meta name="language" content="English" />
            <meta name="author" content="Silent Money" />
            <link rel="canonical" href={siteUrl} />
        </Helmet>
    );
}
