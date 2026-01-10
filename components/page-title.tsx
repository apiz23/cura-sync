"use client";

import { useEffect } from "react";

interface PageTitleProps {
  title: string;
  prefix?: string;
}

export default function PageTitle({ title, prefix = "CuraSync" }: PageTitleProps) {
  useEffect(() => {
    // Updates the tab title whenever 'title' changes
    document.title = `${title} | ${prefix}`;
  }, [title, prefix]);

  return null; // This component renders nothing visually
}