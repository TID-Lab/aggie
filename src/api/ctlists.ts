import axios from "axios";

export const getCTLists = async () => {
  const { data } = await axios.get('/api/ctlists');
  return data;
}