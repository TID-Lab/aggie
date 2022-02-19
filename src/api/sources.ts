import axios from "axios";
import {Source} from "../objectTypes";

export const getSources = async () => {
  const { data } = await axios.get('/api/source');
  return data;
}

export const getSource = async (id: string | undefined) => {
  if (id) {
    const { data } = await axios.get('/api/source/' + id);
    return data;
  }
}

export const newSource = async (sourceData: any) => {
  const { data } = await axios.post('/api/source', sourceData);
  return data;
}

export const editSource = async (sourceData: any) => {
  const { data } = await axios.put('/api/source/' + sourceData._id, sourceData);
  return data;
}

export const deleteSource = async (source: Source) => {
  const { data } = await axios.delete('/api/source/' + source._id);
  return data;
}