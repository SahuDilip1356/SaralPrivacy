"use client";
import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  fallbackClassName?: string;
}

export default function BlogImage({
  src,
  alt,
  className,
  loading = "lazy",
  fetchPriority,
  fallbackClassName,
}: Props) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return fallbackClassName ? (
      <div className={fallbackClassName} aria-hidden="true" />
    ) : null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      {...(fetchPriority ? { fetchPriority } : {})}
      onError={() => setBroken(true)}
    />
  );
}
