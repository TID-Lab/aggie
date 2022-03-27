import axios from "axios";
import {Credential} from "../objectTypes";
export const getCredentials = async () => {
  const { data } = await axios.get('/api/credential');
  return data;
}

export const newCredential = async (values: any) => {
  const { data } = await axios.post("/api/credential", values);
  return data;
}

export const deleteCredential = async (credential: Credential) => {
  const { data } = await axios.delete('/api/credential/' + credential._id);
  return data;
}