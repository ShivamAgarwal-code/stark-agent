import { NextApiRequest, NextApiResponse } from 'next';
import { ContractFactory, ethers } from 'ethers';
import { promises as fs } from 'fs';
import path from 'path';
import solc from 'solc';
import { createPublicClient, http, createWalletClient } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from 'viem/accounts'
import { type Abi } from 'viem';

interface CompilationResult {
  success: boolean;
  bytecode?: string;
  abi?: any;
  error?: string;
  details?: string;
}

function getContractPath(...paths: string[]): string {
  return path.join(process.cwd(),'contracts-sol', ...paths);
}
async function validateContract(filePath: string): Promise<{ valid: boolean; error?: string }> {
  try {
    await fs.access(filePath);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: `Contract file not found at ${filePath}`
    };
  }
}

async function compileSolidity(source: string, contractName: string): Promise<CompilationResult> {
  try {
    const input = {
      language: 'Solidity',
      sources: {
        'contract.sol': {  // Using a generic name in the compiler
          content: source,
        },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*'],
          },
        },
      },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for compilation errors
    if (output.errors?.some((error: any) => error.severity === 'error')) {
      throw new Error('Compilation errors: ' + output.errors.map((e: any) => e.message).join('\n'));
    }

    // Use the provided contract name instead of hardcoding "ContractDemo"
    const contract = output.contracts['contract.sol'][contractName];
    if (!contract) {
      throw new Error(`Contract ${contractName} not found in compilation output`);
    }

    const bytecode = contract.evm.bytecode.object;
    const abi = contract.abi;

    if (!bytecode || !abi) {
      throw new Error('Contract compilation output is invalid');
    }

    return {
      success: true,
      bytecode,
      abi,
    };

  } catch (error) {
    console.error('Compilation error:', error);
    return {
      success: false,
      error: 'Compilation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
async function deployContract(abi: Abi, bytecode: string):Promise<string> {
  const client = createWalletClient({
    chain: baseSepolia,
    transport: http("https://base-sepolia.g.alchemy.com/v2/zYiCO7uc1H-R9dzcwJN7ryMTs01QlGid"),
  });
  
  const account = privateKeyToAccount('0x2ab4cfa4376ce9a4a8bd91e5d7ce58d9afa9a551aa80167474b2a4c42233f643')
  const hash = await client.deployContract({
    abi,
    account,
    bytecode: `0x${bytecode}`,
  })
  return hash;
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CompilationResult>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { contractName, fileName } = req.body;

    if (!contractName) {
      return res.status(400).json({
        success: false,
        error: 'Missing parameters',
        details: 'contractName is required'
      });
    }

    // Use fileName if provided, otherwise default to contractName
    const solFileName = `${fileName || contractName}.sol`;
    const filePath = getContractPath(solFileName);

    // Validate contract file existence
    const validation = await validateContract(filePath);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Contract validation failed',
        details: validation.error
      });
    }

    // Read contract source
    console.log('Reading contract source...');
    const source = await fs.readFile(filePath, 'utf8');

    // Compile contract
    console.log('Compiling contract...');
    const compilation = await compileSolidity(source, contractName);
    if (!compilation.success || !compilation.bytecode) {
      return res.status(500).json(compilation);
    }

    const deployment = await deployContract(compilation.abi, compilation.bytecode);
   
    console.log('Compilation successful!');
    console.log('Deployment successful!');
    console.log('Deployment hash:', deployment);
    return res.status(200).json(compilation);

  } catch (error) {
    console.error('Contract compilation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Contract compilation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};