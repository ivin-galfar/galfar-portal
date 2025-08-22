import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";

const fetchParticulars = async () => {
  try {
    const config = {
      "Content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
    const response = await axios.get(`${REACT_SERVER_URL}/particulars`, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default fetchParticulars;
