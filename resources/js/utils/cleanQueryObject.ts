export function cleanQueryObject(obj: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            const cleanedArray = value.filter((v) => v !== '' && v !== null && v !== undefined);
            return [key, cleanedArray.length ? cleanedArray.join(',') : undefined];
          }
          return [key, value];
        })
        .filter(([, value]) => value !== undefined) // remove keys that became undefined after array filter
    );
  }