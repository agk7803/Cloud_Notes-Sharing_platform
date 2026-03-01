import axios from "axios";

export const sendAcademicMessage = async (message) => {
  const response = await axios.post(
    "http://localhost:5050/api/academic-chat",
    { message }
  );

  return response.data;
};
