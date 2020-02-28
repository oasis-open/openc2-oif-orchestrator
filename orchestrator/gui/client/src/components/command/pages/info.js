import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import JSONPretty from 'react-json-pretty';
import { format, parseISO } from 'date-fns';

import * as CommandActions from '../../../actions/command';

class CommandInfo extends Component {
  constructor(props, context) {
    super(props, context);

    this.tableColumns = [
      {
        text: 'Command ID',
        dataField: 'command_id',
        sort: true
      },
      {
        text: 'Received',
        dataField: 'received_on',
        sort: true
      },
      {
        text: 'Status',
        dataField: 'status',
        sort: true
      },
      {
        text: 'Command',
        dataField: 'command',
        formatter: cell => <span>{ cell.action }  - { Object.keys(cell.target)[0] || '' }</span>
      }
    ];

    if (this.props.command) {
      if (this.props.command.command_id !== this.props.command_id) {
        this.props.getCommand(this.props.command_id);
      }
    }
  }

  render() {
    const cmd = this.props.command;
    const maxHeight = 500;
    let received = parseISO(cmd.received_on);

    try {
      received = format(received, 'EEEE, MMMM do yyyy, h:mm:ss a zzzz');
    } catch (e) {
      received = '...';
    }

    return (
      <div className="col-md-10 mx-auto jumbotron">
        <h2>Command Info</h2>

        <p><strong>Command ID:</strong> { cmd.command_id }</p>

        <p><strong>Received:</strong> { received }</p>

        <div>
          <p><strong>Actuators:</strong></p>
          <ul className="list-group">
            { (cmd.actuators || []).map(act => <li key={ act.name } className="list-group-item">{ act.name }</li>) }
          </ul>
        </div>

        <div>
          <p className="m-0"><strong>Command:</strong></p>
          <div className='position-relative' style={{ maxHeight: `${maxHeight}px` }}>
            <JSONPretty
              id='command'
              className='scroll-xl border'
              style={{ minHeight: '2.5em' }}
              json={ cmd.command }
            />
          </div>
        </div>

        <div>
          <p className="m-0"><strong>Responses:</strong></p>

          <div className="p-1 border border-primary scroll" style={{ maxHeight: `${maxHeight}px` }}>
            {
              (cmd.responses || []).map((rsp, i) => (
                <div key={ rsp.actuator }>
                  <p className="m-0"><strong>{ rsp.actuator || 'Error' }:</strong></p>
                  <div className='position-relative mb-2'>
                    <JSONPretty
                      id={ `response-${i}` }
                      className='border'
                      style={{ minHeight: '2.5em' }}
                      json={ rsp.response }
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  }
}

CommandInfo.propTypes = {
  command: PropTypes.shape({
    actuators: PropTypes.array,
    command: PropTypes.object,
    command_id: PropTypes.string,
    received_on: PropTypes.string,
    responses: PropTypes.array
  }).isRequired,
  getCommand: PropTypes.func.isRequired,
  command_id: PropTypes.string.isRequired
};

const mapStateToProps = (state, props) => {
  const cmd = state.Command.commands.filter(c => c.command_id === props.command_id);
  return {
    siteTitle: state.Util.site_title,
    orchestrator: {
      name: state.Util.name || 'N/A'
    },
    admin: state.Auth.access.admin,
    command: cmd.length === 1 ? cmd[0] : {}
  };
};

const mapDispatchToProps= dispatch => ({
  getCommand: cmd => dispatch(CommandActions.getCommand(cmd))
});

export default connect(mapStateToProps, mapDispatchToProps)(CommandInfo);
