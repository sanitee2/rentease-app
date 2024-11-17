import { create } from 'zustand';

interface AddRoomModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useAddRoomModal = create<AddRoomModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false })
}));

export default useAddRoomModal;
