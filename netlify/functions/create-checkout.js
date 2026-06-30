exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let amount, description, email;
  try {
    ({ amount, description, email } = JSON.parse(event.body));
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  // Validate amount
  const amountInCentavos = Math.round(Number(amount) * 100);
  if (!amountInCentavos || amountInCentavos < 2000) { // PayMongo minimum is ₱20.00
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Amount must be at least ₱20.00' })
    };
  }

  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing PayMongo secret key' }) };
  }

  const authHeader = `Basic ${Buffer.from(secretKey + ':').toString('base64')}`;

  let response;
  try {
    response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        data: {
          attributes: {
            billing: {
              email: email || 'customer@riparadise.com',
              name: 'RIPARADISE Customer'
            },
            line_items: [
              {
                currency: 'PHP',
                amount: amountInCentavos,
                name: description || 'RIPARADISE Order',
                description: description || 'RIPARADISE Order', // ← required by some PayMongo versions
                quantity: 1
              }
            ],
            // ✅ FIX: 'paymaya' is now 'paymaya' — but if your account doesn't have Maya enabled,
            // remove it. Start with just gcash to test.
            payment_method_types: ['gcash', 'paymaya', 'card'],
            send_email_receipt: false,   // ← set true if you want PayMongo to email receipt
            show_description: true,
            show_line_items: true,
            success_url: 'https://riparadise.netlify.app/success.html',
            cancel_url: 'https://riparadise.netlify.app/checkout.html',
            description: description || 'RIPARADISE Order'
          }
        }
      })
    });
  } catch (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not reach PayMongo API' }) };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'Invalid response from PayMongo' }) };
  }

  if (!response.ok) {
    console.error('PayMongo error:', JSON.stringify(data.errors));
    return {
      statusCode: 400,
      body: JSON.stringify({ error: data.errors })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      checkout_url: data.data.attributes.checkout_url
    })
  };
};