import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Button,
    Form,
    FormGroup,
    FormText,
    Input,
    Label,
} from 'reactstrap';

import { Map } from './'

import * as GenActions from '../../../../../../actions/generate'


class RecordField extends Map {}

const mapStateToProps = (state) => ({
    schema: state.Generate.selectedSchema
})

export default connect(mapStateToProps)(RecordField)
