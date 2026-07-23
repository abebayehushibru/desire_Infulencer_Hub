import client from "./apiClient";

export default async function api({
  method = "GET",
  path,
  data,
  query,
  signal,
}) {
    console.log( "path = ",path,
  data,
  query,
  signal,);
    
  const response = await client({
    method,
    url: path,
    data,
    params: query,
    signal,
  });
  

  return response.data;
}