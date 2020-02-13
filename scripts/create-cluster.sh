#! /bin/bash
set -e

OC_VERSION=v3.11.0
OC_COMMIT=0cbc58b

echo '34.66.203.10 api.crc.testing oauth-openshift.apps-crc.testing' | sudo tee -a /etc/hosts

curl \
  -L \
  https://github.com/openshift/origin/releases/download/${OC_VERSION}/openshift-origin-client-tools-${OC_VERSION}-${OC_COMMIT}-linux-64bit.tar.gz \
  -o oc-client.tar.gz
tar xf oc-client.tar.gz
cd openshift-origin-client-tools-${OC_VERSION}-${OC_COMMIT}-linux-64bit

eval ${LOGIN}

./kubectl get pod --all-namespaces
