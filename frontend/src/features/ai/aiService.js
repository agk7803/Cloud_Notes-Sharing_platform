import api from "../../services/api";
 
 export const sendAcademicMessage = async (message) => {
   const response = await api.post(
     "/academic-chat",
     { message }
   );
 
   return response.data;
 };
