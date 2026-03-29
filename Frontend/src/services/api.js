const BASE_URL = "/api";

const getToken = () => localStorage.getItem("token");

const headers = (extra = {}) => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra
});

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
};

export const api = {
  post: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  get: (path) =>
    fetch(`${BASE_URL}${path}`, { headers: headers() }).then(handleResponse),

  patch: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  delete: (path) =>
    fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: headers()
    }).then(handleResponse)
};
