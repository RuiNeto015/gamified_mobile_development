const RPM_SUBDOMAIN = "ecoloop-2"
const BACKEND_IP = "192.168.1.51"

const config = {
    development: {
        RPM_SUBDOMAIN: `${RPM_SUBDOMAIN}`,
        API_ENDPOINT: `http://${BACKEND_IP}:9000`,
        RPM_APP_ENDPOINT: `https://${RPM_SUBDOMAIN}.readyplayer.me`,
        RPM_ENDPOINT: "https://api.readyplayer.me",
        RPM_MODELS_ENDPOINT: "https://models.readyplayer.me"
    },
    production: {
        RPM_SUBDOMAIN: `${RPM_SUBDOMAIN}`,
        API_ENDPOINT: `http://${BACKEND_IP}:9000`,
        RPM_APP_ENDPOINT: `https://${RPM_SUBDOMAIN}.readyplayer.me`,
        RPM_ENDPOINT: "https://api.readyplayer.me",
        RPM_MODELS_ENDPOINT: "https://models.readyplayer.me"
    }
};

const currentConfig =
    process.env.NODE_ENV === "production" ? config.production : config.development;

export default currentConfig;