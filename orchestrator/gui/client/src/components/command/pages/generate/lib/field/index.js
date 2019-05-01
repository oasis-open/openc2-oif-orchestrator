import React, { Component } from 'react'
import { connect } from 'react-redux'

import JSONPretty from 'react-json-pretty'

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import ArrayOf from './arrayOf'
import Basic from './basicField'
import Choice from './choice'
import Enumerated from './enumerated'
import { isOptional } from '../'
import Map from './map'
import Record from './record'


class Field extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props != nextProps
        let state_update = this.state != nextState
        return props_update || state_update
    }

    render() {
        let typeDef = (this.props.schema.types || []).filter((type) => { return type[0] == this.props.def[2] })
        typeDef = typeDef.length === 1 ? typeDef[0] : []
        let parent = this.props.parent || ''

        let fieldArgs = {
            def: this.props.def,
            parent: parent,
            optChange: (k, v) => this.props.optChange(k, v, this.props.idx)
        }

        switch(typeDef[1]) {
            case 'Enumerated':
                return <Enumerated { ...fieldArgs } />
            case 'Choice':
			    return <Choice { ...fieldArgs } />
            case 'Record':
			    return <Record { ...fieldArgs } />
			case 'Map':
			    return <Map { ...fieldArgs } />
			case 'ArrayOf':
			    return <ArrayOf { ...fieldArgs } />
			case 'Array':
			    return <FormText>Array: { this.props.def[1] }</FormText>
			default:
			    return <Basic { ...fieldArgs } />
        }
    }
}

function mapStateToProps(state) {
    return {
        schema: state.Generate.selectedSchema
    }
}


function mapDispatchToProps(dispatch) {
    return {
    }
}

const connectedField = connect(mapStateToProps, mapDispatchToProps)(Field)


export {
    connectedField as default,
    connectedField as Field,
    isOptional,
    Map
}

