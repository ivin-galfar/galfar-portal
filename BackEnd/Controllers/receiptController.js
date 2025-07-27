const Receipt = require("../Models/receiptModel"); // your receipt schema/model

const feedReceipt = async (req, res) => {
  try {
    const { formData, tableData } = req.body;

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
      ({ id, sl, particulars, qty, vendors }) => {
        const cleanVendors = {};
        if (vendors) {
          Object.entries(vendors).forEach(([key, value]) => {
            cleanVendors[key] = value ?? "";
          });
        }
        return { id, sl, particulars, qty, vendors: cleanVendors };
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

  res.json({ receipts: Receipts, total: totalReceipts });
};

const fetchReceipt = async (req, res) => {
  try {
    const { mrno } = req.params;
    const receipt = await Receipt.findOne({ "formData.equipMrNoValue": mrno });

    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    res.json(receipt);
  } catch (error) {
    console.error("Error fetching receipt:", error);
    res.status(500).json({ error: error.message });
  }
};

const updatestatus = async (req, res) => {
  try {
    const { mrno } = req.params;
    const receipt = await Receipt.findOneAndUpdate(
      { "formData.equipMrNoValue": mrno },
      { $set: { "formData.sentForApproval": "yes" } },
      { new: true }
    );
    console.log(receipt);

    res.json(receipt);
  } catch (error) {}
};

module.exports = { feedReceipt, fetchReceipts, fetchReceipt, updatestatus };
