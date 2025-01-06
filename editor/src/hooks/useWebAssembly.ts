import { useState, useEffect } from 'react';

export type GenericModule<T> = {
  module: T | null;
  error: unknown | null;
};

export type ModuleLoader<T> = ({
  canvas,
}: {
  canvas: HTMLCanvasElement | null;
}) => Promise<T>;

export default function useWebAssembly<T>(
  moduleLoader: ModuleLoader<T>,
): GenericModule<T> {
  const [error, setError] = useState<unknown | null>(null);
  const [module, setModule] = useState<T | null>(null);

  useEffect(() => {
    if (module) return; // don't load if already loaded

    moduleLoader({
      canvas: document.querySelector('#canvas'),
    })
      .then((module: T) => {
        setModule(module);
      })
      .catch((error: unknown) => {
        setError(error);
      });
  }, []);

  return { module, error };
}
