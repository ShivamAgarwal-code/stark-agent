import { createAnthropicClient } from './anthropic-client';
import { contractPromptTemplate } from './prompt-generate';
import fs from 'fs/promises';
import path from 'path';

interface ContractGenerationResult {
    [x: string]: unknown;
    success: boolean;
    sourceCode?: string;
    error?: string;
}

export class CairoContractGenerator {
    private model = createAnthropicClient();
    private chain = contractPromptTemplate.pipe(this.model);

    async generateContract(requirements: string): Promise<ContractGenerationResult> {
        // console.log('requirements', requirements);
        
        try {
            const response = await this.chain.invoke({
                requirements
            });            

            // Extract the contract code from the response
            const sourceCode = response.content;

            return {
                success: true,
                sourceCode: sourceCode as string
            };
        } catch (error) {
            console.error('Error generating contract:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async saveContract(sourceCode: string, contractName: string): Promise<string> {
        const contractsDir = path.join(process.cwd(), 'contracts');
        await fs.mkdir(contractsDir, { recursive: true });

        const filePath = path.join(contractsDir, `${contractName}.cairo`);
        await fs.writeFile(filePath, sourceCode);
        return filePath;
    }
}
