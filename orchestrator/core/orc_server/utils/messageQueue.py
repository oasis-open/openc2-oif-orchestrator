"""
Combination of AMQP Consumer/Producer as class for easier access within the Orchestrator code
"""
from sb_utils import safe_cast, Consumer, FrozenDict, Producer


class MessageQueue:
    _auth = FrozenDict({
        'username': 'guest',
        'password': 'guest'
    })
    _exchange = 'orchestrator'
    _consumerKey = 'response'
    _producerExchange = 'transport'

    def __init__(self, hostname='127.0.0.1', port=5672, auth=_auth, exchange=_exchange,
                 consumer_key=_consumerKey, producer_exchange=_producerExchange, callbacks=None):
        """
        Message Queue - holds a consumer class and producer class for ease of use
        :param hostname: server ip/hostname to connect
        :param port: port the AMQP Queue is listening
        :param exchange: name of the default exchange
        :param consumer_key: key to consumer
        :param producer_exchange: ...
        :param callbacks: list of functions to call on message receive
        """
        self._exchange = exchange if isinstance(exchange, str) else self._exchange
        self._consumerKey = consumer_key if isinstance(consumer_key, str) else self._consumerKey
        self._producerExchange = producer_exchange if isinstance(producer_exchange, str) else self._producerExchange

        self._publish_opts = dict(
            host=hostname,
            port=safe_cast(port, int)
        )

        self._consume_opts = dict(
            host=hostname,
            port=safe_cast(port, int),
            exchange=self._exchange,
            routing_key=self._consumerKey,
            callbacks=callbacks
        )

        self.producer = Producer(**self._publish_opts)
        self.consumer = Consumer(**self._consume_opts)

    def send(self, msg, headers, exchange=_producerExchange, routing_key=None):
        """
        Publish a message to the specified que and transport
        :param msg: message to be published
        :param headers: header information for the message being sent
        :param exchange: exchange name
        :param routing_key: routing key name
        :return: None
        """
        headers = headers or {}
        exchange = exchange if exchange == self._producerExchange else self._producerExchange
        if routing_key is None:
            raise ValueError('Routing Key cannot be None')
        self.producer.publish(
            message=msg,
            headers=headers,
            exchange=exchange,
            routing_key=routing_key
        )

    def register_callback(self, fun):
        """
        Register a function for when a message is received from the message queue
        :param fun: function to register
        :return: None
        """
        self.consumer.add_callback(fun)

    def shutdown(self):
        """
        Shutdown the connection to the queue
        """
        self.consumer.shutdown()
        self.consumer.join()
