const BASE_URL = "/api";

const headers = () => ({
  "Content-Type": "application/json",
  ...(localStorage.getItem("token") && {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  })
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
};

export const api = {
  get:    (path)       => fetch(`${BASE_URL}${path}`, { headers: headers() }).then(handleResponse),
  post:   (path, body) => fetch(`${BASE_URL}${path}`, { method: "POST",   headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  patch:  (path, body) => fetch(`${BASE_URL}${path}`, { method: "PATCH",  headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  delete: (path)       => fetch(`${BASE_URL}${path}`, { method: "DELETE", headers: headers() }).then(handleResponse),
};
