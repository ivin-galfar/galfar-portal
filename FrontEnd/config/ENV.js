export const REACT_SERVER_URL =
  import.meta.env.VITE_ENVIRONMENT === "development"
    ? import.meta.env.VITE_REACT_SERVER_URL
    : import.meta.env.VITE_REACT_PROD_SERVER_URL;
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
