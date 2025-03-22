import config from "../../config";

const API_ENDPOINT = config.API_ENDPOINT;

export const fetchUserData = async (userId) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/user/${userId}`, {
      method: 'get',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};