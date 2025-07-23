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

    const newReceipt = await Receipt.create({ formData, tableData });

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

module.exports = { feedReceipt };
