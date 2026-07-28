const env = {
  API_URL: import.meta.env.VITE_API_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME,
  APP_ENV: import.meta.env.VITE_APP_ENV,
};

console.log(env);


export default env;