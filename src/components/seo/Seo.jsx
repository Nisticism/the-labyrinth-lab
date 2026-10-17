import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://the-ll.com';
const SITE_NAME = 'The Labyrinth Lab';
const DEFAULT_TITLE = 'The Labyrinth Lab — Custom Woodworking in San Antonio, TX';
const DEFAULT_DESCRIPTION =
  'The Labyrinth Lab — custom handcrafted woodworking in San Antonio, TX. ' +
  'Labyrinths, chess boards, charcuterie boards, furniture, pens, and more. Commissions welcome.';
const DEFAULT_IMAGE = `${SITE_URL}/images/thomas-moralez/OTM-1.jpg`;

// Per-page document head. Pass a page title/description/path so each route gets
// a unique <title>, meta description, canonical URL, and matching social tags.
function Seo({ title, description, path = '', image }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const canonical = `${SITE_URL}${path}`;
  const shareImage = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={shareImage} />

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={shareImage} />
    </Helmet>
  );
}

export default Seo;
