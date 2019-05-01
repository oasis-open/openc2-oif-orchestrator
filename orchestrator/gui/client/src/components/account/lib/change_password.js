import React, { Component } from 'react'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta'
import qs from 'query-string'

import { toast } from 'react-toastify'

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

import * as AccountActions from '../../../actions/account'
import { withGUIAuth } from '../../../actions/util'

const str_fmt = require('string-format')

class ChangePassword extends Component {
    constructor(props, context) {
        super(props, context)

        this.meta = {
            title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Account - Change Password'}),
            canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
        }
        this.state = {
            password: {
                old: '',
                new_1: '',
                new_2: ''
            },
            errors: {},
            status: ''
        }

        this.submitForm = this.submitForm.bind(this)
    }

    submitForm(e) {
        e.preventDefault()
        console.log('submit form')
        Promise.resolve(this.props.changePassword(this.props.username, ...Object.values(this.state.password))).then(rsp => {
            this.setState({
                errors: this.props.errors[AccountActions.CHANGE_USER_PASSWORD_FAILURE],
                status: this.props.status[AccountActions.CHANGE_USER_PASSWORD_SUCCESS]
            })
        })
    }

    render() {
        return (
            <DocumentMeta { ...this.meta } extend >
                <div className='jumbotron col-md-6 mx-auto'>
                    <h1>Password Change</h1>

                    <form onSubmit={ this.submitForm }>
                        {
                            this.state.status ? (
                                <p className="form-text text-info">{ this.state.status }</p>
                            ) : ''
                        }

                        <div className='form-group col-md-8'>
                            <label htmlFor='old_password'>Old Password</label>
                            <input
                                type='password'
                                className='form-control'
                                id='old_password'
                                required=''
                                placeholder='password'
                                value={ atob(this.state.password.old) }
                                onChange={ e => this.setState({ password: { ...this.state.password, old: btoa(e.target.value) } }) }
                            />
                            {
                                this.state.errors.old_password ? (
                                    <small className="form-text text-danger">{ this.state.errors.old_password }</small>
                                ) : ''
                            }
                        </div>
                        <div className='form-group col-md-8'>
                            <label htmlFor='new_password_1'>New Password</label>
                            <input
                                type='password'
                                className='form-control'
                                id='new_password_1'
                                required=''
                                placeholder='password'
                                value={ atob(this.state.password.new_1) }
                                onChange={ e => this.setState({ password: { ...this.state.password, new_1: btoa(e.target.value) } }) }/>
                            {
                                this.state.errors.new_password_1 ? (
                                    <small className="form-text text-danger">{ this.state.errors.new_password_1 }</small>
                                ) : ''
                            }
                            <small className='form-text text-muted'>
                                <ul>
                                    <li>Your password can't be too similar to your other personal information.</li>
                                    <li>Your password must contain at least 8 characters.</li>
                                    <li>Your password can't be a commonly used password.</li>
                                    <li>Your password can't be entirely numeric.</li>
                                </ul>
                            </small>
                        </div>
                        <div className='form-group col-md-8'>
                            <label htmlFor='new_password_2'>New Password Confirmation</label>
                            <input
                                type='password'
                                className='form-control'
                                id='new_password_2'
                                required=''
                                placeholder='password'
                                value={ atob(this.state.password.new_2) }
                                onChange={ e => this.setState({ password: { ...this.state.password, new_2: btoa(e.target.value) } }) }/>
                            {
                                this.state.errors.new_password_2 ? (
                                    <small className="form-text text-danger">{ this.state.errors.new_password_2 }</small>
                                ) : ''
                            }
                        </div>

                        <Button type='submit' color='primary'>Save changes</Button>
                    </form>
                </div>
            </DocumentMeta>
        )
    }
}

function mapStateToProps(state) {
    return {
        username: state.Auth.access == undefined ? 'User' : state.Auth.access.username,
        errors: state.Account.errors,
        status: state.Account.status
    }
}


function mapDispatchToProps(dispatch) {
    return {
        changePassword: (usrn, op, np1, np2) => dispatch(AccountActions.changeUserPassword(usrn, op, np1, np2))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword)
