/* eslint-disable @typescript-eslint/no-unused-vars */
// client/scripts/compile-cairo.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';

const execAsync = promisify(exec);

interface CompilationResult {
  success: boolean;
  contracts: string[];
  error?: string;
}

// Helper to get paths in the contracts directory
function getContractsPath(...paths: string[]) {
  return path.join(process.cwd(), '..', 'contract', ...paths);
}

async function compileCairo(): Promise<CompilationResult> {
  try {
    // Check if Scarb is installed
    try {
      await execAsync('scarb --version');
    } catch (error) {
      throw new Error('Scarb is not installed. Please install Scarb first.');
    }

    // Check if Scarb.toml exists in contracts directory
    const scarbPath = getContractsPath('Scarb.toml');
    try {
      await fs.access(scarbPath);
    } catch {
      throw new Error('Scarb.toml not found in contracts directory');
    }

    console.log(chalk.blue('📦 Starting Cairo compilation...'));
    const startTime = Date.now();
    
    // Execute scarb build in the contracts directory
    const { stdout, stderr } = await execAsync('scarb build', {
      cwd: getContractsPath() // Set working directory to contracts folder
    });
    
    if (stderr && !stderr.includes('Finished')) {
      throw new Error(`Compilation error: ${stderr}`);
    }

    // Check target directory for compiled files
    const targetDir = getContractsPath('target', 'dev');
    const files = await fs.readdir(targetDir);
    
    const contractFiles = files.filter(file => 
      file.endsWith('.contract_class.json') || 
      file.endsWith('.compiled_contract_class.json')
    );

    const contracts = [...new Set(
      contractFiles.map(file => 
        file.replace('.contract_class.json', '')
           .replace('.compiled_contract_class.json', '')
      )
    )];

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(chalk.green(`✅ Compilation successful in ${duration}s!`));
    console.log(chalk.blue('📄 Compiled contracts:'));
    contracts.forEach(contract => {
      console.log(chalk.cyan(`   - ${contract}`));
    });

    return {
      success: true,
      contracts
    };

  } catch (error) {
    console.error(chalk.red('❌ Compilation failed:'));
    console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    
    return {
      success: false,
      contracts: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Update the getCompiledCode function to look in the contracts directory
async function getCompiledCode(filename: string) {
  const sierraFilePath = getContractsPath(
    'target',
    'dev',
    `${filename}.contract_class.json`
  );
  const casmFilePath = getContractsPath(
    'target',
    'dev',
    `${filename}.compiled_contract_class.json`
  );

  const code = [sierraFilePath, casmFilePath].map(async (filePath) => {
    const file = await fs.readFile(filePath);
    return JSON.parse(file.toString('ascii'));
  });

  const [sierraCode, casmCode] = await Promise.all(code);

  return {
    sierraCode,
    casmCode,
  };
}

// Validate compilation in the contracts directory
async function validateCompilation(contractName: string): Promise<boolean> {
  const targetDir = getContractsPath('target', 'dev');
  
  try {
    await Promise.all([
      fs.access(path.join(targetDir, `${contractName}.contract_class.json`)),
      fs.access(path.join(targetDir, `${contractName}.compiled_contract_class.json`))
    ]);
    return true;
  } catch {
    return false;
  }
}

// Execute compilation if run directly
if (require.main === module) {
  compileCairo().then(result => {
    if (!result.success) {
      process.exit(1);
    }
  });
}

export { compileCairo, validateCompilation, getCompiledCode };