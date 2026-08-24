import { fileUploadErrorMessage, fileUploadParts } from "@skryensya/core/file-upload";
import { fileUpload } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, useState, type ReactNode } from "react";

export type FileUploadProps = {
  id?: string;
  name?: string;
  label: ReactNode;
  dropzoneLabel?: ReactNode;
  triggerLabel?: ReactNode;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxFileSize?: number;
  minFileSize?: number;
  disabled?: boolean;
  required?: boolean;
  allowDrop?: boolean;
  directory?: boolean;
  multiple?: boolean;
  acceptedFiles?: File[];
  defaultAcceptedFiles?: File[];
  deleteIcon?: ReactNode;
  clearLabel?: string;
  onFileChange?: (details: {
    acceptedFiles: File[];
    rejectedFiles: Array<{ file: File; errors: string[] }>;
  }) => void;
};

export function FileUpload({
  accept,
  acceptedFiles,
  allowDrop,
  clearLabel = "Quitar todos",
  defaultAcceptedFiles,
  deleteIcon,
  directory,
  disabled,
  dropzoneLabel = "Arrastra archivos aquí",
  id,
  label,
  maxFileSize,
  maxFiles,
  minFileSize,
  multiple = false,
  name,
  onFileChange,
  required,
  triggerLabel = "Elegir archivos",
}: FileUploadProps) {
  const generatedId = useId();
  const [rejected, setRejected] = useState<Array<{ file: File; errors: string[] }>>([]);
  const service = useMachine(fileUpload.machine, {
    id: id ?? generatedId,
    name,
    accept,
    acceptedFiles,
    defaultAcceptedFiles,
    allowDrop,
    directory,
    disabled,
    required,
    maxFileSize,
    maxFiles: maxFiles ?? (multiple ? Number.POSITIVE_INFINITY : 1),
    minFileSize,
    onFileChange(details) {
      const rejectedFiles = details.rejectedFiles.map(({ file, errors }) => ({
        file,
        errors,
      }));
      // Selecting a valid batch after a rejected one clears the old message: it is feedback about
      // the LAST selection, never a running log of every attempt this session.
      setRejected(rejectedFiles);
      onFileChange?.({ acceptedFiles: details.acceptedFiles, rejectedFiles });
    },
  });
  const api = fileUpload.connect(service, normalizeProps);
  return (
    <div {...api.getRootProps()} className={fileUploadParts.root}>
      <label {...api.getLabelProps()} className={fileUploadParts.label}>
        {label}
      </label>
      {/* The dropzone holds the instruction and nothing interactive: it is role="button" with its
          own tab stop, and a button containing a focusable descendant is unreachable past its first
          child. The input and the trigger are siblings; Zag wires them by props, not by nesting. */}
      <div {...api.getDropzoneProps()} className={fileUploadParts.dropzone}>
        <span>{dropzoneLabel}</span>
      </div>
      {/* The part class is what hides it (`clip-path: inset(50%)`); without it the raw file input
          paints on top of everything it is supposed to be behind. */}
      <input {...api.getHiddenInputProps()} className={fileUploadParts.input} />
      <button
        {...api.getTriggerProps()}
        className="sk-button sk-interactive"
        data-variant="secondary"
        type="button"
      >
        {triggerLabel}
      </button>
      {rejected.length ? (
        // `role="alert"`: unlike the accepted list below, this is new, unexpected feedback about
        // the choice the reader just made, not a persistent state a screen reader can visit at
        // will. The same reasoning `Callout`'s own `danger` tone already carries.
        <div className={fileUploadParts.rejection} role="alert">
          {rejected.map(({ file, errors }) => (
            <p key={`${file.name}-${file.lastModified}`}>
              {file.name}: {errors.map((error) => fileUploadErrorMessage(error)).join(", ")}
            </p>
          ))}
        </div>
      ) : null}
      {api.acceptedFiles.length ? (
        <>
          <ul
            {...api.getItemGroupProps()}
            className={fileUploadParts.itemGroup}
          >
            {api.acceptedFiles.map((file) => (
              <li
                {...api.getItemProps({ file })}
                className={fileUploadParts.item}
                key={`${file.name}-${file.lastModified}`}
              >
                <span
                  {...api.getItemNameProps({ file })}
                  className={fileUploadParts.itemName}
                >
                  {file.name}
                </span>
                <span
                  {...api.getItemSizeTextProps({ file })}
                  className={fileUploadParts.itemSize}
                >
                  {api.getFileSize(file)}
                </span>
                <button
                  {...api.getItemDeleteTriggerProps({ file })}
                  className={fileUploadParts.itemDelete}
                  type="button"
                >
                  <span className="sk-visually-hidden">Quitar {file.name}</span>
                  <span aria-hidden="true">{deleteIcon ?? "×"}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            {...api.getClearTriggerProps()}
            className="sk-button sk-interactive"
            data-variant="ghost"
            type="button"
          >
            {clearLabel}
          </button>
        </>
      ) : null}
    </div>
  );
}
