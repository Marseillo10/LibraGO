import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
}

export default function SEO({
    title,
    description,
    name = 'LibraGO',
    type = 'website'
}: SEOProps) {
    const siteTitle = 'LibraGO - Your Personal Digital Library';
    const metaTitle = title ? `${title} | ${name}` : siteTitle;
    const metaDescription = description || 'Discover, read, and track your favorite books with LibraGO. The modern digital library experience.';

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{metaTitle}</title>
            <meta name='description' content={metaDescription} />

            {/* Open Graph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />

            {/* Twitter Card tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
        </Helmet>
    );
}
