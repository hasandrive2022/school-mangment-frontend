import { createUploadthing, type FileRouter } from "uploadthing/next";
const f = createUploadthing();
export const uploadRouter = {
  admissionImage: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } }).onUploadComplete(async ({ file }) => ({ url: file.ufsUrl ?? file.url })),
} satisfies FileRouter;
export type UploadRouter = typeof uploadRouter;
