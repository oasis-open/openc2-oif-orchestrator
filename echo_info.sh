#!/usr/bin/env bash

URL=$CI_API_V4_URL/projects/56/

echo "OPENC2_OIF_ORCH_ACCESS_TOKEN = $OPENC2_OIF_ORCH_ACCESS_TOKEN"
echo "CI_COMMIT_REF_NAME           = $CI_COMMIT_REF_NAME"
echo "CI_PROJECT_NAME              = $CI_PROJECT_NAME"
echo "$CI_PROJECT_PATH             = $CI_PROJECT_PATH"
echo "GITLAB_USER_NAME             = $GITLAB_USER_NAME"
echo "GITLAB_USER_EMAIL            = $GITLAB_USER_EMAIL"
echo "FULL URL                     = $URL"
echo "CI_REPOSITORY_URL            = $CI_REPOSITORY_URL"
echo "HII_CA_PUBLIC                = $HII_CA_PUBLIC"
echo "SSH_PRIVATE_KEY              = $SSH_PRIVATE_KEY"