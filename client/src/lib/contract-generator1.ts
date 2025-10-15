import path from "path";
import { createAnthropicClient } from "./anthropic-client";
import { contractPromptTemplate } from "./prompt-generate";
import { StringOutputParser } from "@langchain/core/output_parsers";
import fs from "fs/promises";
import { NextApiResponse } from "next";

const parser = new StringOutputParser();

interface ContractGenerationResult {
  [x: string]: unknown;
  success: boolean;
  sourceCode?: string;
  error?: string;
}

export class CairoContractGenerator {
  private model = createAnthropicClient();
  private chain = contractPromptTemplate.pipe(this.model).pipe(parser);

  async generateContract(
    requirements: string,
    res: NextApiResponse
  ): Promise<ContractGenerationResult> {
    try {
      const stream = await this.chain.stream(requirements);
      const chunks = [];
      // let sourceCode = "";
      for await (const chunk of stream) {
        chunks.push(chunk);
        // sourceCode += chunk + " ";
        res.write(chunk);
        // console.log(`${chunk}|`);
      }
      const sourceCode=chunks.join('');
      // console.log("sourceCode", sourceCode);
      
      return {
        success: true,
        sourceCode: sourceCode as string,
      };
    } catch (error) {
      console.error("Error generating contract:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async saveContract(sourceCode: string, contractName: string): Promise<string> {
    const contractsDir = '/home/odinson/Desktop/PersonaStark/contracts/src';
    
    try {
      // console.log(sourceCode);
      
        await fs.mkdir(contractsDir, { recursive: true });
        const filePath = path.join(contractsDir, `${contractName}.cairo`);
        await fs.writeFile(filePath, sourceCode);
        return filePath;
    } catch (error) {
        console.error('Error saving contract:', error);
        throw error;
    }
}
}
