"use client";

import { useState } from "react";
import { CriminalRecordUpload } from "@/components/forms/CriminalRecordUpload";
import { CvDownloadButton } from "@/components/forms/CvDownloadButton";

export function CriminalRecordSection({
  initialUploaded,
  initialUploadedAt,
  downloadLabel,
  canDownload,
}: {
  initialUploaded: boolean;
  initialUploadedAt: string | null;
  downloadLabel: string;
  canDownload: boolean;
}) {
  const [uploaded, setUploaded] = useState(initialUploaded);

  return (
    <>
      <CriminalRecordUpload
        initialUploaded={initialUploaded}
        initialUploadedAt={initialUploadedAt}
        onChange={setUploaded}
      />
      {canDownload && <CvDownloadButton hasCriminalRecord={uploaded} label={downloadLabel} />}
    </>
  );
}
