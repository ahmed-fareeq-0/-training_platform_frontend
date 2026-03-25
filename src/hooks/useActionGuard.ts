// useActionGuard — prevents double-clicks on mutation-backed buttons.
//
// Usage:
//   const { guard, isLocked } = useActionGuard();
//   <Button disabled={isLocked} onClick={guard(handleEnroll)}>Enroll</Button>
//
// How it works:
//   After the wrapped handler is called, the guard enters a locked state
//   for a short cooldown period (default 1s). Any additional clicks during
//   this period are silently dropped. The lock auto-releases once the
//   handler's promise resolves or the cooldown expires (whichever is later).

import { useState, useCallback, useRef } from 'react';

interface UseActionGuardOptions {
  /** Minimum cooldown in ms after the first click. Default: 1000 */
  cooldownMs?: number;
}

export function useActionGuard(options: UseActionGuardOptions = {}) {
  const { cooldownMs = 1000 } = options;
  const [isLocked, setIsLocked] = useState(false);
  const lockRef = useRef(false);

  const guard = useCallback(
    <T extends (...args: any[]) => any>(handler: T) => {
      return ((...args: Parameters<T>) => {
        if (lockRef.current) return;

        lockRef.current = true;
        setIsLocked(true);

        const cooldownPromise = new Promise<void>((resolve) =>
          setTimeout(resolve, cooldownMs)
        );

        const result = handler(...args);

        // If handler returns a promise, wait for both it AND cooldown
        const handlerPromise =
          result instanceof Promise ? result : Promise.resolve();

        Promise.all([handlerPromise, cooldownPromise]).finally(() => {
          lockRef.current = false;
          setIsLocked(false);
        });

        return result;
      }) as T;
    },
    [cooldownMs]
  );

  return { guard, isLocked };
}
