
// import { sha256, randomString } from "./pkce.js";

// //export const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
// export const CLIENT_ID = "f7411da27cba45009479d9d3ddfee761";


// // Detecta ambiente DEV x PRODUÇÃO
// const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";

// export const REDIRECT_URI = isLocal
//   ? "http://127.0.0.1:5173/callback"
//   : "https://Gilardo-Bento.github.io/Spotify/callback";

// // ENDPOINTS
// export const AUTH_URL = "https://accounts.spotify.com/authorize";
// export const TOKEN_URL = "https://accounts.spotify.com/api/token";

// let accessToken = null; // memória → mais seguro

// // ========================================
// //  LOGIN (PKCE + STATE + STORAGE SEGURO)
// // ========================================
// export async function login() {

//   // 1) gerar verifier
//   const codeVerifier = randomString();
//   sessionStorage.setItem("code_verifier", codeVerifier);

//   // 2) gerar challenge
//  // const codeChallenge = await sha256(new TextEncoder().encode(codeVerifier));
//     const codeChallenge = await sha256(codeVerifier);

//   // 3) gerar STATE obrigatório contra CSRF
//   const state = randomString();
//   sessionStorage.setItem("oauth_state", state);

//   const params = new URLSearchParams({
//     client_id: CLIENT_ID,
//     response_type: "code",
//     redirect_uri: REDIRECT_URI,
//     code_challenge_method: "S256",
//     code_challenge: codeChallenge,
//     state,
//     scope: "user-read-playback-state"  // Viewer
//   });

//   window.location = `${AUTH_URL}?${params.toString()}`;

// }

// // ========================================
// //  CALLBACK: TROCA DO CODE POR ACCESS_TOKEN
// // ========================================
// export async function handleCallback() {

//   const url = new URLSearchParams(window.location.search);
//   const code = url.get("code");
//   const returnedState = url.get("state");

//   const storedState = sessionStorage.getItem("oauth_state");

//   // Proteção contra CSRF
//   if (returnedState !== storedState) {
//     alert("⚠ Erro de segurança: STATE inválido.");
//     return;
//   }

//   sessionStorage.removeItem("oauth_state");

//   const codeVerifier = sessionStorage.getItem("code_verifier");

//   const body = new URLSearchParams({
//     client_id: CLIENT_ID,
//     grant_type: "authorization_code",
//     code,
//     redirect_uri: REDIRECT_URI,
//     code_verifier: codeVerifier
//   });

//   const res = await fetch(TOKEN_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body
//   });

//   const data = await res.json();

//   if (data.error) {
//     alert("Erro ao obter token: " + data.error_description);
//     return;
//   }

//   accessToken = data.access_token; // memória

//   sessionStorage.setItem("access_token", data.access_token); // opcional

//   window.location = "./dashboard.html";
//   //window.location = `${location.origin}/Spotify/dashboard.html`;

// }

// // ========================================
// //  UTIL PARA VERIFICAR LOGIN AO CARREGAR
// // ========================================
// export function checkAuthOnLoad() {
//   const token = sessionStorage.getItem("access_token");
//   if (token) accessToken = token;
// }

// // ========================================
// //  API CALL DO VIEWER (ver o que está tocando)
// // ========================================
// export async function getCurrentPlaying() {
//   const token = accessToken;

//   const res = await fetch("https://api.spotify.com/v1/me/player", {
//     headers: { Authorization: `Bearer ${token}` }
//   });

//   if (res.status === 204) {
//     return { playing: false };
//   }

//   return res.json();
// }


import { sha256, randomString } from "./pkce.js";

// CLIENT_ID deve ser injetado via GitHub Actions / VITE_SPOTIFY_CLIENT_ID
export const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

// Detecta ambiente DEV x PRODUÇÃO
const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";

export const REDIRECT_URI = isLocal
  ? "http://127.0.0.1:5173/callback"
  : "https://Gilardo-Bento.github.io/Spotify/callback";

// ENDPOINTS
export const AUTH_URL = "https://accounts.spotify.com/authorize";
export const TOKEN_URL = "https://accounts.spotify.com/api/token";

let accessToken = null; // memória → mais seguro

// ========================================
//  LOGIN (PKCE + STATE + STORAGE SEGURO)
// ========================================
export async function login() {

  // 1) gerar verifier
  const codeVerifier = randomString();
  sessionStorage.setItem("code_verifier", codeVerifier);

  // 2) gerar challenge SHA256
  const codeChallenge = await sha256(codeVerifier);

  // 3) gerar STATE aleatório e seguro
  const state = crypto.randomUUID();
  sessionStorage.setItem("oauth_state", state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    state,
    scope: "user-read-playback-state"  // Perfil A (Viewer)
  });

  // Redireciona para Spotify Authorization
  window.location = `${AUTH_URL}?${params.toString()}`;
}

// ========================================
//  CALLBACK: TROCA DO CODE POR ACCESS_TOKEN
// ========================================
export async function handleCallback() {

  const url = new URLSearchParams(window.location.search);
  const code = url.get("code");
  const returnedState = url.get("state");
  const storedState = sessionStorage.getItem("oauth_state");

  // Proteção contra CSRF
  if (!returnedState || returnedState !== storedState) {
    alert("⚠ Erro de segurança: STATE inválido.");
    console.error("STATE inválido", { returnedState, storedState });
    return;
  }

  sessionStorage.removeItem("oauth_state");

  const codeVerifier = sessionStorage.getItem("code_verifier");

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier
  });

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Erro ao obter token:", text);
      alert("Erro ao obter token. Veja console para detalhes.");
      return;
    }

    const data = await res.json();

    if (data.error) {
      alert("Erro ao obter token: " + data.error_description);
      return;
    }

    accessToken = data.access_token; // memória
    sessionStorage.setItem("access_token", data.access_token);

    // Redireciona para dashboard
    window.location = "./dashboard.html";

  } catch (err) {
    console.error("Erro na requisição de token:", err);
    alert("Erro na requisição de token. Veja console.");
  }
}

// ========================================
//  UTIL PARA VERIFICAR LOGIN AO CARREGAR
// ========================================
export function checkAuthOnLoad() {
  const token = sessionStorage.getItem("access_token");
  if (token) accessToken = token;
}

// ========================================
//  API CALL DO VIEWER (ver o que está tocando)
// ========================================
export async function getCurrentPlaying() {
  if (!accessToken) {
    alert("Usuário não autenticado!");
    return null;
  }

  try {
    const res = await fetch("https://api.spotify.com/v1/me/player", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (res.status === 204) return { is_playing: false };
    if (!res.ok) {
      console.error("Erro ao buscar música atual:", await res.text());
      return null;
    }

    return res.json();

  } catch (err) {
    console.error("Erro na API Spotify:", err);
    return null;
  }
}
