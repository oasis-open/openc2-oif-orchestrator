import React, { Component } from 'react';
import { Alert, Button, Jumbotron, Form, FormGroup, FormFeedback, Label, Input } from 'reactstrap';

const InputField = (args) => {
    let name = args.name || 'input';
    let label = args.label || null;
    let input_type = args.type || 'text';
    let error = args.error || null;
    let onChange = args.onChange || this.handleInputChange;
    let id = `id_${name}`;

    return (
        <FormGroup color={error ? "danger" : ""}>
            {label ? <Label htmlFor={id}>{label}</Label> : ""}
            <Input
                type={input_type}
                name={name}
                id={id}
                className={ error ? "is-invalid" : ""}
                onChange={ onChange }
            />

            {error ?
                <FormFeedback className="invalid-feedback">
                    { error }
                </FormFeedback>
                : ""
            }
        </FormGroup>
    )
}

export default InputField