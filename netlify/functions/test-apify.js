// netlify/functions/test-apify.js
const { callApifyFacebookAdsLibrary } = require('./_shared/apifyClient');

exports.handler = async () => {
  try {
    const url =
      'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=DE&q=kalorienzähler';

    const ads = await callApifyFacebookAdsLibrary({
      urls: [url],
      period: 'last30d',
      limitPerSource: 5,
      count: 5,
      countryCode: 'DE',
      activeStatus: 'all',
      scrapeAdDetails: true,
    });

    console.log('[TestApify] Got ads:', ads.length);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          count: ads.length,
          sample: ads.slice(0, 2), // nur 2 Ads zurück für Übersicht
        },
        null,
        2,
      ),
    };
  } catch (error) {
    console.error('[TestApify] Error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
