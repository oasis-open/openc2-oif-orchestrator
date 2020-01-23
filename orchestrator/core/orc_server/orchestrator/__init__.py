import sys

if sys.version_info < (3, 6):
    print('PythonVersionError: Minimum version of v3.6+ not found')
    exit(1)

default_app_config = 'orchestrator.apps.OrchestratorConfig'
