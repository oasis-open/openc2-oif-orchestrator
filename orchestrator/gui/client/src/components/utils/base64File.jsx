import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';

const FileBase64 = props => {
  const {
    id, name, classes, onDone, multiple, style
  } = props;

  const handleChange = e => {
    // get the files
    const { files } = e.target;

    // Process each file
    const allFiles = [];
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
  };

  return (
    <Input
      id={ id }
      name={ name }
      type="file"
      className={ classes }
      style={ style }
      onChange={ handleChange }
      multiple={ multiple }
    />
  );
};

FileBase64.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  classes: PropTypes.string,
  onDone: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  style: PropTypes.object
};

FileBase64.defaultProps = {
  name: '',
  classes: '',
  multiple: false,
  style: {}
};

export default FileBase64;