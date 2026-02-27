import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
    message?: string;
    fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    message = "Loading data...",
    fullScreen = true
}) => {
    return (
        <div className={`
            ${fullScreen ? "fixed inset-0" : "absolute inset-0"} 
            flex flex-col items-center justify-center 
            bg-background/60 backdrop-blur-md 
            z-50 transition-all duration-300 animate-in fade-in
        `}>
            <div className="relative flex items-center justify-center">
                {/* Outer Glow Effect */}
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />

                <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
            </div>

            <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse tracking-wide uppercase">
                {message}
            </p>
        </div>
    );
};
