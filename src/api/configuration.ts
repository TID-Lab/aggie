import axios from "axios";

export const getFetchStatus = async () => {
  const { data } = await axios.get('/api/setting/fetching');
  return data;
}

export const getEmailSettings = async () => {
  const { data } = await axios.get('/api/setting/email');
  return data;
}

export const putFetchingStatus = async (fetching: boolean) => {
  if (fetching) {
    const { data } = await axios.put('/api/setting/fetching/on');
    return data;
  } else {
    const { data } = await axios.put('/api/setting/fetching/off');
    return data;
  }
}

export const getCsv = async (before: string, after: string) => {
  // Bit hacky instead of using the field names to generate the search query.
  const { data } = await axios.get('/api/csv/?before=' + before + '&after=' + after);
  return data;
}