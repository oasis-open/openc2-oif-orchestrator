import multiprocessing

# HTTP Options
host = "0.0.0.0"
port = 8080

# Path Options
base = "/opt"
project_dir = "producer_server"
data_dir = f"{base}/{project_dir}/data/"
project_name = "orchestrator_producer"

# Static Files
check_static = f"{base}/{project_dir}/data/static/"
static_map = f"/static={base}/{project_dir}/data/static/"

# Gunicorn Config
# Server Mechanics
preload = True
chdir = f"{base}/{project_dir}"
user = "django"
group = "django"

# Server Socket
bind = f"{host}:{port}"

# Worker Processes
# TODO: set by env var??
workers = multiprocessing.cpu_count() - 1
threads = multiprocessing.cpu_count() - 1
keepalive = 4
