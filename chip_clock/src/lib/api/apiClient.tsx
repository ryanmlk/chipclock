import { toast } from "sonner";

type FetchOptions = RequestInit & {
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
};

export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      if (options.showToast !== false) {
        toast.error(options.errorMessage || "Request failed", {
          description: errText || `Status ${res.status}`,
        });
      }
      throw new Error(errText);
    }

    const data = (await res.json()) as T;

    if (options.showToast && options.successMessage) {
      toast.success("Success", {
        description: options.successMessage,
      });
    }

    return data;
  } catch (err) {
    console.error(`[apiFetch] Error calling ${url}`, err);
    if (options.showToast !== false && !options.errorMessage) {
      toast.error("Something went wrong. Please try again.");
    }
    return null;
  }
}
