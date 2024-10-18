import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : "An unexpected error occurred";
}

export function isElementInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;

  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const isVerticallyInView = rect.top < windowHeight && rect.bottom > 0;
  const isHorizontallyInView = rect.left < windowWidth && rect.right > 0;

  return isVerticallyInView && isHorizontallyInView;
}
