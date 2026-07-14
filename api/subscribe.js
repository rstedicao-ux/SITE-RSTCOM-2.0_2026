// Vercel Serverless Function to connect securely to Odoo XML-RPC/JSON-RPC API
// This code runs on the server side, keeping your Odoo credentials completely safe.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email } = req.body;

  // Simple validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  // Get credentials from Vercel Environment Variables
  const ODOO_URL = process.env.ODOO_URL;       // e.g., https://rstcomcombr.odoo.com
  const ODOO_DB = process.env.ODOO_DB;         // e.g., rstcomcombr
  const ODOO_EMAIL = process.env.ODOO_EMAIL;   // e.g., your-odoo-user@rstcom.net
  const ODOO_PASSWORD = process.env.ODOO_PASSWORD; // Odoo API Key or Password

  // Check if configuration exists
  if (!ODOO_URL || !ODOO_DB || !ODOO_EMAIL || !ODOO_PASSWORD) {
    console.error('Odoo integration is missing credentials in environment variables.');
    return res.status(500).json({ 
      error: 'Server configuration error.', 
      details: 'Please set ODOO_URL, ODOO_DB, ODOO_EMAIL, and ODOO_PASSWORD in Vercel.' 
    });
  }

  // Ensure clean Odoo URL (no trailing slash, strip web client paths like /odoo or /web)
  let odooBaseUrl = ODOO_URL.trim().replace(/\/$/, '');
  odooBaseUrl = odooBaseUrl.replace(/\/(odoo|web)$/, '');
  const rpcUrl = `${odooBaseUrl}/jsonrpc`;

  try {
    console.log(`Attempting to authenticate user ${ODOO_EMAIL} on Odoo database ${ODOO_DB}...`);

    // 1. Authenticate with Odoo to get User ID (uid)
    const authResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'common',
          method: 'login',
          args: [ODOO_DB, ODOO_EMAIL, ODOO_PASSWORD]
        },
        id: Date.now()
      })
    });

    if (!authResponse.ok) {
      throw new Error(`Failed to reach Odoo auth endpoint. Status: ${authResponse.status}`);
    }

    const authResult = await authResponse.json();

    if (authResult.error) {
      console.error('Odoo login failed with error:', authResult.error);
      return res.status(401).json({ error: 'Odoo login failed', details: authResult.error });
    }

    const uid = authResult.result;
    if (!uid || uid === false) {
      console.error('Odoo login returned invalid UID (incorrect email or password/key).');
      return res.status(401).json({ error: 'Invalid Odoo credentials.' });
    }

    console.log(`Authenticated successfully. Odoo UID: ${uid}. Checking for existing contact...`);

    // 2. Search if a contact with this email already exists in res.partner
    const searchResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            ODOO_DB,
            uid,
            ODOO_PASSWORD,
            'res.partner',
            'search',
            [[['email', '=', email]]]
          ]
        },
        id: Date.now() + 1
      })
    });

    if (!searchResponse.ok) {
      throw new Error(`Failed to reach Odoo object endpoint during search. Status: ${searchResponse.status}`);
    }

    const searchResult = await searchResponse.json();
    if (searchResult.error) {
      console.error('Odoo search failed with error:', searchResult.error);
      return res.status(500).json({ error: 'Odoo search failed', details: searchResult.error.message || searchResult.error });
    }

    const existingPartners = searchResult.result || [];
    let partnerId = null;

    if (existingPartners.length > 0) {
      partnerId = existingPartners[0];
      console.log(`Partner already exists in Odoo with ID: ${partnerId}.`);
    } else {
      console.log(`Creating new contact res.partner for ${name} (${email})...`);
      // 3. Create a new contact (res.partner) in Odoo
      const createResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'object',
            method: 'execute_kw',
            args: [
              ODOO_DB,
              uid,
              ODOO_PASSWORD,
              'res.partner',
              'create',
              [{
                name: name,
                email: email,
                comment: 'Inscrito via formulário de Newsletter do Novo Site'
              }]
            ]
          },
          id: Date.now() + 2
        })
      });

      if (createResponse.ok) {
        const createResult = await createResponse.json();
        if (!createResult.error) {
          partnerId = createResult.result;
          console.log(`Created contact in res.partner successfully. Partner ID: ${partnerId}.`);
        } else {
          console.warn('Non-blocking: Failed to create res.partner contact:', createResult.error);
        }
      } else {
        console.warn('Non-blocking: Failed to reach res.partner create endpoint.');
      }
    }

    // 4. Register contact in Email Marketing Mailing List (mass_mailing)
    let mailingContactId = null;
    try {
      const listName = "Se inscreveram no site para receber as news";
      console.log(`Searching for Odoo mailing list named "${listName}"...`);

      // Search for the mailing list
      const listSearchResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'object',
            method: 'execute_kw',
            args: [
              ODOO_DB,
              uid,
              ODOO_PASSWORD,
              'mailing.list',
              'search',
              [[['name', 'ilike', 'Se inscreveram no site para receber as news']]]
            ]
          },
          id: Date.now() + 3
        })
      });

      if (listSearchResponse.ok) {
        const listSearchResult = await listSearchResponse.json();
        if (listSearchResult.result && listSearchResult.result.length > 0) {
          const listId = listSearchResult.result[0];
          console.log(`Mailing list found with ID: ${listId}. Checking for existing mailing contact...`);

          // Check if mailing contact with this email already exists
          const contactSearchResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'call',
              params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                  ODOO_DB,
                  uid,
                  ODOO_PASSWORD,
                  'mailing.contact',
                  'search',
                  [[['email', '=', email]]]
                ]
              },
              id: Date.now() + 4
            })
          });

          if (contactSearchResponse.ok) {
            const contactSearchResult = await contactSearchResponse.json();
            const existingMailingContacts = contactSearchResult.result || [];

            if (existingMailingContacts.length > 0) {
              mailingContactId = existingMailingContacts[0];
              console.log(`Mailing contact already exists (ID: ${mailingContactId}). Subscribing/linking to list...`);

              // Add the list to the existing contact (many2many command 4: link)
              await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'call',
                  params: {
                    service: 'object',
                    method: 'execute_kw',
                    args: [
                      ODOO_DB,
                      uid,
                      ODOO_PASSWORD,
                      'mailing.contact',
                      'write',
                      [[mailingContactId], {
                        list_ids: [[4, listId, 0]]
                      }]
                    ]
                  },
                  id: Date.now() + 5
                })
              });
              console.log(`Mailing contact ${mailingContactId} updated successfully.`);
            } else {
              console.log('Creating new mailing contact...');
              // Create new mailing contact and link to the list (many2many command 6: replace with listId)
              const contactCreateResponse = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'call',
                  params: {
                    service: 'object',
                    method: 'execute_kw',
                    args: [
                      ODOO_DB,
                      uid,
                      ODOO_PASSWORD,
                      'mailing.contact',
                      'create',
                      [{
                        name: name,
                        email: email,
                        list_ids: [[6, 0, [listId]]]
                      }]
                    ]
                  },
                  id: Date.now() + 6
                })
              });

              if (contactCreateResponse.ok) {
                const contactCreateResult = await contactCreateResponse.json();
                if (!contactCreateResult.error) {
                  mailingContactId = contactCreateResult.result;
                  console.log(`Mailing contact created successfully. ID: ${mailingContactId}.`);
                } else {
                  console.error('Failed to create mailing contact:', contactCreateResult.error);
                }
              }
            }
          }
        } else {
          console.warn(`Mailing list "${listName}" not found in Odoo. Skipping Email Marketing integration.`);
        }
      }
    } catch (mailingErr) {
      console.error('Non-blocking: Failed to register contact in Odoo mailing list:', mailingErr);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Subscription processed successfully.', 
      partner_id: partnerId,
      mailing_contact_id: mailingContactId
    });

  } catch (error) {
    console.error('Unexpected error in Odoo serverless function:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
