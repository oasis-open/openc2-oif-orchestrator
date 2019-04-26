import React, { Component } from 'react'
import { connect } from 'react-redux'

import JSONPretty from 'react-json-pretty'

import {
    Button,
    Form,
    FormGroup,
    FormText,
    Input,
    Label
} from 'reactstrap'

import ArrayOf from './arrayOf'
import Basic from './basicField'
import Choice from './choice'
import Enumerated from './enumerated'
import Map from './map'
import Record from './record'

import {
    isOptional_jadn,
    keys,
    opts2arr,
    zip
} from '../'

import { safeGet } from '../../../../../utils'


class Field extends Component {
    constructor(props, context) {
        super(props, context)
        this.schema_types = safeGet(safeGet(this.props, "schema", {}), "types", [])
        this.ignore_fields = ["Enumerated"]
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props != nextProps
        let state_update = this.state != nextState

        if (props_update) {
            this.schema_types = safeGet(safeGet(this.props, 'schema', {}), 'types', [])
        }

        return props_update || state_update
    }

    buildField(def, key=null) {
        let fieldArgs = {
            key: key,
            name: def.name,
            parent: this.props.parent || '',
            def: def,
            optChange: (k, v) => this.props.optChange(k, v, this.props.idx)
        }

        if (def.hasOwnProperty("id")) {
            let typeDef = this.schema_types.filter((type) => type[0] == def.type )
            if (typeDef.length === 1) {
                fieldArgs.def = zip(keys.Structure, typeDef[0])
                fieldArgs.def.desc = def.desc
            }
        }

        switch(fieldArgs.def.type) {
            case 'Array':
			    return <FormText key={ key } >Array: { fieldArgs.name }</FormText>
			case 'ArrayOf':
			    return <ArrayOf { ...fieldArgs } />
			case 'Choice':
			    return <Choice { ...fieldArgs } />
            case 'Enumerated':
                return <Enumerated { ...fieldArgs } />
			case 'Map':
			    return <Map { ...fieldArgs } />
            case 'Record':
			    return <Record { ...fieldArgs } />
			default:
			    return <Basic { ...fieldArgs } />
        }
    }

    render() {
        if (this.props.def.hasOwnProperty("fields") && this.ignore_fields.indexOf(this.props.def.type) == -1) {
            return this.props.def.fields.map((def, i) => this.buildField(zip(keys.Gen_Def, def), i))
        } else {
            return this.buildField(this.props.def)
        }
    }
}

const mapStateToProps = (state) => ({
    schema: state.Generate.selectedSchema
})

const connectedField = connect(mapStateToProps)(Field)


export {
    connectedField as default,
    connectedField as Field,
    isOptional_jadn,
    keys,
    opts2arr,
    zip,
    Map
}

