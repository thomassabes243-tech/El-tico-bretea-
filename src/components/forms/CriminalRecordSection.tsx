"use client";

import { CriminalRecordUpload } from "@/components/forms/CriminalRecordUpload";

export function CriminalRecordSection({
  initialUploaded,
  initialUploadedAt,
}: {
  initialUploaded: boolean;
  initialUploadedAt: string | null;
}) {
  return (
    <CriminalRecordUpload
      initialUploaded={initialUploaded}
      initialUploadedAt={initialUploadedAt}
    />
  );
}
