import axios from "axios";

export const getVizTags = async () => {
  const { data } = await axios.get('/api/visualization/tags');
  return data;
}

export const getVizAuthors = async () => {
  const { data } = await axios.get('/api/visualization/authors');
  return data;
}

export const getVizMedia = async () => {
  const { data } = await axios.get('/api/visualization/media');
  return data;
}

export const getVizWords = async () => {
  const { data } = await axios.get('/api/visualization/words');
  return data;
}

export const getVizTime = async () => {
  const { data } = await axios.get('/api/visualization/time');
  return data;
}