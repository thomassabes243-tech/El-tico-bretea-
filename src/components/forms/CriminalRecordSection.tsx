"use client";

import { useState } from "react";
import { CriminalRecordUpload } from "@/components/forms/CriminalRecordUpload";
import { CvDownloadButton } from "@/components/forms/CvDownloadButton";

export function CriminalRecordSection({
  initialUploaded,
  initialUploadedAt,
  downloadLabel,
}: {
  initialUploaded: boolean;
  initialUploadedAt: string | null;
  downloadLabel: string;
}) {
  const [uploaded, setUploaded] = useState(initialUploaded);

  return (
    <>
      <CriminalRecordUpload
        initialUploaded={initialUploaded}
        initialUploadedAt={initialUploadedAt}
        onChange={setUploaded}
      />
      <CvDownloadButton hasCriminalRecord={uploaded} label={downloadLabel} />
    </>
  );
}
