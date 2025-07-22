"use client";
import { useState, useRef } from "react";
import useAutoLogout from "@/utils/useAutoLogout";
import AutoLogoutModal from "@/components/AutoLogoutModal";
import { useRouter } from "next/navigation";
import userAuth from "@/myStore/userAuth";

export default function AutoLogoutClient() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const logoutUser = userAuth((state) => state.logoutUser);

   useAutoLogout(40, () => setShowModal(true));

  const handleConfirm = () => {
    logoutUser();
    setShowModal(false);
    router.replace("/");
  };

  return (
    <>
      <AutoLogoutModal open={showModal} onConfirm={handleConfirm} />
    </>
  );
}