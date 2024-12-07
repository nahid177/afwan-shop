// src/hooks/useFetcher.ts
const fetcher = async (url: string) => {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include", // Ensure cookies are sent
    });
  
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
  
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
  
    return res.json();
  };
  
  export default fetcher;
  