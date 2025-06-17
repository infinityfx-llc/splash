import { Toast } from "@infinityfx/fluid";
import { Animatable } from "@infinityfx/lively";
import { Params } from "./context";
import { useEffect, useRef } from "react";
import { useLink } from "@infinityfx/lively/hooks";
import { combineRefs } from "@infinityfx/fluid/utils";

export default function SplashToast({ ref, body, onClose, ...props }: {
    ref?: React.RefObject<HTMLDivElement>;
    round: boolean;
    onClose: (manual: boolean) => void;
} & Omit<Params, 'onClose' | 'closeAfter'> & React.HTMLAttributes<HTMLDivElement>) {
    const toastRef = useRef<HTMLDivElement>(null);
    const touch = useRef(-1);
    const link = useLink(0);

    useEffect(() => {
        const ctrl = new AbortController();

        window.addEventListener('touchmove', e => {
            if (touch.current < 0) return;
            const dx = e.touches[0].clientX - touch.current;

            link.set(dx);
        }, { signal: ctrl.signal });

        window.addEventListener('touchend', e => {
            if (touch.current < 0 || !toastRef.current) return;

            const dx = e.changedTouches[0].clientX - touch.current,
                shouldClose = Math.abs(dx) > toastRef.current.clientWidth / 2;
            touch.current = -1;

            link.set(shouldClose ? Math.sign(dx) * Math.max(toastRef.current.clientWidth * 1.25, Math.abs(dx)) : 0, { duration: .5 });
            if (shouldClose) onClose(false);
        }, { signal: ctrl.signal });

        return () => ctrl.abort();
    }, []);

    return <Animatable
        animate={{
            translate: link(val => `${val}px 0px`)
        }}>
        <Toast
            {...props}
            onClose={() => onClose(true)}
            ref={combineRefs(ref, toastRef)}
            onTouchStart={e => touch.current = e.touches[0].clientX}>
            {body}
        </Toast>
    </Animatable>;
}