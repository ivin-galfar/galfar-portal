import { REACT_SERVER_URL } from "../config/ENV";
import axios from "axios";

const fetchStatments = async ({ expectedStatuses, userInfo }) => {
  try {
    const config = {
      "Content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
    const response = await axios.get(`${REACT_SERVER_URL}/receipts`, config);
    const receipts = response.data.receipts;

    let filterreceipts = receipts;
    if (userInfo?.isAdmin == false) {
      filterreceipts = receipts.filter(
        (r) =>
          r.formData?.status &&
          r.formData.status.trim() !== "" &&
          expectedStatuses.includes(r.formData.status)
      );
    }
    const categorizedReceipts =
      receipts.length > 0
        ? receipts.filter((receipt) =>
            expectedStatuses
              .map((s) => s.toLowerCase())
              .includes(receipt.formData?.status?.toLowerCase())
          )
        : receipts;

    const mrValues = receipts
      .map((receipt) => receipt.formData?.equipMrNoValue)
      .filter(Boolean);

    const filteredReceipts = receipts.filter((receipt) => {
      const rejectedApprover = receipt.formData?.approverdetails?.find(
        (rej) => rej.rejectedby && rej.rejectedby.trim() !== ""
      );

      const rejectedRole = rejectedApprover
        ? rejectedApprover.rejectedby
        : null;

      const canSeeRejected =
        receipt.formData?.status?.toLowerCase() === "rejected" &&
        rejectedRole &&
        ((rejectedRole === "GM" &&
          ["GM", "Initiator", "Manager"].includes(userInfo?.role)) ||
          (rejectedRole === "Manager" &&
            ["Manager", "Initiator"].includes(userInfo?.role)) ||
          (rejectedRole === "CEO" &&
            ["CEO", "GM", "Manager", "Initiator"].includes(userInfo?.role)));

      const isIncluded =
        (receipt.formData?.sentForApproval === "yes" &&
          expectedStatuses
            ?.map((s) => s.toLowerCase())
            .includes(receipt.formData?.status?.toLowerCase())) ||
        canSeeRejected;
      return isIncluded;
    });

    const reqMrValues = filteredReceipts
      .map((receipt) => receipt.formData?.equipMrNoValue)
      .filter(Boolean);

    return {
      reqMrValues,
      categorizedReceipts,
      mrValues,
      filterreceipts,
    };
  } catch (error) {
    throw error;
  }
};

export default fetchStatments;
