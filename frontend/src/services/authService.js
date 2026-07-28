let setTokenHandler = null;

export const registerTokenSetter = (setter) => {
  setTokenHandler = setter;
};

export const updateToken = (token) => {
  if (setTokenHandler) {
    setTokenHandler(token);
  }
};