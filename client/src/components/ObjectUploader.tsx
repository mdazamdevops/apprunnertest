import { useEffect, useMemo, useRef } from "react";
import Uppy from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";
import { Dashboard } from "@uppy/react";
import axios from "axios";

interface ObjectUploaderProps {
  onUploadComplete: (fileUrl: string) => void;
  isPublic: boolean;
}

export function ObjectUploader({ onUploadComplete, isPublic }: ObjectUploaderProps) {
  const uppy = useMemo(
    () =>
      new Uppy({
        restrictions: {
          maxFileSize: 10 * 1024 * 1024,
          maxNumberOfFiles: 1,
          allowedFileTypes: ["image/*"]
        },
        autoProceed: true
      }),
    []
  );

  const isPublicRef = useRef(isPublic);

  useEffect(() => {
    isPublicRef.current = isPublic;
  }, [isPublic]);

  useEffect(() => {
    uppy.use(AwsS3, {
      async getUploadParameters(file) {
        const { data } = await axios.post("/api/objects/upload", {
          contentType: file.type ?? "image/png",
          isPublic: isPublicRef.current
        });

        uppy.setFileMeta(file.id, {
          normalizedPath: data.normalizedPath,
          objectPath: data.objectPath
        });

        return {
          method: "PUT",
          url: data.uploadUrl,
          fields: {},
          headers: { "Content-Type": file.type ?? "image/png" }
        };
      }
    });

    const handleComplete = (result: any) => {
      const successful = result.successful[0];
      if (successful) {
        onUploadComplete((successful.meta as any)?.normalizedPath ?? successful.uploadURL ?? "");
      }
    };

    uppy.on("complete", handleComplete);

    return () => {
      uppy.off("complete", handleComplete);
      uppy.removePlugin("AwsS3");
    };
  }, [onUploadComplete, uppy]);

  useEffect(() => () => uppy.close(), [uppy]);

  return <Dashboard uppy={uppy} proudlyDisplayPoweredByUppy={false} />;
}
