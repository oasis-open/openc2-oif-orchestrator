import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

import * as GenActions from '../../../../../../actions/generate'

import { Map } from './'

class RecordField extends Map {
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

export default connect(mapStateToProps, mapDispatchToProps)(RecordField)
