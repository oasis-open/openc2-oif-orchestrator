import React, { Component } from 'react'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta'

const str_fmt = require('string-format')

import {
    Settings,
    Users
} from './pages'

import {
    titleCase
} from '../utils'

class Admin extends Component {
    constructor(props, context) {
        super(props, context)
        this.changePage = this.changePage.bind(this)

         this.meta = {
            title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Admin'}),
            canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
        }

        this.validPages = ['settings', 'users']
        let page = this.props.match.params.page || 'users'

        if (this.validPages.indexOf(page) ===  -1) {
            page = 'users'
        }

        this.state = {
            activeTab: page
        }
    }

    changePage(e) {
        e.preventDefault()
        this.toggleTab(e.target.dataset.page)
    }

    toggleTab(tab) {
        if (this.state.activeTab !== tab) {
            this.props.history.push({
                pathname: str_fmt('/admin/{tab}', {tab: tab})
            })
            this.setState({
                activeTab: tab
            })
        }
    }

    getContent() {
        let content = ""
        switch (this.state.activeTab) {
            case 'users':
                content = <Users />
                break;
            default:
                content = <Settings />
                break;
        }
        return (
            <div className="col-12">
                { content }
            </div>
        )
    }

    render() {
        return (
            <DocumentMeta { ...this.meta } extend >
                <div className="row mx-auto">
                    <nav className="navbar navbar-expand-lg navbar-dark bg-dark w-100">
                        <a className="navbar-brand" href="#" data-page="" onClick={ this.changePage }>Admin</a>
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarColor02">
                            <ul className="navbar-nav mr-auto">
                                <li className="nav-item active">
                                    <a className="nav-link" href="#" data-page="users" onClick={ this.changePage } >Users</a>
                                </li>
                                <li className="nav-item active">
                                    <a className="nav-link" href="#" data-page="settings" onClick={ this.changePage } >Settings</a>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    { this.getContent() }
                </div>
            </DocumentMeta>
        )
    }
}

const mapStateToProps = (state) => ({
    siteTitle: state.Util.site_title,
})

const mapDispatchToProps = (dispatch) => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(Admin)
