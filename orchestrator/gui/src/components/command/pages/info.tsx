import React, { FunctionComponent } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import JSONPretty from 'react-json-pretty';
import { iso2local } from '../../utils';
import { Command } from '../../../actions';
import { RootState } from '../../../reducers';

// Interfaces
interface CommandInfoProps {
  command_id: string
}

// Redux Connector
const mapStateToProps = (state: RootState, props: CommandInfoProps) => {
  const cmd = state.Command.commands.filter(c => c.command_id === props.command_id);
  return {
    siteTitle: state.Util.site_title,
    orchestrator: {
      name: state.Util.name || 'N/A'
    },
    admin: state.Auth.access?.admin || false,
    command: cmd.length === 1 ? cmd[0] : undefined
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getCommand: (commandID: string) => dispatch(Command.getCommand(commandID))
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type CommandInfoConnectedProps = CommandInfoProps & ConnectorProps;

// Component
const CommandInfo: FunctionComponent<CommandInfoConnectedProps> = props => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { command, command_id, getCommand } = props;
  const maxHeight = 500;

  if (command && command.command_id !== command_id) {
    getCommand(command_id);
  }
  if (!command) {
    return (
      <div className="col-md-10 mx-auto jumbotron">
        <h3>Command Info Loading</h3>
      </div>
    );
  }

  const getResponses = (cmd: Command.Command) => {
    return (cmd.responses || []).map((rsp, i) => (
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
          { getResponses(command) }
        </div>
      </div>
    </div>
  );
};

export default connector(CommandInfo);
