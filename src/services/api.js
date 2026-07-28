import client from "./apiClient";

export default async function api({
  method = "GET",
  path,
  data,
  query,
  signal,
  isMultiPart
}) {

     const config ={
      
method,
    url: path,
    data,
    params: query,
    signal,
     }
     if (isMultiPart) {
      config.headers=  {
      "Content-Type": "multipart/form-data",
    }
     }
  const response = await client(config);
  

  return response.data;
}