import { fileUploadParts } from "@skryensya/core/file-upload";
import { fileUpload } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, type ReactNode } from "react";

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
      onFileChange?.({
        acceptedFiles: details.acceptedFiles,
        rejectedFiles: details.rejectedFiles.map(({ file, errors }) => ({
          file,
          errors,
        })),
      });
    },
  });
  const api = fileUpload.connect(service, normalizeProps);
  return (
    <div {...api.getRootProps()} className={fileUploadParts.root}>
      <label {...api.getLabelProps()} className={fileUploadParts.label}>
        {label}
      </label>
      <div {...api.getDropzoneProps()} className={fileUploadParts.dropzone}>
        <input {...api.getHiddenInputProps()} />
        <span>{dropzoneLabel}</span>
        <button
          {...api.getTriggerProps()}
          className="sk-button sk-interactive"
          data-variant="secondary"
          type="button"
        >
          {triggerLabel}
        </button>
      </div>
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
                  <span className="sr-only">Quitar {file.name}</span>
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
