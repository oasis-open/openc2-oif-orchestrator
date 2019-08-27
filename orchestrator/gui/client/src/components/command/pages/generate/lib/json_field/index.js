import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import JSONPretty from 'react-json-pretty'

import {
  Button,
  Form,
  FormGroup,
  FormText,
  Input,
  Label
} from 'reactstrap'

import Array from './array'
import Basic from './basicField'
import Choice from './choice'
import Enumerated from './enumerated'
import Map from './map'
import Record from './record'

import {
  isOptional_json,
  opts2arr,
} from '../'

import { safeGet } from '../../../../../utils'


class Field extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    let props_update = this.props != nextProps
    let state_update = this.state != nextState
    return props_update || state_update
  }

  render() {
    let def = { ...this.props.def }

    if (def.hasOwnProperty("$ref")) {
      let ref_name = def["$ref"].replace(/^#\/definitions\//, "")
      delete def["$ref"]

      def = {
        ...this.props.schema.definitions[ref_name],
        ...def
      }
    }

    let fieldArgs = {
      parent: this.props.parent,
      name: this.props.name || def.name,
      def: def,
      required: this.props.required,
      optChange: (k, v) => this.props.optChange(k, v, this.props.idx)
    }

    switch(def.type) {
      case "object":
        let min_props = safeGet(def, "minProperties")
        let max_props = safeGet(def, "maxProperties")
        if (min_props == 1 && max_props == 1) {
          // console.log("Choice - " + fieldArgs.name + ", min: "+ min_props + ", max: " + max_props)
          return <Choice { ...fieldArgs } />

        } else if (min_props == 1 && max_props == null) {
          // console.log("Map - " + fieldArgs.name + ", min: "+ min_props + ", max: " + max_props)
          return <Map { ...fieldArgs } />

        } else if (def.hasOwnProperty('properties') || (min_props == null && max_props == null)) {
          // console.log("Record - " + fieldArgs.name + ", min: "+ min_props + ", max: " + max_props)
          return <Record { ...fieldArgs } />
        }
        return <p>Object - { this.props.name }</p>
      case 'array':
        // console.log("Array - " + fieldArgs.name)
        return <Array { ...fieldArgs } />
      default:
        if (def.hasOwnProperty('enum') || def.hasOwnProperty("oneOf")) {
          // console.log("Enum - " + fieldArgs.name)
          return <Enumerated { ...fieldArgs } />
        }
        // console.log("Basic - " + fieldArgs.name)
        return <Basic { ...fieldArgs } />
     }
  }
}

const mapStateToProps = (state) => ({
  schema: state.Generate.selectedSchema
})

const connectedField = connect(mapStateToProps)(Field)

connectedField.propTypes = {
  idx: PropTypes.number,
  parent: PropTypes.string,
  name: PropTypes.string,
  def: PropTypes.object,
  required: PropTypes.bool,
  optChange: PropTypes.func
}

connectedField.defaultProps = {
  idx: null,
  parent: "",
  name: "Field",
  def: {},
  required: false,
  optChange: (k, v) => console.log(k, v)
}

export {
  connectedField as default,
  connectedField as Field,
  isOptional_json
}

