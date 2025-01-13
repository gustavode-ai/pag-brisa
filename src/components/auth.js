export const isAdmin = () => {
  const role = localStorage.getItem("userRole");
  return role === "admin";
};

export const isAuthenticated = () => {
  return localStorage.getItem("isLoggedIn") === "true";
};
// Faz o login
export const login = () => {
  localStorage.setItem("isLoggedIn", "true");
};
// Faz o logout
export const logout = () => {
  localStorage.removeItem("isLoggedIn");
};
