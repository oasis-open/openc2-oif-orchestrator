import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import {
  Button,
  Form,
  FormGroup,
  FormText,
  Input,
  Label,
} from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons'

import {
  isOptional_json,
  Field
} from './'

import { safeGet } from '../../../../../utils'

import * as GenActions from '../../../../../../actions/generate'


class ArrayField extends Component {
  constructor(props, context) {
    super(props, context)

    this.name = this.props.name || this.props.def.name
    this.msgName = (this.props.parent ? [this.props.parent, this.name] : [this.name]).join('.')

    this.opts = {
      min: this.props.def.minItems || 0,
      max: this.props.def.maxItems || 100
    }

    this.state = {
      min: false,
      max: false,
      count: 1,
      opts: {}
    }
  }

  addOpt(e) {
    e.preventDefault()
    let max = this.opts.max

    this.setState((prevState) => {
      let max_bool = prevState.count < max
      return {
        count: max_bool ? ++prevState.count : prevState.count,
        max: !max_bool
      }
    }, () => {
      this.props.optChange(this.msgName, Array.from(new Set(Object.values(this.state.opts))))
      if (this.state.max) {
        toast(<div><p>Warning:</p><p>Cannot have more than { this.opts.max } items for { this.name }</p></div>, {type: toast.TYPE.WARNING})
      }
    })
  }

  removeOpt(e) {
    e.preventDefault()
    let min = this.opts.min

    this.setState((prevState) => {
      let min_bool = prevState.count > min
      let opts = prevState.opts
      if (min_bool) {
        delete opts[Math.max.apply(Math, Object.keys(opts))]
      }

      return {
        count: min_bool ? --prevState.count : prevState.count,
        min: !min_bool,
        opts: opts
      }
    }, () => {
      this.props.optChange(this.msgName, Array.from(new Set(Object.values(this.state.opts))))
      if (this.state.min) {
        toast(<div><p>Warning:</p><p>Cannot have less than { this.opts.min } items for { this.name }</p></div>, {type: toast.TYPE.WARNING})
      }
    })
  }

  optChange(k, v, i) {
    this.setState((prevState) => {
      return {
        opts: {
          ...prevState.opts,
          [i]: v
        }
      }
    }, () => {
      this.props.optChange(this.msgName, Array.from(new Set(Object.values(this.state.opts))))
    })
  }

  render() {
    this.desc = safeGet(this.props.def, "description", "")

    let fields = []
    for (let i=0; i < this.state.count; ++i) {
      if (Array.isArray(this.props.def.items)) {
        fields.push(this.props.def.items.map(field => {
          let name = field.hasOwnProperty("$ref") ? field["$ref"].replace(/^#\/definitions\//, "") : ""
          return <Field key={ i } name={ name } parent={ this.msgName } def={ field } optChange={ this.optChange.bind(this) } idx={ i } />
        }))
      } else {
        let name = "Field"
        let ref = {}

        if (this.props.def.items.hasOwnProperty("$ref")) {
          name = this.props.def.items["$ref"].replace("#/definitions/", "")
          ref = safeGet(safeGet(this.props.schema, "definitions", {}), name, {})
        } else if (this.props.def.items.hasOwnProperty("type")) {
          console.log("Type")
          ref = { ...this.props.def.items }
        }
        fields.push(<Field key={ i } name={ name } parent={ this.msgName } def={ ref } optChange={ this.optChange.bind(this) } idx={ i } />)
      }
    }

    return (
      <FormGroup tag="fieldset" className="border border-dark p-2">
        <legend>
          { (isOptional_json(this.props.def.req, this.name) ? '' : '*') + this.name }
          <Button
            color="danger"
            className={ 'float-right p-1' + (this.state.min ? ' disabled' : '') }
            onClick={ this.removeOpt.bind(this) }
          >
            <FontAwesomeIcon icon={ faMinusSquare } size="lg"/>
          </Button>
          <Button
            color="primary"
            className={ 'float-right p-1' + (this.state.max ? ' disabled' : '') }
            onClick={ this.addOpt.bind(this) }
          >
            <FontAwesomeIcon icon={ faPlusSquare } size="lg"/>
          </Button>
        </legend>
        { this.desc ? <FormText color="muted">{ this.desc }</FormText> : '' }
        { fields }
      </FormGroup>
    )
  }
}

const mapStateToProps = (state) => ({
  schema: state.Generate.selectedSchema,
  baseTypes: state.Generate.types.base
})


export default connect(mapStateToProps)(ArrayField)
