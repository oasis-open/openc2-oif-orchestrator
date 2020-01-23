import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  Button,
  Collapse,
  Form,
  FormGroup,
  FormText,
  Input,
  Label,
} from 'reactstrap'

import {
  isOptional_json,
  Field
} from './'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons'

import * as GenActions from '../../../../../../actions/generate'


class MapField extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      open: false,
    }
  }

  render() {
    let parent = ""
    if (this.props.parent) {
      parent = [this.props.parent, this.props.name].join('.')
    } else if (this.props.name.match(/^[a-z]/)) {
      parent = this.props.name
    }

    let def_opts = []
    if (this.props.def.hasOwnProperty("properties")) {
      def_opts = Object.keys(this.props.def.properties).map((field, i) => (
        <Field
          key={ i }
          parent={ parent }
          name={ field }
          def={ this.props.def.properties[field] }
          required={ isOptional_json(this.props.def.required, field) }
          optChange={ this.props.optChange }
        />
      ))
    }

    if (this.props.def.hasOwnProperty("patternProperties")) {
      // TODO: Pattern Properties
      console.log("Map Pattern Props", this.props.def.patternProperties)
    }


    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>
          <Button
            color={ this.state.open ? "primary" : "info" }
            className='float-right p-1'
            onClick={ () => this.setState(prevState => ({ open: !prevState.open })) }
          >
            <FontAwesomeIcon icon={ this.state.open ? faMinusSquare : faPlusSquare } size="lg" />
          </Button>
          { (this.props.required ? '*' : '') + this.props.name }
        </legend>
        { this.props.def.description != '' ? <FormText color="muted">{ this.props.def.description }</FormText> : '' }
         <Collapse isOpen={ this.state.open }>
          <div className="col-12 my-1 px-0">
            { def_opts }
          </div>
        </Collapse>
      </FormGroup>
    )
  }
}

const mapStateToProps = (state) => ({
  schema: state.Generate.selectedSchema
})

export default connect(mapStateToProps)(MapField)
