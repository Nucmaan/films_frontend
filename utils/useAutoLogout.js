"use client";
import { useEffect } from "react";
import userAuth from "@/myStore/userAuth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function useAutoLogout(timeoutMinutes = 20, onTimeout) {
  const logoutUser = userAuth((state) => state.logoutUser);
  const router = useRouter();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (onTimeout) {
          onTimeout();
        }
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ["mousemove", "mousedown", "keypress", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(timer);
    };
  }, [onTimeout, timeoutMinutes]);
}