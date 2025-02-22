'use client';

import { use } from "react";
import SplashContext from "./context";

export default function useSplash() {
    const splash = use(SplashContext);

    if (!splash) throw new Error('Unable to access Splash context');

    return splash;
}