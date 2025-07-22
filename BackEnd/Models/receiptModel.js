const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const formDataSchema = mongoose.Schema({
  hiringName: { type: String },
  dateValue: { type: String },
  projectValue: { type: String },
  locationValue: { type: String },
  equipMrNoValue: {
    type: String,
    required: true,
  },
  emRegNoValue: { type: String },
  requiredDateValue: { type: Date },
  requirementDurationValue: { type: String },
});

const tableRowSchema = mongoose.Schema({
  id: { type: String, required: true },
  sl: { type: String },
  particulars: { type: String },
  qty: { type: String },
  vendors: {
    type: Map,
    of: String,
  },
});

const dataSchema = mongoose.Schema(
  {
    formData: formDataSchema,
    tableData: [tableRowSchema],
  },
  {
    timestamps: true,
  }
);

const Receipts = mongoose.model("Receipts", dataSchema);

module.exports = Receipts;
