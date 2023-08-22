"use client";

import { Chat } from "@/components/chat/Chat";
import { useEffect, useState } from "react";

export default function Home() {
  // Too lazy to figure this out right now but there's a big flicker of the send
  // icon without it.
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);
  return <main className="h-screen">{show ? <Chat /> : null}</main>;
}
