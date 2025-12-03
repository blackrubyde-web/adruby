-- Migration zur Erstellung der Tabelle für generierte Werbestrategien
CREATE TABLE generated_strategies (
  id SERIAL PRIMARY KEY, -- Eine ID für jede Strategie
  ad_id UUID NOT NULL REFERENCES ads(id), -- Verknüpft mit der Ad-Tabelle
  user_id UUID NOT NULL REFERENCES users(id), -- Verknüpft mit der User-Tabelle
  strategy_data JSONB NOT NULL, -- JSON, das die generierte Strategie speichert
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Zeitpunkt der Erstellung
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Zeitpunkt der letzten Änderung
);
