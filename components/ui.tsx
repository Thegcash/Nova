import React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Sporty Attio×Legora Design System - Local shadcn-style components
// Tighter geometry, faster motion, professional polish
// ============================================================================

// Card - Professional container with subtle lift
export function Card({ 
  children, 
  className = "",
  hover = false 
}: { 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-150 shadow-sm",
      hover && "hover-lift cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4 border-b border-gray-150", className)}>{children}</div>;
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold text-gray-900", className)}>{children}</h3>;
}

// Badge - Compact chips with sporty styling
export function Badge({ 
  children, 
  variant = "default" 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "success" | "warning" | "error" | "primary"
}) {
  const variants = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    primary: "bg-primary-50 text-primary-700 border-primary-200",
  };
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xxs font-medium transition-fast",
      variants[variant]
    )}>
      {children}
    </span>
  );
}

// Button - Professional with fast transitions
export function Button({ 
  children, 
  onClick, 
  variant = "default",
  size = "default",
  disabled = false,
  className = "",
  type = "button",
  title,
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: "default" | "primary" | "danger" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
}) {
  const variants = {
    default: "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300",
    primary: "bg-primary-600 border-primary-600 text-white hover:bg-primary-700 shadow-sm",
    danger: "bg-rose-600 border-rose-600 text-white hover:bg-rose-700 shadow-sm",
    ghost: "border-transparent text-gray-600 hover:bg-gray-100",
  };
  
  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    default: "px-3.5 py-1.5 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-fast",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}

// Kbd - Keyboard shortcut display
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50 text-xxs text-gray-600 font-mono shadow-sm">
      {children}
    </kbd>
  );
}

// Stat - Compact KPI card
export function Stat({ 
  label, 
  value, 
  change,
  changeLabel,
  icon,
  variant = "default" 
}: { 
  label: string; 
  value: string | number; 
  change?: string | number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "primary";
}) {
  const variants = {
    default: "bg-white border-gray-150",
    success: "bg-emerald-50/30 border-emerald-200",
    warning: "bg-amber-50/30 border-amber-200",
    error: "bg-rose-50/30 border-rose-200",
    primary: "bg-primary-50/30 border-primary-200",
  };
  
  return (
    <Card className={cn("p-4 min-w-[140px]", variants[variant])}>
      <div className="flex items-start justify-between mb-2">
        <div className="text-xxs uppercase tracking-wide text-gray-500 font-medium">{label}</div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="text-2xl font-semibold text-gray-900 mb-1">{value}</div>
      {change && (
        <div className="text-xs text-gray-600">
          {change} {changeLabel && <span className="text-gray-400">{changeLabel}</span>}
        </div>
      )}
    </Card>
  );
}

// Table components
export function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50/80 border-b border-gray-150">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-150">{children}</tbody>;
}

export function TableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("transition-fast hover:bg-gray-50/50", className)}>{children}</tr>;
}

export function TableHead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-2.5 text-left text-xxs font-semibold text-gray-600 uppercase tracking-wider", className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-gray-700", className)}>{children}</td>;
}

// TestRow - Status check component
export function TestRow({ label, pass, detail }: { label: string; pass: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-gray-150 last:border-0 py-2">
      <div className="text-gray-700">{label}</div>
      <div className="flex items-center gap-2">
        <Badge variant={pass ? "success" : "error"}>{pass ? "PASS" : "FAIL"}</Badge>
        {detail && <span className="text-xs text-gray-500">{detail}</span>}
      </div>
    </div>
  );
}

// Legacy compatibility exports (mapped to new components)
export function Chip({ children, tone = "default" }: { children: React.ReactNode; tone?: "default"|"ok"|"warn"|"bad" }) {
  const variantMap = { default: "default", ok: "success", warn: "warning", bad: "error" } as const;
  return <Badge variant={variantMap[tone]}>{children}</Badge>;
}

export function Kpi({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default"|"ok"|"warn"|"bad" }) {
  const variantMap = { default: "default", ok: "success", warn: "warning", bad: "error" } as const;
  return <Stat label={label} value={value} changeLabel={sub} variant={variantMap[tone]} />;
}

