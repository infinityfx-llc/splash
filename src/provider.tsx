'use client';

import { useEffect, useRef, useState } from "react";
import SplashContext, { Params, PartialParams } from "./context";
import { Selectors } from "@infinityfx/fluid";
import { combineClasses } from '@infinityfx/fluid/utils';
import { createStyles } from "@infinityfx/fluid/css";
import { LayoutGroup } from "@infinityfx/lively/layout";
import { Animatable } from "@infinityfx/lively";
import { LuX, LuCheck } from "react-icons/lu"; // maybe use fluid internal icons?
import SplashToast from "./splash-toast";

// Trick compiler into including Toast styles
// import { Toast } from "@infinityfx/fluid";

const styles = createStyles('splash', fluid => ({
    '.wrapper': {
        position: 'fixed',
        overflow: 'hidden',
        pointerEvents: 'none',
        padding: 'var(--f-spacing-med)',
        display: 'flex',
        alignItems: 'var(--y)',
        justifyContent: 'var(--x)',
        zIndex: 9999,
        inset: 0
    },

    '.toasts': {
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 'var(--f-spacing-sml)',
        pointerEvents: 'all'
    },

    '.toasts > *': {
        boxShadow: 'var(--f-shadow-sml)'
    },

    [`@media (max-width: ${fluid.breakpoints.mob}px)`]: {
        '.wrapper': {
            justifyContent: 'stretch'
        },
        '.toasts': {
            width: '100%'
        }
    }
}));

export default function Splash({ children, cc = {}, stack = 3, position = { x: 'right', y: 'bottom' }, round = false, onOpen }: {
    cc?: Selectors<'toasts'>;
    children: React.ReactNode;
    /**
     * How many toasts to display at a time.
     * 
     * @default 3
     */
    stack?: number;
    /**
     * @default { x: 'right', y: 'bottom' }
     */
    position?: {
        x?: 'left' | 'center' | 'right';
        y?: 'top' | 'bottom';
    };
    /**
     * @default false
     */
    round?: boolean;
    onOpen?: (toast: { title: string; color: string; }) => void;
}) {
    const style = combineClasses(styles, cc);

    const timeout = useRef<number | undefined>(undefined);
    const toasts = useRef<({
        id: number;
        onClose: (manual: boolean) => void;
    } & Omit<Params, 'onClose'>)[]>([]);
    const [state, setState] = useState(toasts.current);

    function closeExpired() {
        toasts.current = toasts.current.filter(({ id, closeAfter, onClose }, i) => {
            const keep = i >= stack || !closeAfter || id + closeAfter > Date.now();
            if (!keep) onClose(false);

            return keep;
        });

        setState(toasts.current.slice());

        const toast = toasts.current.find(({ closeAfter }) => closeAfter);
        if (toast) {
            clearTimeout(timeout.current);
            timeout.current = setTimeout(closeExpired, toast.closeAfter);
        }
    }

    function splash({ closeAfter = 4000, onClose, ...props }: Params): Promise<boolean> {
        return new Promise((resolve) => {
            const id = Date.now();

            toasts.current.unshift({
                ...props,
                id,
                closeAfter,
                onClose(manual) {
                    onClose?.(manual);
                    resolve(manual);
                }
            });
            setState(toasts.current.slice());

            if (closeAfter) {
                clearTimeout(timeout.current);
                timeout.current = setTimeout(closeExpired, closeAfter);
            }

            onOpen?.({
                title: props.title,
                color: props.color
            });
        });
    }

    useEffect(() => () => clearTimeout(timeout.current), []);

    return <SplashContext value={{
        splash,
        success(args: PartialParams) {
            return splash(Object.assign({ color: 'var(--f-clr-primary-100)', icon: <LuCheck /> }, args));
        },
        error(args: PartialParams) {
            return splash(Object.assign({ color: 'var(--f-clr-error-100)', icon: <LuX /> }, args));
        }
    }}>
        <div
            className={style.wrapper}
            style={{
                '--x': {
                    left: 'flex-start',
                    center: 'center',
                    right: 'flex-end'
                }[position.x || 'right'],
                '--y': {
                    bottom: 'flex-end',
                    top: 'flex-start'
                }[position.y || 'bottom']
            } as any}>
            <div className={style.toasts}>
                <LayoutGroup transition={{ duration: .4 }}>
                    {state.slice(0, stack).map(({ id, onClose, closeAfter, ...props }, i) => <Animatable
                        id={'' + id}
                        key={'' + id}
                        adaptive
                        cachable={['x', 'y']}
                        animations={{
                            top: {
                                opacity: [0, 1],
                                translate: ['0% -100%', '0% 0%'],
                                duration: .4
                            },
                            bottom: {
                                opacity: [0, 1],
                                translate: ['0% 100%', '0% 0%'],
                                duration: .4
                            },
                            unmount: {
                                opacity: [1, 1, 0],
                                scale: [1, .9],
                                duration: .25
                            }
                        }}
                        triggers={[
                            { on: 'mount', name: i ? 'top' : 'bottom' },
                            { on: 'unmount', name: 'unmount' }
                        ]}>
                        <SplashToast
                            {...props}
                            round={round}
                            onClose={(manual: boolean) => {
                                const i = toasts.current.findIndex(toast => toast.id === id);
                                if (i < 0) return;

                                toasts.current.splice(i, 1);
                                onClose(manual);

                                setState(toasts.current.slice());
                            }} />
                    </Animatable>)}
                </LayoutGroup>
            </div>
        </div>

        {children}
    </SplashContext>;
}