import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";

export async function downloadPdf(args: { fileName: string; document: ReactElement }): Promise<void> {
  const blob = await pdf(args.document).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = args.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

