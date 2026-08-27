const Customer = require("../models/Customer");
const Project = require("../models/Project");
const Payment = require("../models/Payment");

// GET /api/customers?search=
async function getCustomers(req, res) {
  try {
    const { search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customers", error: error.message });
  }
}

// GET /api/customers/:id - full detail page data: the customer record, all
// their projects, and all their payments/installments in one call, so the
// customer detail page in the UI only needs a single request.
async function getCustomerById(req, res) {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const [projects, payments] = await Promise.all([
      Project.find({ customer: customer._id }).sort({ createdAt: -1 }),
      Payment.find({ customer: customer._id }).sort({ createdAt: -1 }),
    ]);

    res.json({ customer, projects, payments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customer", error: error.message });
  }
}

// POST /api/customers
async function createCustomer(req, res) {
  try {
    const customer = await Customer.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: "Failed to create customer", error: error.message });
  }
}

// PUT /api/customers/:id
async function updateCustomer(req, res) {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: "Failed to update customer", error: error.message });
  }
}

// DELETE /api/customers/:id - also cleans up the projects/payments that
// belonged only to this customer, so deleting a customer doesn't leave orphaned records.
async function deleteCustomer(req, res) {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    await Promise.all([
      Project.deleteMany({ customer: customer._id }),
      Payment.deleteMany({ customer: customer._id }),
    ]);

    res.json({ message: "Customer and related projects/payments deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete customer", error: error.message });
  }
}

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
