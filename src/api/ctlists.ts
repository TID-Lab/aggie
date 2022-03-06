import axios from "axios";

export const getCTLists = async () => {
  const { data } = await axios.get('/api/ctlist');
  return data;
}