// Gera uma string aleatória segura
export function randomString(length = 64) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  const values = crypto.getRandomValues(new Uint8Array(length));

  for (let i = 0; i < values.length; i++) {
    result += charset[values[i] % charset.length];
  }

  return result;
}

// Converte ArrayBuffer → Base64URL
function base64urlencode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Gera hash SHA-256
export async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64urlencode(hash);
}
