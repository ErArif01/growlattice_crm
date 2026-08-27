const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

// GET /api/leads?search=&source=&status=
async function getLeads(req, res) {
  try {
    const { search, source, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (source) query.source = source;
    if (status) query.status = status;

    const leads = await Lead.find(query).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads", error: error.message });
  }
}

// GET /api/leads/:id
async function getLeadById(req, res) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lead", error: error.message });
  }
}

// POST /api/leads
async function createLead(req, res) {
  try {
    const lead = await Lead.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: "Failed to create lead", error: error.message });
  }
}

// PUT /api/leads/:id
async function updateLead(req, res) {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: "Failed to update lead", error: error.message });
  }
}

// DELETE /api/leads/:id
async function deleteLead(req, res) {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Lead deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lead", error: error.message });
  }
}

// POST /api/leads/:id/convert - turns a Lead into a real Customer record in
// one step, carries over name/phone/email/source, and links both records
// together so you can always trace a customer back to their original lead.
async function convertLead(req, res) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    if (lead.convertedToCustomer) {
      return res.status(400).json({ message: "This lead has already been converted" });
    }

    const customer = await Customer.create({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      leadRef: lead._id,
      notes: lead.notes,
      createdBy: req.user._id,
    });

    lead.status = "Converted";
    lead.convertedToCustomer = customer._id;
    await lead.save();

    res.status(201).json({ lead, customer });
  } catch (error) {
    res.status(400).json({ message: "Failed to convert lead", error: error.message });
  }
}

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead, convertLead };
