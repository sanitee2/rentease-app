import axios from "axios";
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation";
import { useMemo, useCallback } from "react";
import { SafeUser } from "../types";
import useLoginModal from "./useLoginModal";

interface IUseFavorite {
  listingId: string;
  currentUser?: SafeUser | null
}

const useFavorite = ({
  listingId,
  currentUser
}: IUseFavorite) => {
  const router = useRouter();
  const loginModal = useLoginModal();
  
  const hasFavorited = useMemo(() => {
    const list = currentUser?.favoriteIds || [];
    return list.includes(listingId);
  }, [currentUser, listingId]);

  const toggleFavorite = useCallback(async () => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    try {
      if (hasFavorited) {
        await axios.delete(`/api/favorites/${listingId}`);
      } else {
        await axios.post(`/api/favorites/${listingId}`);
      }
      
      router.refresh();
    } catch (error) {
      throw new Error('Failed to toggle favorite');
    }
  }, [currentUser, hasFavorited, listingId, loginModal, router]);

  return {
    hasFavorited,
    toggleFavorite
  }
}

export default useFavorite;