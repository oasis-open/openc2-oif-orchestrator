import React, { Component } from 'react'
import {
    Alert,
    Button,
    Form,
    FormGroup,
    FormFeedback,
    Input,
    Jumbotron,
    Label
} from 'reactstrap'

export default (args) => {
    const change = (e) => {}
    let name = args.name || 'input'
    let label = args.label || null
    let input_type = args.type || 'text'
    let error = args.error || null
    let onChange = args.onChange || change
    let id = `id_${name}`

    return (
        <FormGroup color={error ? "danger" : ""}>
            {label ? <Label htmlFor={ id }>{ label }</Label> : ""}
            <Input
                type={input_type}
                name={name}
                id={id}
                className={ error ? "is-invalid" : ""}
                onChange={ onChange }
            />

            {error ? <FormFeedback className="invalid-feedback">{ error }</FormFeedback> : ""}
        </FormGroup>
    )
}
