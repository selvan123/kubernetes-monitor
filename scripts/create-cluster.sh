#! /bin/bash
set -e

CRC_VERSION=1.5.0
OC_VERSION=v3.11.0
OC_COMMIT=0cbc58b

sudo apt install -y qemu-kvm \
  libvirt-daemon \
  libvirt-daemon-system \
  network-manager

curl \
  https://mirror.openshift.com/pub/openshift-v4/clients/crc/${CRC_VERSION}/crc-linux-amd64.tar.xz \
  -o crc-linux-amd64.tar.xz

tar xf crc-linux-amd64.tar.xz
cd crc-linux-${CRC_VERSION}-amd64

crc setup
crc start 2>&1 > ../output.txt
eval $(crc oc-env)
cd ..

# -------------------------
curl \
  -L \
  https://github.com/openshift/origin/releases/download/${OC_VERSION}/openshift-origin-client-tools-${OC_VERSION}-${OC_COMMIT}-linux-64bit.tar.gz \
  -o oc-client.tar.gz
tar xf oc-client.tar.gz
cd openshift-origin-client-tools-${OC_VERSION}-${OC_COMMIT}-linux-64bit

eval $(grep -io "oc login -u kubeadmin -p [A-Za-z0-9\-]* https://[a-z0-9\:\.]*" output.txt)

kubectl get pod --all-namespaces
