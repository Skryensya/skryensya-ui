/*
 * Live React demo for /components/file-upload. Self-contained island (no function props crossing
 * the Astro boundary), mounted directly from the page with a bare `<FileUploadBasicDemo client:visible />`.
 */
import { FileUpload } from "@skryensya/react/file-upload";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame. See `framed.tsx`. */
const framed = framedIn("file-upload");

export const FileUploadBasicDemo = framed(function FileUploadBasicDemo() {
  return <FileUpload label="Adjuntos" maxFiles={3} maxFileSize={10_000_000} name="attachments" />;
});
