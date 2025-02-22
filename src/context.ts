import { createContext } from "react";

export type PartialParams = {
    title: string;
    color?: string;
    icon?: React.ReactNode;
    body?: React.ReactNode;
    action?: React.ReactNode;
    closeAfter?: number;
    onClose?: () => void;
};

export type Params = PartialParams & {
    color: string;
    icon: React.ReactNode;
};

const SplashContext = createContext<{
    splash: (args: Params) => void;
    success: (args: PartialParams) => void;
    error: (args: PartialParams) => void;
} | null>(null);

export default SplashContext;