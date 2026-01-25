-- UPDATE FRANCHISES TABLE SCHEMA
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE franchises ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- ADD REALISTIC DATA FOR CONNECTIVITY
UPDATE franchises SET 
  website_url = 'https://amul.com/m/amul-scooping-parlours',
  contact_email = 'retail@amul.coop',
  contact_phone = '+91 2692 258506'
WHERE slug LIKE '%amul%';

UPDATE franchises SET 
  website_url = 'https://www.dtdc.in/franchisee/',
  contact_email = 'franchise@dtdc.com',
  contact_phone = '+91 80 2536 5032'
WHERE slug LIKE '%dtdc%';

UPDATE franchises SET 
  website_url = 'https://www.firstcry.com/franchisee',
  contact_email = 'franchise@firstcry.com',
  contact_phone = '+91 20 6726 0000'
WHERE slug LIKE '%firstcry%';

UPDATE franchises SET 
  website_url = 'https://www.lenskart.com/franchise',
  contact_email = 'franchise@lenskart.in',
  contact_phone = '+91 99998 99998'
WHERE slug LIKE '%lenskart%';

UPDATE franchises SET 
  website_url = 'https://www.lalpathlabs.com/franchise',
  contact_email = 'franchise@lalpathlabs.com',
  contact_phone = '011-39885050'
WHERE slug LIKE '%dr-lal%';

UPDATE franchises SET 
  website_url = 'https://www.zudio.com',
  contact_email = 'franchise@trent-tata.com',
  contact_phone = '+91 22 6700 9000'
WHERE slug LIKE '%zudio%';

UPDATE franchises SET 
  website_url = 'https://www.tataev.com',
  contact_email = 'evsupport@tatamotors.com',
  contact_phone = '1800-209-6688'
WHERE slug LIKE '%tata-ev%';

UPDATE franchises SET 
  website_url = 'https://mbachaiwala.com',
  contact_email = 'franchise@mbachaiwala.com',
  contact_phone = '+91 91111 60231'
WHERE slug LIKE '%mba-chai%';
