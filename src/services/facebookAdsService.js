const API_BASE = '/.netlify/functions';

async function apiRequest(functionName, options = {}) {
  try {
    const res = await fetch(`${API_BASE}/${functionName}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      ...options,
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      console.error(`[facebookAdsService] ${functionName} error`, data);
      return {
        success: false,
        error: data?.error || data || `Request failed with status ${res.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`[facebookAdsService] ${functionName} exception`, error);
    return {
      success: false,
      error: error.message || String(error),
    };
  }
}

const facebookAdsService = {
  /**
   * Hole aktuelle Facebook-Verbindungsdaten für den eingeloggten User
   */
  async getFacebookConnection(userId) {
    if (!userId) return { success: false, error: 'Missing userId' };

    const query = `facebook-get-connection?userId=${encodeURIComponent(userId)}`;
    return apiRequest(query, {
      method: 'GET',
    });
  },

  /**
   * Speichere / aktualisiere eine Facebook-Verbindung für den User
   * payload: { userId, adAccountId?, pageId?, meta? }
   */
  async connectFacebook(payload) {
    return apiRequest('facebook-connect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Trenne die Facebook-Verbindung für den eingeloggten User
   */
  async disconnectFacebook(userId) {
    return apiRequest('facebook-disconnect', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Lade Kampagnen inkl. AdSets und Ads aus unserer eigenen DB
   * (die via Sync-Funktion aus Meta gefüllt wird)
   */
  async fetchCampaigns(userId) {
    return apiRequest('facebook-fetch-campaigns', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Single-Analyse für Kampagne / AdSet / Ad
   * item: Objekt mit id, name, KPIs
   * type: 'campaign' | 'adset' | 'ad'
   */
  async analyzePerformanceWithKPIs(item, type, options = {}) {
    const payload = {
      item,
      type,
      strategy: options.strategy || null,
      product: options.product || null,
      ad: options.ad || null,
      answers: options.answers || null,
    };

    return apiRequest('facebook-analyze-performance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Bulk-Analyse für eine komplette Kampagne
   * onProgress: Callback(progress: number) -> wird clientseitig aufgerufen
   */
  async bulkAnalyzeCampaignData(campaign, onProgress) {
    // Optional: clientseitige Progress-Simulation
    if (onProgress) {
      onProgress(10);
    }

    const result = await apiRequest('facebook-bulk-analyze', {
      method: 'POST',
      body: JSON.stringify({ campaign }),
    });

    if (onProgress) {
      onProgress(100);
    }

    return result;
  },
};

export default facebookAdsService;
