-- Migration to add enhanced business intelligence fields to the franchises table
-- Run this in your Supabase SQL Editor

ALTER TABLE franchises
ADD COLUMN IF NOT EXISTS unit_model TEXT DEFAULT 'FOCO / FOFO Configuration',
ADD COLUMN IF NOT EXISTS market_maturity TEXT DEFAULT 'High - National Leader',
ADD COLUMN IF NOT EXISTS corporate_support TEXT DEFAULT 'Full Training Included',
ADD COLUMN IF NOT EXISTS operator_retention INTEGER DEFAULT 94,
ADD COLUMN IF NOT EXISTS network_density INTEGER DEFAULT 82,
ADD COLUMN IF NOT EXISTS asset_grade TEXT DEFAULT 'A',
ADD COLUMN IF NOT EXISTS risk_profile TEXT DEFAULT 'Low',
ADD COLUMN IF NOT EXISTS supply_chain TEXT DEFAULT 'Centralized Procurement',
ADD COLUMN IF NOT EXISTS staffing_model TEXT DEFAULT '4-6 Certified Personnel',
ADD COLUMN IF NOT EXISTS tech_stack TEXT DEFAULT 'Integrated POS & CRM',
ADD COLUMN IF NOT EXISTS marketing_support TEXT DEFAULT 'National Brand Campaigns';

-- Comment on columns for clarity
COMMENT ON COLUMN franchises.unit_model IS 'The operational model of the franchise (e.g., FOCO, FOFO, COCO)';
COMMENT ON COLUMN franchises.market_maturity IS 'The maturity level of the market for this franchise';
COMMENT ON COLUMN franchises.corporate_support IS 'Description of the support provided by the corporate HQ';
COMMENT ON COLUMN franchises.operator_retention IS 'Percentage of operators who renew their contracts';
COMMENT ON COLUMN franchises.network_density IS 'A score or percentage representing the density of the network';
COMMENT ON COLUMN franchises.asset_grade IS 'A grade (e.g., AAA+, A, B) assigned to the asset';
COMMENT ON COLUMN franchises.risk_profile IS 'The risk level associated with the franchise (e.g., Low, Medium, High)';
COMMENT ON COLUMN franchises.supply_chain IS 'Details about the supply chain logistics';
COMMENT ON COLUMN franchises.staffing_model IS 'Requirements and model for staffing';
COMMENT ON COLUMN franchises.tech_stack IS 'Details about the technology stack used';
COMMENT ON COLUMN franchises.marketing_support IS 'Details about the marketing support provided';
