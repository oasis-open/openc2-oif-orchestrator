/* eslint-disable max-classes-per-file */

type Data = Record<string, any>;
type Callback = (action: any, stream: string) => void;

declare module 'django-channels' {
  import { EventTarget } from 'event-target-shim';
  import ReconnectingWebSocket, {
    Event, CloseEvent, ErrorEvent, Options, UrlProvider
  } from 'reconnecting-websocket';

  class Forwarder extends EventTarget {
    constructor();
    forwardEvent: (event: Event | EventTarget.NonStandardEvent) => void;
  }

  export class Stream extends Forwarder {
    // Vars
    name: string;
    socket: ReconnectingWebSocket;

    // Methods
    constructor(name: string, socket: ReconnectingWebSocket);
    handleMessage: (event: Event | EventTarget.NonStandardEvent) => void;
    send: (action: Data) => void;
    // instance defined
    open: () => void;
    close: (event: CloseEvent) => void;
    error: (event: ErrorEvent) => void;
    message: (data: Data) => void;
  }

  export class WebSocketBridge extends Forwarder {
    // Vars
    socket: ReconnectingWebSocket;
    streams: Array<Stream>;

    // Methods
    constructor(options?: Record<string, any>);
    connect: (url: UrlProvider, protocols?: Array<string>|string, options?: Options) => void;
    handleMessage: (event: Data) => void;
    demultiplex: (stream: string, cb: Callback) => void;
    send: (msg: Data) => void;
    stream: (streamName: string) => Stream;
    // instance defined
    open: () => void;
    close: (event: CloseEvent) => void;
    error: (event: ErrorEvent) => void;
    message: (data: Data) => void;
  }
}