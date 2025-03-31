'use client';

import { useEffect, useRef, useState } from "react";
import SplashContext, { Params, PartialParams } from "./context";
import { Selectors, Toast } from "@infinityfx/fluid";
import { combineClasses } from '@infinityfx/fluid/utils';
import { createStyles } from "@infinityfx/fluid/css";
import { LayoutGroup } from "@infinityfx/lively/layout";
import { Animatable } from "@infinityfx/lively";
import { LuX, LuCheck } from "react-icons/lu"; // maybe use fluid internal icons?

const styles = createStyles('splash', fluid => ({
    '.wrapper': {
        position: 'fixed',
        overflow: 'hidden',
        pointerEvents: 'none',
        padding: 'var(--f-spacing-med)',
        display: 'flex',
        alignItems: 'var(--y)',
        justifyContent: 'var(--x)',
        zIndex: 500,
        inset: 0
    },
    '.toasts': {
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 'var(--f-spacing-sml)',
        pointerEvents: 'all'
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
    const toasts = useRef<{
        id: number;
        closeAfter: number;
        resolve: (value: boolean) => void;
        remove: () => void;
        title: string;
        color: string;
        icon: React.ReactNode;
        body?: React.ReactNode;
        action?: React.ReactNode;
        onClose?: () => void;
    }[]>([]);
    const [state, setState] = useState(toasts.current);

    function splash({ closeAfter = 4000, ...props }: Params): Promise<boolean> {
        const id = Date.now();

        function remove(id?: number) {
            if (id) {
                const i = toasts.current.findIndex(toast => toast.id === id);
                if (i < 0) return;

                const [toast] = toasts.current.splice(i, 1);
                toast.onClose?.();
                toast.resolve(true);
            } else {
                toasts.current = toasts.current.filter(({ id, closeAfter, onClose, resolve }, i) => {
                    const keep = i >= stack || !closeAfter || id + closeAfter > Date.now();

                    if (!keep) {
                        onClose?.();
                        resolve(false);
                    }

                    return keep;
                });
            }

            setState(toasts.current.slice());

            const [toast] = toasts.current;
            if (toast?.closeAfter) {
                clearTimeout(timeout.current);
                timeout.current = setTimeout(remove, toast.closeAfter);
            }
        };

        if (closeAfter) {
            clearTimeout(timeout.current);
            timeout.current = setTimeout(remove, closeAfter);
        }

        return new Promise((resolve) => {
            toasts.current.unshift({
                id,
                remove: remove.bind({}, id),
                resolve,
                closeAfter,
                ...props
            });

            onOpen?.({ title: props.title, color: props.color });
            setState(toasts.current.slice());
        });
    }

    const success = (args: PartialParams) => splash(Object.assign({ color: 'var(--f-clr-primary-100)', icon: <LuCheck /> }, args));

    const error = (args: PartialParams) => splash(Object.assign({ color: 'var(--f-clr-error-100)', icon: <LuX /> }, args));

    useEffect(() => () => clearTimeout(timeout.current), []);

    return <SplashContext value={{ splash, success, error }}>
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
                    {state.slice(0, stack).map(({ id, body, remove, resolve, closeAfter, ...props }, i) => <Animatable
                        id={'' + id}
                        key={'' + id}
                        adaptive
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
                        <Toast
                            {...props}
                            round={round}
                            onClose={remove}
                            style={{
                                boxShadow: 'var(--f-shadow-sml)'
                            }}>
                            {body}
                        </Toast>
                    </Animatable>)}
                </LayoutGroup>
            </div>
        </div>

        {children}
    </SplashContext>;
}