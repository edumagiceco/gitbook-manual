import type { Metadata } from "next";
import { EditorLayout } from "@/components/editor/EditorLayout";

export const metadata: Metadata = {
  title: "Editor | GitBook Manual Site",
  description: "Markdown editor for creating and editing documentation",
};

export default function EditorPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EditorLayout>
      {children}
    </EditorLayout>
  );
}
