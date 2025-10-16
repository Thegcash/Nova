"use client";
import { useEffect, useState } from "react";

type Toast = { id:string; text:string; kind?:"default"|"error" };
export function toast(text:string, kind:Toast["kind"]="default"){
  window.dispatchEvent(new CustomEvent("nova_toast",{ detail:{ id:crypto.randomUUID(), text, kind } }));
}
export default function ToastHost(){
  const [toasts,setToasts]=useState<Toast[]>([]);
  useEffect(()=>{
    const on = (e:any)=>setToasts((t)=>[...t, e.detail]);
    window.addEventListener("nova_toast", on as any);
    return ()=>window.removeEventListener("nova_toast", on as any);
  },[]);
  useEffect(()=>{
    const timers = toasts.map(t=>setTimeout(()=>setToasts((x)=>x.filter(y=>y.id!==t.id)), 3200));
    return ()=>timers.forEach(clearTimeout);
  },[toasts]);
  return (
    <div className="fixed bottom-4 left-4 space-y-2 z-50">
      {toasts.map(t=>(
        <div key={t.id} className={`px-3 py-2 rounded-lg text-sm shadow ${t.kind==="error"?"bg-red-600 text-white":"bg-black/80 text-white"}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}


