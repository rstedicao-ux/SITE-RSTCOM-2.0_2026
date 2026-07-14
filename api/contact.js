// Vercel Serverless Function to securely register contact form leads in Odoo res.partner
// Runs on the server side to protect Odoo database credentials.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {}
  }
  const { name, email, phone, business, message } = body || {};

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.', received: req.body, type: typeof req.body });
  }

  // Get credentials from Vercel Environment Variables
  const ODOO_URL = process.env.ODOO_URL;
  const ODOO_DB = process.env.ODOO_DB;
  const ODOO_EMAIL = process.env.ODOO_EMAIL;
  const ODOO_PASSWORD = process.env.ODOO_PASSWORD;

  // Check if configuration exists
  if (!ODOO_URL || !ODOO_DB || !ODOO_EMAIL || !ODOO_PASSWORD) {
    console.error('Odoo integration is missing credentials in environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // Clean Odoo URL
  let odooBaseUrl = ODOO_URL.trim().replace(/\/$/, '');
  odooBaseUrl = odooBaseUrl.replace(/\/(odoo|web)$/, '');
  const rpcUrl = `${odooBaseUrl}/jsonrpc`;

  try {
    console.log(`Authenticating for Odoo contact form lead: ${email}...`);

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
      throw new Error(`Odoo auth failed. Status: ${authResponse.status}`);
    }

    const authResult = await authResponse.json();
    if (authResult.error) {
      throw new Error(`Odoo auth error: ${authResult.error.message}`);
    }

    const uid = authResult.result;
    if (!uid || uid === false) {
      return res.status(401).json({ error: 'Invalid Odoo credentials.' });
    }

    // 2. Search if contact already exists in res.partner
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

    const searchResult = await searchResponse.json();
    if (searchResult.error) {
      throw new Error(`Odoo search error: ${searchResult.error.message}`);
    }

    const existingPartners = searchResult.result || [];
    const commentText = `Contato via formulário do site:\n- Tipo de Negócio: ${business || 'Não informado'}\n- Mensagem: ${message || 'Sem mensagem'}`;

    if (existingPartners.length > 0) {
      const partnerId = existingPartners[0];
      console.log(`Partner already exists (ID: ${partnerId}). Updating details...`);

      // Update existing partner (write comments and phone)
      const updateData = {
        comment: commentText
      };
      if (phone) {
        updateData.phone = phone;
      }

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
              'res.partner',
              'write',
              [[partnerId], updateData]
            ]
          },
          id: Date.now() + 2
        })
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Odoo contact details updated successfully.', 
        partner_id: partnerId 
      });
    } else {
      console.log(`Creating new contact res.partner for ${name} (${email})...`);

      // Create new contact
      const partnerData = {
        name: name,
        email: email,
        comment: commentText
      };
      if (phone) {
        partnerData.phone = phone;
      }

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
              [partnerData]
            ]
          },
          id: Date.now() + 3
        })
      });

      const createResult = await createResponse.json();
      if (createResult.error) {
        throw new Error(`Odoo create error: ${createResult.error.message}`);
      }

      const newPartnerId = createResult.result;
      console.log(`Contact created successfully in Odoo res.partner with ID: ${newPartnerId}`);

      return res.status(200).json({ 
        success: true, 
        message: 'Odoo contact created successfully.', 
        partner_id: newPartnerId 
      });
    }

  } catch (error) {
    console.error('Odoo contact integration error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
