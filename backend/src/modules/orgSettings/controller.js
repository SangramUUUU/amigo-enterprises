const orgService = require('./service');
const { writeAuditLog } = require('../../middleware/auditLog');

async function get(req, res, next) {
  try {
    const settings = await orgService.getOrgSettings();
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const settings = await orgService.updateOrgSettings(req.body);
    await writeAuditLog(req.user.id, 'update', 'org_settings', settings.id, req.body);
    res.json({ settings });
  } catch (err) {
    next(err);
  }
}

module.exports = { get, update };
