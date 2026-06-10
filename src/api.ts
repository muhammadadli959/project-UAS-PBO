const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// ==========================================
// 1. INTERFACES (Definisi Tipe Data)
// ==========================================
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export interface ArtworkData {
  title: string;
  description?: string;
  imageUrl: string;
  price?: number;
  [key: string]: unknown; // Mentoleransi field tambahan dari form
}

export interface Artwork extends ArtworkData {
  _id: string; // atau 'id' tergantung bentukan database backend Anda
  createdAt: string;
}

// ==========================================
// 2. FUNGSI AUTENTIKASI
// ==========================================

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Login failed");
  }
  return res.json();
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Registration failed");
  }
  return res.json();
}

// ==========================================
// 3. FUNGSI UTAMA ARTWORKS (CRUD)
// ==========================================

export async function fetchArtworks(): Promise<Artwork[]> {
  const res = await fetch(`${API_BASE_URL}/api/artworks`);
  if (!res.ok) throw new Error("Failed to fetch artworks");
  return res.json();
}

export async function createArtwork(data: ArtworkData, token?: string): Promise<Artwork> {
  const res = await fetch(`${API_BASE_URL}/api/artworks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Failed to create artwork");
  }
  return res.json();
}

export async function updateArtwork(id: string, data: Partial<ArtworkData>, token?: string): Promise<Artwork> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Failed to update artwork");
  }
  return res.json();
}

export async function deleteArtwork(id: string, token?: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Failed to delete artwork");
  }
  return res.json();
}

// ==========================================
// 4. FUNGSI INTERAKSI (SAVE / UNSAVE)
// ==========================================

export async function saveArtwork(artworkId: string, token?: string) {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to save artwork");
  return res.json();
}

export async function unsaveArtwork(artworkId: string, token?: string) {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}/unsave`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to unsave artwork");
  return res.json();
}

export async function getSavedArtworks(token?: string): Promise<Artwork[]> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/user/saved`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to fetch saved artworks");
  return res.json();
}

export async function checkIfSaved(artworkId: string, token?: string): Promise<{ isSaved: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}/is-saved`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to check save status");
  return res.json();
}