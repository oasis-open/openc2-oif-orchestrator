import React, { CSSProperties, FunctionComponent } from 'react';
import { Input } from 'reactstrap';

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: string;
  base64: string|ArrayBuffer|null,
  file: File
}

interface FileBase64Props {
  id: string;
  name?: string;
  className?: string;
  onDone: (f: FileInfo|Array<FileInfo>) => void;
  multiple?: boolean;
  style?: CSSProperties;
}

const DefaultProps = {
  name: '',
  className: '',
  multiple: false,
  style: {}
};

const FileBase64: FunctionComponent<FileBase64Props> = (props) => {
  const {
    id, name, className, onDone, multiple, style
  } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // get the files
    const { files } = e.target;

    // Process each file
    const allFiles: Array<FileInfo> = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Make new FileReader
        const reader = new FileReader();

        // Convert the file to base64 text
        reader.readAsDataURL(file);

        // on reader load somthing...
        reader.onload = () => {
          // Make a fileInfo Object
          const fileInfo = {
            id,
            name: file.name,
            type: file.type,
            size: `${Math.round(file.size / 1000)} kB`,
            base64: reader.result,
            file
          };

          // Push it to the state
          allFiles.push(fileInfo);

          // If all files have been proceed
          if (allFiles.length === files.length) {
            // Apply Callback function
            if (multiple) {
              onDone(allFiles);
            } else {
              onDone(allFiles[0]);
            }
          }
        };
      }
    }
  };

  return (
    <Input
      id={ id }
      name={ name }
      type="file"
      className={ className }
      style={ style }
      onChange={ handleChange }
      multiple={ multiple }
    />
  );
};

FileBase64.defaultProps = DefaultProps;

export default FileBase64;