import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from 'reactstrap'

import * as AccountActions from '../../../actions/account'
import { withGUIAuth } from '../../../actions/util'

class UserModal extends Component {
    constructor(props, context) {
        super(props, context)

        this.toggleModal = this.toggleModal.bind(this)
        this.registerAccount = this.registerAccount.bind(this)
        this.saveAccount = this.saveAccount.bind(this)

        this.register = this.props.register == true

        this.defaultState = {
            account: {
                first_name: "",
                last_name: "",
                username: "",
                email: "",
                is_active: false,
                is_staff: false,
                auth_groups: [],
                actuator_groups: [],
                device_groups: []
            },
            password: {
                pass_1: "",
                pass_2: ""
            }
        }

        this.state = {
            modal: false,
            ...this.defaultState
        }
    }

    componentDidMount() {
        if (this.props.register) {
            this.setState({
                ...this.defaultState
            })

        } else if (this.props.data) {
            this.setState({
                ...this.defaultState,
                account: {
                    first_name: this.props.data.first_name,
                    last_name: this.props.data.last_name,
                    username: this.props.data.username,
                    email: this.props.data.email,
                    is_active: this.props.data.is_active || false,
                    is_staff: this.props.data.is_staff || false,
                    auth_groups: this.props.data.auth_groups,
                    actuator_groups: this.props.data.actuator_groups,
                    device_groups: this.props.data.device_groups
                }
            })
        }
    }

    toggleModal() {
        this.setState(prevState => ({
            modal: !prevState.modal,
            actuator: {
                ...this.defaultActuator,
                ...(this.register ? {} : this.props.data)
            }
        }))
    }

    registerAccount() {
        console.log("register Account")
        if (this.state.password.pass_1 == this.state.password.pass_2 && this.state.password.pass_1.length >= 8) {
            let account = {
                ...this.state.account,
                password: this.state.password.pass_1
            }

            Promise.resolve(this.props.createAccount(account)).then(() => {
                setTimeout(() => {
                    let errs = this.props.errors[AccountActions.CREATE_ACCOUNT_FAILURE] || {}
                    if (Object.keys(errs).length == 0) {
                        this.toggleModal()
                    } else {
                        if (errs.hasOwnProperty('non_field_errors')) {
                            Object.values(errs).forEach(err => {
                               toast(<p>Error: { err }</p>, {type: toast.TYPE.WARNING})
                            })
                        } else {
                            Object.keys(errs).forEach(err => {
                               toast(<div><p>Error { err }:</p><p>{ errs[err] }</p></div>, {type: toast.TYPE.WARNING})
                            })
                        }
                    }
                }, 500)
            })
        } else {
            toast(<div><p>Error:</p><p>Passwords do not match or are less than 8 characters</p></div>, {type: toast.TYPE.WARNING})
        }
    }

    saveAccount() {
        console.log("Save Account")
        Promise.resolve(this.props.updateAccount(this.state.account.username, this.state.account)).then(() => {
            setTimeout(() => {
                let errs = this.props.errors[AccountActions.UPDATE_ACCOUNT_FAILURE] || {}
                if (Object.keys(errs).length == 0) {
                    this.toggleModal()
                } else {
                    if (errs.hasOwnProperty('non_field_errors')) {
                        Object.values(errs).forEach(err => {
                           toast(<p>Error: { err }</p>, {type: toast.TYPE.WARNING})
                        })
                    } else {
                        Object.keys(errs).forEach(err => {
                           toast(<div><p>Error { err }:</p><p>{ errs[err] }</p></div>, {type: toast.TYPE.WARNING})
                        })
                    }
                }
            }, 500)
        })
    }

    passwords() {
        let match = (this.state.password.pass_1 == this.state.password.pass_2 && this.state.password.pass_1.length >= 8)

        return (
            <div className="form-row">
                <div className="form-group col-lg-6">
                    <label htmlFor="password_1">Password</label>
                    <input type="password" className={ "form-control " + (match ? "is-valid" : "is-invalid") } id='password_1' value={ this.state.password.pass_1 } onChange={ (e) => this.setState({ password: {...this.state.password, pass_1: e.target.value }}) } />
                </div>

                <div className="form-group col-lg-6">
                    <label htmlFor="password_2">Confirm Password</label>
                    <input type="password" className={ "form-control " + (match ? "is-valid" : "is-invalid") } id='password_2' value={ this.state.password.pass_2 } onChange={ (e) => this.setState({ password: {...this.state.password, pass_2: e.target.value }}) } />
                </div>

                <small className='form-text text-muted'>
                    <ul>
                        <li>Your password can't be too similar to your other personal information.</li>
                        <li>Your password must contain at least 8 characters.</li>
                        <li>Your password can't be a commonly used password.</li>
                        <li>Your password can't be entirely numeric.</li>
                    </ul>
                </small>
            </div>
        )
    }

    render() {
        return (
            <div className={ 'd-inline-block ' + this.props.className }>
                <Button color='primary' size='sm' onClick={ this.toggleModal } >{ this.register ? 'Register' : 'Edit' }</Button>

                <Modal isOpen={ this.state.modal } toggle={ this.toggleModal } size='lg' >
                    <ModalHeader toggle={ this.toggleModal }>{ this.register ? 'Register' : 'Edit' } User</ModalHeader>
                    <ModalBody>
                        <form onSubmit={ () => false }>
                            <div className="form-row">
                                <div className="form-group col-lg-6">
                                    <label htmlFor="first_name">First Name</label>
                                    <input type="text" className="form-control" id='first_name' value={ this.state.account.first_name } onChange={ (e) => this.setState({ account: {...this.state.account, first_name: e.target.value }}) } />
                                </div>

                                <div className="form-group col-lg-6">
                                    <label htmlFor="last_name">Last Name</label>
                                    <input type="text" className="form-control" id='last_name' value={ this.state.account.last_name } onChange={ (e) => this.setState({ account: {...this.state.account, last_name: e.target.value }}) } />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group col-lg-6">
                                    <label htmlFor="username">Username</label>
                                    <input type="text" className="form-control" id='username' value={ this.state.account.username } onChange={ (e) => this.setState({ account: {...this.state.account, username: e.target.value }}) } />
                                </div>

                                <div className="form-group col-lg-6">
                                    <label htmlFor="email">Email</label>
                                    <input type="email" className="form-control" id='email' value={ this.state.account.email } onChange={ (e) => this.setState({ account: {...this.state.account, email: e.target.value }}) } />
                                </div>
                            </div>

                            <div className="form-row mb-2">
                                <div className="col-12">
                                    <div className="form-check-inline no_indent col-lg-3">
                                        <label className="form-check-label">
                                            <input className="form-check-input" type="checkbox" checked={ this.state.account.is_active } onChange={ (e) => this.setState({ account: {...this.state.account, is_active: e.target.checked }}) } />
                                            Active
                                        </label>
                                    </div>

                                    <div className="form-check-inline no_indent col-lg-3">
                                        <label className="form-check-label">
                                            <input className="form-check-input" type="checkbox" checked={ this.state.account.is_staff } onChange={ (e) => this.setState({ account: {...this.state.account, is_staff: e.target.checked }}) } />
                                            Admin
                                        </label>
                                    </div>
                                </div>
                            </div>

                            { this.props.register ? this.passwords() : ""}

                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={ this.register ? this.registerAccount : this.saveAccount }>{ this.register ? 'Register' : 'Save' }</Button>
                        <Button color="danger" onClick={ this.toggleModal }>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    errors: state.Account.errors
})


const mapDispatchToProps = (dispatch) => ({
    createAccount: (acnt) => dispatch(AccountActions.createAccount(acnt)),
    updateAccount: (uname, acnt) => dispatch(AccountActions.updateAccount(uname, acnt))
})

export default connect(mapStateToProps, mapDispatchToProps)(UserModal)
