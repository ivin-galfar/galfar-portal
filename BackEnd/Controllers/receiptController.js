const Receipt = require("../Models/receiptModel"); // your receipt schema/model

const feedReceipt = async (req, res) => {
  try {
    const { formData, tableData } = req.body;

    // 🔍 Validate formData for any empty, null, or undefined values
    for (const [key, value] of Object.entries(formData)) {
      if (
        value === "" ||
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return res.status(400).json({
          message: `Validation Error: "${key}" cannot be empty.`,
        });
      }
    }

    const mrexists = await Receipt.findOne({
      "formData.equipMrNoValue": formData.equipMrNoValue,
    });

    if (mrexists) {
      return res
        .status(400)
        .json({ message: "Receipt with this equipment number already exists" });
    }
    const transformedTableData = tableData?.map(
      ({ id, sl, particulars, qty, ...rest }) => {
        const vendors = {};
        Object.entries(rest).forEach(([key, value]) => {
          if (key.startsWith("vendor_")) {
            vendors[key] = value ?? "";
          }
        });

        return {
          id,
          sl,
          particulars,
          qty,
          vendors,
        };
      }
    );

    const newReceipt = await Receipt.create({
      formData,
      tableData: transformedTableData,
    });

    return res
      .status(201)
      .json({ message: "Receipt saved successfully", receipt: newReceipt });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const fetchReceipts = async (req, res) => {
  const query = Receipt.find({});
  const Receipts = await query.exec();
  const totalReceipts = await Receipt.countDocuments({});

  res.json(Receipts, fetchReceipts);
};
module.exports = { feedReceipt, fetchReceipts };
