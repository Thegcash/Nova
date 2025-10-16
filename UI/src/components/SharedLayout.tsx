"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced UI primitives
const Button = ({ className = "", children, variant = "solid", onClick, ...props }) => {
  const base =
    variant === "ghost"
      ? "bg-transparent hover:bg-foreground/5"
      : variant === "outline"
      ? "border bg-transparent hover:bg-foreground/5"
      : variant === "secondary"
      ? "bg-foreground/5 hover:bg-foreground/10"
      : "bg-primary/90 text-primary-foreground hover:bg-primary";
  return (
    <button className={`h-9 px-3 rounded-xl text-sm flex items-center ${base} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

const Separator = () => <div className="h-px w-full bg-foreground/10" />;

const ScrollArea = ({ className = "", children }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
);

// Navigation items
const nav = [
  { label: "Risk Scoring", icon: "🧭", path: "/risk-dashboard" },
  { label: "Guardrail Engine", icon: "🛡️", path: "/guardrail-engine" },
  { label: "Compliance Engine", icon: "⚖️", path: "/compliance-engine" },
  { label: "ROI Dashboard", icon: "📈", path: "/roi-dashboard" },
  { label: "Data Sources", icon: "🧱", path: "/data-sources" },
  { label: "Policies", icon: "🔧", path: "/policies" },
  { label: "Investigations", icon: "🔎", path: "/investigations" },
  { label: "Settings", icon: "⚙️", path: "/settings" },
];

export default function SharedLayout({ 
  children, 
  activePage, 
  showAssistant = true, 
  setShowAssistant,
  assistantContent 
}) {
  const router = useRouter();

  const handleNavClick = (item) => {
    if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <div className="h-dvh w-screen overflow-hidden bg-gradient-to-b from-background to-muted/20 text-foreground flex">
      {/* Left Rail */}
      <aside className="w-64 shrink-0 border-r bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col min-w-0">
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center">✨</div>
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground truncate">Nova</div>
            <div className="font-semibold leading-tight truncate">Risk Platform</div>
          </div>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <nav className="px-2 py-2 space-y-1">
            {nav.map((item) => {
              const isActive = activePage === item.label;
              return (
                <Button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 text-sm"
                >
                  <span className="w-4 text-center">{item.icon}</span> {item.label}
                </Button>
              );
            })}
          </nav>
          <div className="px-3 py-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Spaces</div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-between">
                Default Workspace <span>›</span>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Underwriting <span>›</span>
              </Button>
            </div>
          </div>
        </ScrollArea>
        <div className="p-3 border-t">
          <Button 
            className="w-full justify-center gap-2" 
            variant="outline" 
            onClick={() => setShowAssistant(!showAssistant)}
          >
            💬 Nova Assistant
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {children}
      </div>

      {/* Right Dock: Assistant - Animated Collapse/Expand */}
      <AnimatePresence>
        {showAssistant && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="shrink-0 border-l bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-col overflow-hidden"
            style={{ display: 'flex' }}
          >
            <div className="h-16 border-b px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>💬</div>
                <div className="font-semibold">Nova Assistant</div>
              </div>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={() => setShowAssistant(false)}
              >
                ×
              </Button>
            </div>
            {assistantContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


