// src/utils/getTenantFromDomain.js
export const getTenantSlug = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // If there's a subdomain (and it's not 'www'), return it
  if (parts.length >= 2 && parts[0] !== 'www') {
    return parts[0]; 
  }
  return null;
};