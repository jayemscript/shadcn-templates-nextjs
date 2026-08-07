type CachedFile = {
  file: File;
  url: string;
};

const files = new Map<string, CachedFile>();
const pendingLoads = new Map<string, Promise<File>>();

export function getCachedFile(key: string): CachedFile | undefined {
  return files.get(key);
}

export function cacheFile(key: string, file: File): CachedFile {
  const previous = files.get(key);
  if (previous && previous.file !== file) {
    URL.revokeObjectURL(previous.url);
  }

  const cached = {
    file,
    url: previous?.file === file ? previous.url : URL.createObjectURL(file),
  };
  files.set(key, cached);
  return cached;
}

export function loadCachedFile(
  key: string,
  loader: () => Promise<File>,
): Promise<File> {
  const cached = files.get(key);
  if (cached) return Promise.resolve(cached.file);

  const pending = pendingLoads.get(key);
  if (pending) return pending;

  const nextLoad = loader().finally(() => {
    pendingLoads.delete(key);
  });
  pendingLoads.set(key, nextLoad);
  return nextLoad;
}

export function invalidateCachedFile(key: string): void {
  const cached = files.get(key);
  if (cached) {
    URL.revokeObjectURL(cached.url);
    files.delete(key);
  }
}

export function invalidateCachedFiles(prefix: string): void {
  for (const key of files.keys()) {
    if (key.startsWith(prefix)) invalidateCachedFile(key);
  }
}
