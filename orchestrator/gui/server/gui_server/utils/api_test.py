from orchestrator_api import OrchestratorAPI

orc_api = OrchestratorAPI('http://localhost:8080/api/', ws=False)
# orc_api = OrchestratorAPI('http://localhost:8080/', ws=True)

jwt = orc_api.account.jwt(body=dict(username="admin", password="password"))
token = jwt.body.get('token', '')
opts = dict(
    headers=dict(
        Authorization=f"JWT {token}"
    )
)

print('Orchestrator Root')
rsp = orc_api.root.info(**opts)
print(f"{rsp.url} - {rsp.status_code} - {rsp.body}")

rsp = orc_api.root.api(**opts, params={"format": "corejson"})
print(f"{rsp.status_code} - {rsp.body}")
print('')

print('Account Endpoints')
rsp = orc_api.account.info(**opts)
print(f"{rsp.url} - {rsp.status_code} - {rsp.body}")

rsp = orc_api.account.retrieve("admin", **opts)
print(f"{rsp.url} - {rsp.status_code} - {rsp.body}")

'''
user = {
  "username": "test_user",
  "password": "password",
  "email": "",
  "first_name": "",
  "last_name": "",
  "is_active": True,
  "is_staff": False
}
rsp = orc_api.account.create(**opts, body=user)
print(f"{rsp.status_code} - {rsp.body}")

rsp = orc_api.account.destroy("test_user", **opts)
print(f"{rsp.status_code} - {rsp.body}")
'''
print('')

print('Actuator Endpoints')
rsp = orc_api.actuator.info(**opts)
print(f"{rsp.url} - {rsp.status_code} - {rsp.body}")
print('')

print('Command Endpoints')
rsp = orc_api.command.info(**opts)
print(f"{rsp.url} - {rsp.status_code} - {rsp.body}")
print('')

print('Device Endpoints')
rsp = orc_api.actuator.info(**opts)
print(f"{rsp.url} - {rsp.status_code} - {rsp.body}")
print('')

print('Log Endpoints')
print('')
