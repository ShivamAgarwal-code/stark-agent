/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RpcProvider, Account, Contract, json, stark, uint256, shortString } from 'starknet';
import fs from 'fs';
import { getCompiledCode } from './utils1';

// connect provider
const provider = new RpcProvider({ nodeUrl: 'http://127.0.0.1:5050/rpc' });
// connect your account. To adapt to your own account:
const privateKey0 = process.env.OZ_ACCOUNT_PRIVATE_KEY;
if (!privateKey0) {
    throw new Error('OZ_ACCOUNT_PRIVATE_KEY is not defined');
  }
  
const account0Address: string = '0x04819d56cb212133786867668f2b53c80d681c2ddeb9187dffc20de279754dcb';

const {sierraCode, casmCode} = await getCompiledCode("defi");
console.log('✅ Contract files read.',sierraCode,casmCode);


const account0 = new Account(provider, account0Address, privateKey0);

// Declare Test contract in devnet
// const compiledTestSierra = json.parse(
//   fs.readFileSync('./compiledContracts/test.sierra').toString('ascii')
// );
// const compiledTestCasm = json.parse(
//   fs.readFileSync('./compiledContracts/test.casm').toString('ascii')
// );
const declareResponse = await account0.declare({
  contract: sierraCode,
  casm: sierraCode,
});

console.log('Test Contract declared with classHash =', declareResponse.class_hash);
await provider.waitForTransaction(declareResponse.transaction_hash);
console.log('✅ Test Completed.');

const deployResponse = await account0.deployContract({ classHash: declareResponse.class_hash });
await provider.waitForTransaction(deployResponse.transaction_hash);

// read abi of Test contract
const { abi: testAbi } = await provider.getClassByHash(declareResponse.class_hash);
if (testAbi === undefined) {
  throw new Error('no abi.');
}

// Connect the new contract instance:
const myTestContract = new Contract(testAbi, deployResponse.contract_address, provider);
console.log('✅ Test Contract connected at =', myTestContract.address);

