exports.handler = async (event, context) => {
  console.log('[FacebookBulkAnalyze] Bulk analysis', { body: event.body });

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { campaign } = JSON.parse(event.body || '{}');
    if (!campaign) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing campaign' }),
      };
    }

    const results = {
      campaign: {
        id: campaign.id,
        summary: `Kampagne "${campaign.name}" wurde analysiert.`,
      },
      adsets: (campaign.meta_ad_sets || []).map((adset) => ({
        id: adset.id,
        analysis: {
          summary: `AdSet "${adset.name}" analysiert.`,
        },
      })),
      ads: (campaign.meta_ad_sets || []).flatMap((adset) =>
        (adset.meta_ads || []).map((ad) => ({
          id: ad.id,
          analysis: {
            summary: `Ad "${ad.name}" analysiert.`,
          },
        }))
      ),
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ results }),
    };
  } catch (err) {
    console.error('[FacebookBulkAnalyze] exception', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || String(err) }),
    };
  }
};
