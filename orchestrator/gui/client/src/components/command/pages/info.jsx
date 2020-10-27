import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import JSONPretty from 'react-json-pretty';

import { iso2local } from '../../utils';
import * as CommandActions from '../../../actions/command';

const CommandInfo = props => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { command, command_id, getCommand } = props;
  const maxHeight = 500;

  if (command) {
    if (command.command_id !== command_id) {
      getCommand(command_id);
    }
  }

  const getResponses = () => {
    return (command.responses || []).map((rsp, i) => (
      <div key={ rsp.actuator }>
        <p className="m-0">
          <strong>{ `${rsp.actuator || 'Error'}:` }</strong>
        </p>
        <div className='position-relative mb-2'>
          <JSONPretty
            id={ `response-${i}` }
            className='border'
            style={{ minHeight: '2.5em' }}
            json={ rsp.response }
          />
        </div>
      </div>
    ));
  };

  return (
    <div className="col-md-10 mx-auto jumbotron">
      <h2>Command Info</h2>

      <p>
        <strong>Command ID:</strong>
        &nbsp;
        { command.command_id }
      </p>

      <p>
        <strong>Received:</strong>
        &nbsp;
        { iso2local(command.received_on) }
      </p>

      <div>
        <p><strong>Actuators:</strong></p>
        <ul className="list-group">
          { (command.actuators || []).map(act => <li key={ act.name } className="list-group-item">{ act.name }</li>) }
        </ul>
      </div>

      <div>
        <p className="m-0"><strong>Command:</strong></p>
        <div className='position-relative' style={{ maxHeight: `${maxHeight}px` }}>
          <JSONPretty
            id='command'
            className='scroll-xl border'
            style={{ minHeight: '2.5em' }}
            json={ command.command }
          />
        </div>
      </div>

      <div>
        <p className="m-0">
          <strong>Responses:</strong>
        </p>

        <div className="p-1 border border-primary scroll" style={{ maxHeight: `${maxHeight}px` }}>
          { getResponses() }
        </div>
      </div>
    </div>
  );
};

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
