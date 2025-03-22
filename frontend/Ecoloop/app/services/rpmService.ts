import config from "../../config";

const RPM_ENDPOINT = config.RPM_ENDPOINT;
const RPM_SUBDOMAIN = config.RPM_SUBDOMAIN;
const RPM_APP_ENDPOINT = config.RPM_APP_ENDPOINT;
const RPM_MODELS_ENDPOINT = config.RPM_MODELS_ENDPOINT;

const TEMPLATES_ENDPOINT = `${RPM_ENDPOINT}/v2/avatars/templates`;
const CREATE_USER_ENDPOINT_RPM = `${RPM_APP_ENDPOINT}/api/users`;
const SAVE_AVATAR_PERMANENTLY_ENDPOINT = `${RPM_ENDPOINT}/v2/avatars`;

/**
 * Registers an anonymous user.
 */
export async function registerUserRPM() {
    const response = await fetch(CREATE_USER_ENDPOINT_RPM, {
        method: 'POST'
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register user on RPM.');
    }

    return await response.json();
}

/**
 * Fetches avatar templates based on the provided token.
 */
export async function fetchAvatarTemplates(token: string) {
    const response = await fetch(TEMPLATES_ENDPOINT, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch avatar templates.');
    }

    return response.json();
}

/**
 * Assigns an avatar template to the user.
 */
export async function assignAvatarTemplate(token: string, avatarId: string) {
    const response = await fetch(`${TEMPLATES_ENDPOINT}/${avatarId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: {
                partner: `${RPM_SUBDOMAIN}`,
                bodyType: 'fullbody',
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign avatar template.');
    }

    return response.json();
}

/**
 * Saves draft Avatar permanently.
 */
export async function saveAvatarPermanently(token: string, avatarId: string) {
    const response = await fetch(`${SAVE_AVATAR_PERMANENTLY_ENDPOINT}/${avatarId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save avatar permanently.');
    }

    return response.json();
}

/**
 * Fetches avatar full body PNG image.
 */
export function fetchAvatarFullBodyImage(avatarId: string) {
    return `${RPM_MODELS_ENDPOINT}/${avatarId}.png?camera=fullbody&expression=happy&pose=thumbs-up`;
}

export function fetchAvatarHalfBodyImage(avatarId: string) {
    return `${RPM_MODELS_ENDPOINT}/${avatarId}.png?camera=portrait&expression=lol&pose=thumbs-up`
}

export async function forceGetAvatarFullBodyImage(avatarId: string) {
    const response = await fetch(`${RPM_MODELS_ENDPOINT}/${avatarId}.png?camera=fullbody&expression=happy&pose=thumbs-up`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Failed to get avatar.');
    }

    return response;
}

/**
 * Equips N assets targeting an avatar
 */
export async function equipAsset(avatarId: string, assets: string[], token: string) {
    try {
        console.log(assets)
        console.log(token)
        console.log(avatarId)
        const requests = assets.map(asset =>
            fetch(`${RPM_ENDPOINT}/v1/avatars/${avatarId}/equip`, {
                method: 'PUT',
                body: JSON.stringify({
                    "data": {
                        "assetId": asset,
                    }
                }),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })
        );

        const responses = await Promise.all(requests);

        console.log(responses)
        const failedResponses = responses.filter(response => !response.ok);
        if (failedResponses.length > 0) {
            throw new Error(`${failedResponses.length} asset equip requests failed`);
        }
        return responses;
    } catch (error) {
        console.error('Error equipping assets:', error);
        throw error;
    }
}

/**
 * Creates a lookalike avatar.
 */
export async function createLookalikeAvatar(userId: string, token: string, base64image: string) {
    const response = await fetch(SAVE_AVATAR_PERMANENTLY_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
            "data": {
                "userId": userId,
                "partner": RPM_SUBDOMAIN,
                "bodyType": "fullbody",
                "assets": {},
                "base64Image": base64image
            }
        }),
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create lookalike avatar on RPM.');
    }

    return await response.json();
}