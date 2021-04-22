Socket_Close_Codes = {k: ('', 'Reserved and not used') for k in range(0, 999)}
Socket_Close_Codes.update({
    1000: ('Normal Closure', 'Normal closure; the connection successfully completed whatever purpose for which it was created'),
    1001: ('Going Away', 'The endpoint is going away, either because of a server failure or because the browser is navigating away from the page that opened the connection'),
    1002: ('Protocol Error', 'The endpoint is terminating the connection due to a protocol error'),
    1003: ('Unsupported Data', 'The connection is being terminated because the endpoint received data of a type it cannot accept (for example, a text-only endpoint received binary data)'),
    1004: ('', 'Reserved. A meaning might be defined in the future'),
    1005: ('No Status Recvd', 'Reserved.  Indicates that no status code was provided even though one was expected'),
    1006: ('Abnormal Closure', 'Reserved. Used to indicate that a connection was closed abnormally (that is, with no close frame being sent) when a status code is expected'),
    1007: ('Invalid frame payload data', 'The endpoint is terminating the connection because a message was received that contained inconsistent data (e.g., non-UTF-8 data within a text message)'),
    1008: ('Policy Violation', 'The endpoint is terminating the connection because it received a message that violates its policy. This is a generic status code, used when codes 1003 and 1009 are not suitable'),
    1009: ('Message too big', 'The endpoint is terminating the connection because a data frame was received that is too large'),
    1010: ('Missing Extension', 'The client is terminating the connection because it expected the server to negotiate one or more extension, but the server didn\'t'),
    1011: ('Internal Error', 'The server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request'),
    1012: ('Service Restart', 'The server is terminating the connection because it is restarting'),
    1013: ('Try Again Later', 'The server is terminating the connection due to a temporary condition, e.g. it is overloaded and is casting off some of its clients'),
    1014: ('Bad Gateway', 'The server was acting as a gateway or proxy and received an invalid response from the upstream server. This is similar to 502 HTTP Status Code'),
    1015: ('TLS Handshake', 'Reserved. Indicates that the connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can\'t be verified)'),
})
Socket_Close_Codes.update({k: ('', 'Reserved for future use by the WebSocket standard') for k in range(1016, 1999)})
Socket_Close_Codes.update({k: ('', 'Reserved for use by WebSocket extensions') for k in range(2000, 2999)})
Socket_Close_Codes.update({k: ('', 'Available for use by libraries and frameworks. May not be used by applications. Available for registration at the IANA via first-come, first-serve') for k in range(3000, 3999)})
Socket_Close_Codes.update({k: ('', 'Available for use by applications') for k in range(4000, 4999)})
