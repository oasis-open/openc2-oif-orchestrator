import time

from orchestrator_api import Orchestrator

orc = Orchestrator('localhost:8080/api/', 'admin', 'password')

print('Orchestrator Info')
print(orc.info())

print('Accounts - All')
print(orc.account.users())

print('Accounts - New')
print(orc.account.new('user', 'password'))

print('Accounts - user')
print(orc.account.user('user'))

print('Accounts - user update')
print(orc.account.update('user', 'password1'))

print('Accounts - user delete')
print(orc.account.delete('user'))

print('Accounts - user actuators')
print(orc.account.actuators('user'))

# print('Commands')
# print(orc.command.commands())

print('')
