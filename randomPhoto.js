import axios from 'axios';

const getARandomPhoto = async () => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const apiUrl = 'https://api.unsplash.com';
  const response = await axios.get(`${apiUrl}/photos/random`, {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
    },
  });
  return response.data.urls;
};

export default getARandomPhoto;
