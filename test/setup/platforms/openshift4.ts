import { Writable } from 'stream';
import { exec } from 'child-process-promise';
import { accessSync, chmodSync, constants, writeFileSync } from 'fs';
import { platform, tmpdir } from 'os';
import { resolve } from 'path';
import * as needle from 'needle';
import * as kubectl from '../../helpers/kubectl';

const OPENSHIFT_CLI_VERSION = '4.3.0';

export async function setupTester(): Promise<void> {
  const normalisedOsDistro = normalisePlatform(platform());
  await installOpenShiftCli(normalisedOsDistro);
}

export async function createCluster(): Promise<void> {
  throw new Error('Not implemented');
}

export async function deleteCluster(): Promise<void> {
  throw new Error('Not implemented');
}

export async function exportKubeConfig(): Promise<void> {
  const user = process.env['OPENSHIFT_4_USER'];
  const userPassword = process.env['OPENSHIFT_4_PASSWORD'];
  const clusterURL = process.env['OPENSHIFT_4_CLUSTER_URL'];
  // TODO: why insecure?
  const cmd = `./oc login -u ${user} -p ${userPassword} ${clusterURL} --insecure-skip-tls-verify=true --kubeconfig ./kubeconfig`;
  await exec(cmd);
  process.env.KUBECONFIG = './kubeconfig';
}

export async function loadImageInCluster(imageNameAndTag: string): Promise<string> {
  // TODO
  return imageNameAndTag;
}

export async function clean(): Promise<void> {
  await Promise.all([
    kubectl.deleteNamespace('services'),
    kubectl.deleteNamespace('snyk-monitor'),
  ]);
}

async function installOpenShiftCli(osDistro: string): Promise<void> {
  try {
    accessSync(resolve(process.cwd(), 'oc'), constants.R_OK);
  } catch (error) {
    const downloadUrl = `https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/openshift-client-${osDistro}-${OPENSHIFT_CLI_VERSION}.tar.gz`;
    console.log('Downloading OpenShift OC...');
    const response = await needle('get', downloadUrl);
    await extractOpenShiftClient(response.body);
    console.log('OpenShift OC downloaded and installed!');
  }
}

async function extractOpenShiftClient(fileStream: Writable): Promise<void> {
  const tmp = tmpdir();
  const osClientPath = `${tmp}/openshift-client`;
  writeFileSync(osClientPath, fileStream);
  await exec(`tar -xzvf ${osClientPath} -C ${tmp}`);
  await exec(`mv ${tmp}/oc .`);
  chmodSync('oc', 0o755); // rwxr-xr-x
}

function normalisePlatform(platform: string): string {
  if (platform === 'darwin') {
    platform = 'mac';
  }

  return platform;
}
