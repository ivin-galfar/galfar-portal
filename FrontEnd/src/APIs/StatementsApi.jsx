import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";

const fetchStatments = async ({ expectedStatuses, userInfo }) => {
  try {
    const config = {
      "Content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
    const response = await axios.get(`${REACT_SERVER_URL}/receipts`, config);
    const receipts = response.data.receipts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    let categorizedReceipts = receipts;
    if (userInfo?.isAdmin) {
      categorizedReceipts = receipts;
    } else {
      categorizedReceipts = receipts.filter((receipt) => {
        const status = receipt.formData?.status?.toLowerCase();
        if (status === "rejected") {
          const rejectedApprover = receipt.formData?.approverdetails?.find(
            (rej) => rej.rejectedby && rej.rejectedby.trim() !== ""
          );
          const rejectedRole = rejectedApprover
            ? rejectedApprover.rejectedby
            : null;
          //can be used for hirerachial view, not enabled all statements for all
          switch (rejectedRole) {
            case "HOD":
              return ["HOD", "GM", "CEO", "Initiator"].includes(userInfo?.role);
            case "GM":
              return ["HOD", "GM", "CEO", "Initiator"].includes(userInfo?.role);
            case "CEO":
              return ["HOD", "GM", "CEO", "Initiator"].includes(userInfo?.role);
            default:
              return false;
          }
        }

        return expectedStatuses.map((s) => s.toLowerCase()).includes(status);
      });
    }

    const mrValues = categorizedReceipts
      .map((receipt) => receipt.formData?.equipMrNoValue)
      .filter(Boolean);

    const filteredReceipts = categorizedReceipts.filter((receipt) => {
      const status = receipt.formData?.status?.toLowerCase();
      const sentForApproval =
        receipt.formData?.sentForApproval?.toLowerCase() === "yes";

      // Find the first rejected entry, if any
      const rejectedApprover = receipt.formData?.approverdetails?.find(
        (rej) => rej.rejectedby && rej.rejectedby.trim() !== ""
      );
      const rejectedRole = rejectedApprover
        ? rejectedApprover.rejectedby
        : null;

      let canSeeRejected = false;
      //can be used for hirerachial view, not enabled all statements for all

      if (status === "rejected" && rejectedRole) {
        switch (rejectedRole) {
          case "HOD":
            canSeeRejected = ["HOD", "Initiator", "GM", "CEO"].includes(
              userInfo?.role
            );
            break;
          case "GM":
            canSeeRejected = ["HOD", "Initiator", "GM", "CEO"].includes(
              userInfo?.role
            );
            break;
          case "CEO":
            canSeeRejected = ["HOD", "Initiator", "GM", "CEO"].includes(
              userInfo?.role
            );
            break;
          default:
            canSeeRejected = false;
        }
      }

      const isIncluded =
        (sentForApproval &&
          expectedStatuses.map((s) => s.toLowerCase()).includes(status)) ||
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
      filteredReceipts,
    };
  } catch (error) {
    throw error;
  }
};

export default fetchStatments;
