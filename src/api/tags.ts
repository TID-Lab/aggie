import axios from "axios";
import {Tag, TagEditableData} from "../objectTypes";

export const getTags = async () => {
  const { data } = await axios.get('/api/tag');
  return data;
}

export const newTag = async (tag: TagEditableData) => {
  const { data } = await axios.post('/api/tag/', tag);
  return data;
}

export const editTag = async (tag: TagEditableData) => {
  const { data } = await axios.put('/api/tag/' + tag._id, tag);
  return data;
}

export const deleteTag = async (tag: Tag) => {
  const { data } = await axios.delete('/api/tag/' + tag._id);
  return data;
}