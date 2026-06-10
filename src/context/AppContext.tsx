import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  getRatings,
  saveRatings,
  getComments,
  saveComments,
  getReports,
  saveReports,
  getCategories,
  saveCategories,
  getSavedArtworks,
  saveSavedArtworks,
  getArtworkRatings,
  getArtworkComments,
} from "../storage";
import * as api from "../api";
import type { Artwork, Comment, Report, Rating } from "../types";

interface AppContextValue {
  artworks: Artwork[];
  refreshArtworks: () => Promise<void>;
  addArtwork: (a: Artwork, token?: string) => Promise<void>;
  updateArtwork: (a: Artwork, token?: string) => Promise<void>;
  deleteArtwork: (id: string, token?: string) => Promise<void>;

  getRatingInfo: (artworkId: string) => { avg: number; count: number };
  getUserRating: (artworkId: string, username: string) => number | null;
  submitRating: (artworkId: string, username: string, value: number) => void;

  getComments: (artworkId: string) => Comment[];
  addComment: (c: Comment) => void;
  deleteComment: (id: string) => void;

  reports: Report[];
  addReport: (r: Report) => void;
  dismissReport: (id: string) => void;
  deleteReportAndArtwork: (reportId: string, artworkId: string) => void;

  categories: string[];
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;

  savedArtworks: string[];
  toggleSaveArtwork: (artworkId: string) => void;
  isArtworkSaved: (artworkId: string) => boolean;
  getSavedArtworksList: () => Artwork[];

  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [artworks, setArtworksState] = useState<Artwork[]>([]);
  const [categories, setCategoriesState] = useState<string[]>(() =>
    getCategories(),
  );
  const [reports, setReportsState] = useState<Report[]>(() => getReports());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshArtworks = useCallback(async () => {
    try {
      const data = await api.fetchArtworks();
      setArtworksState(data);
    } catch (e) {
      showToast("Gagal memuat artworks dari server");
    }
  }, [showToast]);

  const addArtwork = useCallback(
    async (a: Artwork, token?: string) => {
      try {
        const created = await api.createArtwork(a, token);
        setArtworksState((prev) => [
          ...prev,
          {
            ...a,
            ...created,
            id: String(created.id ?? a.id),
          },
        ]);
        showToast("Artwork berhasil ditambah");
        return created;
      } catch (e) {
        showToast("Gagal menambah artwork");
        throw e;
      }
    },
    [showToast],
  );

  const updateArtwork = useCallback(
    async (a: Artwork, token?: string) => {
      try {
        const updated = await api.updateArtwork(a.id, a, token);
        setArtworksState((prev) =>
          prev.map((x) =>
            x.id === a.id
              ? { ...x, ...updated, id: String(updated.id ?? x.id) }
              : x,
          ),
        );
        showToast("Artwork berhasil diupdate");
      } catch (e) {
        showToast("Gagal update artwork");
      }
    },
    [showToast],
  );

  const deleteArtwork = useCallback(
    async (id: string, token?: string) => {
      try {
        await api.deleteArtwork(id, token);
        setArtworksState((prev) => prev.filter((x) => x.id !== id));
        showToast("Artwork berhasil dihapus");
      } catch (e) {
        showToast("Gagal menghapus artwork");
      }
    },
    [showToast],
  );

  const getRatingInfo = useCallback(
    (artworkId: string) => getArtworkRatings(artworkId),
    [],
  );

  const getUserRating = useCallback(
    (artworkId: string, username: string): number | null => {
      const r = getRatings().find(
        (r) => r.artworkId === artworkId && r.username === username,
      );
      return r ? r.value : null;
    },
    [],
  );

  const submitRating = useCallback(
    (artworkId: string, username: string, value: number) => {
      const ratings = getRatings().filter(
        (r) => !(r.artworkId === artworkId && r.username === username),
      );
      const newRating: Rating = { artworkId, username, value };
      saveRatings([...ratings, newRating]);
    },
    [],
  );

  const getCommentsForArtwork = useCallback(
    (artworkId: string) => getArtworkComments(artworkId),
    [],
  );

  const addComment = useCallback((c: Comment) => {
    saveComments([...getComments(), c]);
  }, []);

  const deleteComment = useCallback((id: string) => {
    saveComments(getComments().filter((c) => c.id !== id));
  }, []);

  const addReport = useCallback((r: Report) => {
    const updated = [...getReports(), r];
    saveReports(updated);
    setReportsState(updated);
  }, []);

  const dismissReport = useCallback((id: string) => {
    const updated = getReports().filter((r) => r.id !== id);
    saveReports(updated);
    setReportsState(updated);
  }, []);

  const deleteReportAndArtwork = useCallback(
    (reportId: string, artworkId: string) => {
      const updatedReports = getReports().filter(
        (r) => r.id !== reportId && r.artworkId !== artworkId,
      );
      saveReports(updatedReports);
      setReportsState(updatedReports);
      setArtworksState((prev) => prev.filter((a) => a.id !== artworkId));
    },
    [],
  );

  const addCategory = useCallback((name: string) => {
    const updated = [...getCategories(), name];
    saveCategories(updated);
    setCategoriesState(updated);
  }, []);

  const deleteCategory = useCallback((name: string) => {
    const updated = getCategories().filter((c) => c !== name);
    saveCategories(updated);
    setCategoriesState(updated);
  }, []);

  const [savedArtworks, setSavedArtworksState] = useState<string[]>(() =>
    getSavedArtworks(),
  );

  const toggleSaveArtwork = useCallback((artworkId: string) => {
    setSavedArtworksState((prevSaved) => {
      const artworkIdStr = String(artworkId);
      const updated = prevSaved.includes(artworkIdStr)
        ? prevSaved.filter((id) => id !== artworkIdStr)
        : [...prevSaved, artworkIdStr];
      saveSavedArtworks(updated);
      return updated;
    });
  }, []);

  const isArtworkSaved = useCallback(
    (artworkId: string) => savedArtworks.includes(artworkId),
    [savedArtworks],
  );

  const getSavedArtworksList = useCallback(
    () => artworks.filter((a) => savedArtworks.includes(String(a.id))),
    [artworks, savedArtworks],
  );

  return (
    <AppContext.Provider
      value={{
        artworks,
        refreshArtworks,
        addArtwork,
        updateArtwork,
        deleteArtwork,
        getRatingInfo,
        getUserRating,
        submitRating,
        getComments: getCommentsForArtwork,
        addComment,
        deleteComment,
        reports,
        addReport,
        dismissReport,
        deleteReportAndArtwork,
        categories,
        addCategory,
        deleteCategory,
        savedArtworks,
        toggleSaveArtwork,
        isArtworkSaved,
        getSavedArtworksList,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
