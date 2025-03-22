import config from "../../config";
import {fetchAvatarFullBodyImage, fetchAvatarHalfBodyImage} from "./rpmService";
import {getFieldFromLocalDatabase, setFieldToLocalDatabase} from "../database/database"

const API_ENDPOINT = config.API_ENDPOINT;

const CREATE_USER_ENDPOINT_API = `${API_ENDPOINT}/user/create`;
const LOGIN_USER_ENDPOINT_API = `${API_ENDPOINT}/user/login`;
const ADD_AVATAR_INFO_ENDPOINT = `${API_ENDPOINT}/user/addAvatarInfo`;

/**
 * Registers a user in the API.
 */
export async function registerUserAPI(username: string, email: string, password: string) {
  try {
    console.log(JSON.stringify({username, email, password}))
    const response = await fetch(CREATE_USER_ENDPOINT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, email, password}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register user on API.');
    }

    return await response.json();
  } catch (error) {
    // Network errors, parsing errors, or thrown errors will be caught here
    console.error('Registration API error:', error);

    if (error instanceof TypeError) {
      // Network errors or fetch failures
      throw new Error('Network error. Please check your connection.');
    }

    // Re-throw the original error if it's not a network error
    throw error;
  }
}

/**
 * Logs in a user in the API.
 */
export async function logInUser(email: string, password: string) {
  try {
    console.log(JSON.stringify({email, password}))
    const response = await fetch(LOGIN_USER_ENDPOINT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, password}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Algum erro ocorreu! Tente novamente.');
    }

    const loginData = await response.json()
    console.log("User login: ", loginData)

    return loginData;
  } catch (error) {
    if (error instanceof TypeError) {
      // Network errors or fetch failures
      throw new Error('Network error. Please check your connection.');
    }

    // Re-throw the original error if it's not a network error
    throw error;
  }
}

/**
 * Updates the avatar information for the user in the database.
 */
export async function updateAvatarInfo(userId: string, token: string, avatarId: string) {
  const response = await fetch(
    `${ADD_AVATAR_INFO_ENDPOINT}?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}&avatarId=${encodeURIComponent(avatarId)}`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update avatar info.');
  }

  return response.json();
}

/**
 * Updates the using avatars
 */
export async function updateUsingItems(userId: string, ids: [string]) {
  console.log('ids', JSON.stringify({
    'ids': ids
  }))
  const response = await fetch(
    `${API_ENDPOINT}/user/${userId}/update-items`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'ids': ids
      })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to update using items info.');
  }

  return response;
}

// Step 2: If Base64 is not in the database, fetch and convert the image
const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to convert Blob to Base64"));
    reader.readAsDataURL(blob); // Convert Blob to Base64
  });
};

/**
 * Fetches the avatar image information (URL and Base64).
 * If Base64 is not in the database, fetches it from the server, saves it, and returns the data.
 * @returns {Promise<{ url: string, base64: string }>} Object containing the image URL and its Base64 string.
 */
export async function getImageUrlAndBase64(type: string, force: false): Promise<{ url: string; base64: string }> {
  try {
    // Get the avatar ID and check the database for Base64
    const avatarId = await getFieldFromLocalDatabase("avatar_id");

    let baseImageUrl;
    let avatarBase64;
    if (type == "full_body") {
      baseImageUrl = fetchAvatarFullBodyImage(avatarId);
      avatarBase64 = await getFieldFromLocalDatabase("avatar_base_64_full");
    } else {
      baseImageUrl = fetchAvatarHalfBodyImage(avatarId);
      avatarBase64 = await getFieldFromLocalDatabase("avatar_base_64_half");
    }

    if (avatarBase64 && !force) {
      const url = `${baseImageUrl}?t=${new Date().getTime()}`;
      return {url, base64: avatarBase64};
    }

    const base64Data = await fetchImageAsBase64(baseImageUrl);
    const base64Content = base64Data.split(",")[1]; // Extract the Base64 content (without the prefix)

    // Step 3: Save the Base64 to the database for future use
    if (type == "full_body") {
      await setFieldToLocalDatabase("avatar_base_64_full", base64Content);
    } else {
      await setFieldToLocalDatabase("avatar_base_64_half", base64Content);
    }

    // Return the image URL and Base64 string
    const url = `${baseImageUrl}?t=${new Date().getTime()}`;
    return {url, base64: base64Content};
  } catch (error) {
    console.error("Error in getImageUrlAndBase64:", error.message);
    throw error;
  }
}

export async function sendItem(sendingUserId: string, receivingUsername: string, itemId: string) {
  const response = await fetch(`${API_ENDPOINT}/user/sendItem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sendingUserId, receivingUsername, itemId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send item.');
  }

  return response;
}

/**
 * Fetches the gift data for a given user.
 */
export async function fetchGift(userId: string) {
  try {
    const response = await fetch(
        `${API_ENDPOINT}/avatar/getGift?userId=${encodeURIComponent(userId)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch gift data.');
    }

    // Return the response data
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch gift data:", error);
    throw new Error(error.message || "An error occurred while fetching gift data.");
  }
}
