const pool = require('../../db/pool');

async function getOrgSettings() {
  const { rows } = await pool.query('SELECT * FROM org_settings ORDER BY created_at LIMIT 1');
  if (rows.length === 0) {
    const { rows: created } = await pool.query(
      `INSERT INTO org_settings (company_name) VALUES ('') RETURNING *`
    );
    return created[0];
  }
  return rows[0];
}

async function updateOrgSettings(data) {
  const current = await getOrgSettings();
  const fields = [];
  const values = [];
  let idx = 1;

  const allowed = [
    'company_name', 'address_line', 'state', 'state_code', 'gstin',
    'email', 'phone', 'logo_url', 'signature_url', 'bank_details', 'invoice_number_prefix',
    'invoice_terms', 'default_low_stock_threshold',
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }

  if (data.amc_reminder_days !== undefined) {
    fields.push(`amc_reminder_days = $${idx++}`);
    values.push(JSON.stringify(data.amc_reminder_days));
  }

  if (data.invoice_number_seq !== undefined) {
    fields.push(`invoice_number_seq = $${idx++}`);
    values.push(data.invoice_number_seq);
  }

  if (fields.length === 0) return current;

  fields.push('updated_at = NOW()');
  values.push(current.id);

  const { rows } = await pool.query(
    `UPDATE org_settings SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0];
}

async function getNextInvoiceNumber(client) {
  const db = client || pool;
  const { rows } = await db.query(
    `UPDATE org_settings SET invoice_number_seq = invoice_number_seq + 1, updated_at = NOW()
     RETURNING invoice_number_prefix, invoice_number_seq - 1 AS seq`
  );
  const { invoice_number_prefix, seq } = rows[0];
  return `${invoice_number_prefix}${String(seq).padStart(4, '0')}`;
}

module.exports = { getOrgSettings, updateOrgSettings, getNextInvoiceNumber };
