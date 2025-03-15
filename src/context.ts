import { createContext } from "react";

export type PartialParams = {
    title: string;
    color?: string;
    icon?: React.ReactNode;
    body?: React.ReactNode;
    /**
     * The displayed close action button of the toast.
     */
    action?: React.ReactNode;
    /**
     * After how many miliseconds to automatically close the toast.
     * 
     * @default 4000
     */
    closeAfter?: number;
    /**
     * Optional callback, that gets called when the toast closes.
     */
    onClose?: () => void;
};

export type Params = PartialParams & {
    color: string;
    icon: React.ReactNode;
};

const SplashContext = createContext<{
    splash: (args: Params) => Promise<boolean>;
    success: (args: PartialParams) => Promise<boolean>;
    error: (args: PartialParams) => Promise<boolean>;
} | null>(null);

export default SplashContext;