"""
OSQuery process_open_sockets ORM
"""
from osquery_orm.orm import BaseModel
from peewee import IntegerField, BigIntegerField, TextField


class ProcessOpenSockets(BaseModel):
    """
    Processes which have open network sockets on the system.
    Examples:
        select * from process_open_sockets where pid = 1
    """
    pid = IntegerField(help_text="Process (or thread) ID")  # {'index': True}
    fd = BigIntegerField(help_text="Socket file descriptor number")
    socket = BigIntegerField(help_text="Socket handle or inode number")
    family = IntegerField(help_text="Network protocol (IPv4, IPv6)")
    protocol = IntegerField(help_text="Transport protocol (TCP/UDP)")
    local_address = TextField(help_text="Socket local address")
    remote_address = TextField(help_text="Socket remote address")
    local_port = IntegerField(help_text="Socket local port")
    remote_port = IntegerField(help_text="Socket remote port")
    path = TextField(help_text="For UNIX sockets (family=AF_UNIX), the domain path")

    class Meta:
        table_name = "process_open_sockets"


# OS specific properties for Linux_MacOS_Windows
class Linux_MacOS_Windows_ProcessOpenSockets(ProcessOpenSockets):
    state = TextField(help_text="TCP socket state")


# OS specific properties for Linux
class Linux_ProcessOpenSockets(Linux_MacOS_Windows_ProcessOpenSockets):
    net_namespace = TextField(help_text="The inode number of the network namespace")
