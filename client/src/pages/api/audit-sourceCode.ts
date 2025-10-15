import type { NextApiRequest, NextApiResponse } from 'next';
import { Anthropic } from '@anthropic-ai/sdk';

type ResponseData = {
    success?: boolean;
    filePath?: string;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-open');

    try {
        const { sourceCode } = req.body;
        const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        // Stream the response
        const stream = await claude.messages.create({
            model: "claude-3-opus-20240229",
            system: getStarknetSystemPrompt(),
            max_tokens: 4096,
            messages: [
                {
                    role: "user",
                    content: `Carefully audit the following Starknet smart contract and provide a STRICTLY FORMATTED JSON response:\n\n${sourceCode}`
                }
            ],
            stream: true
        });

        let fullResponse = '';
        for await (const messageStream of stream) {
            if (messageStream.type === 'content_block_delta') {
                const deltaText = messageStream.delta.text;
                console.log(deltaText);
                fullResponse += deltaText;

                // Send text chunks as SSE (Server-Sent Events)
                res.write(`data: ${JSON.stringify({ chunk: deltaText })}\n\n`);
            }
        }

        // Extract JSON from full response
        const jsonContent = extractJSON(fullResponse);
        let parsedResult;
        try {
            parsedResult = JSON.parse(jsonContent);
        } catch (parseError) {
            console.error("Raw response text:", fullResponse);
            throw new Error(`JSON Parsing Failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }

        const requiredFields = ['contract_name', 'corrected_contract_code'];

        requiredFields.forEach(field => {
            if (!parsedResult[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        });

        // Extract corrected contract code
        // const correctedContractCode = parsedResult.corrected_contract_code;

        // Define file path
        // const filePath = path.join(process.cwd(), '../../contracts/src', `lib.cairo`);

        // Ensure directory exists
        // fs.mkdirSync(path.dirname(filePath), { recursive: true });

        // Write corrected contract code to file
        // fs.writeFileSync(filePath, correctedContractCode);

        // console.log(`Contract saved at: ${filePath}`);

        // // Send final success message
        // res.write(`data: ${JSON.stringify({
        //     type: 'complete',
        //     filePath,
        //     success: true
        // })}\n\n`);

        // Close the stream
        res.end();
    } catch (error) {
        console.error('API error:', error);

        // Send error as SSE
        res.write(`data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        })}\n\n`);

        res.end();
    }
}

function extractJSON(text: string) {
    const codeBlockMatch = text.match(/```json\n([\s\S]*?)```/);
    if (codeBlockMatch) return codeBlockMatch[1].trim();
    const bracketMatch = text.match(/\{[\s\S]*\}/);
    if (bracketMatch) return bracketMatch[0].trim();
    const cleanedText = text
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '');
    return cleanedText;
}

function getStarknetSystemPrompt() {
    return `You are a Starknet Smart Contract security expert. Your task is to audit a smart contract focusing on the following security aspects:

1. Contract Anatomy
- Validate method visibility and access controls
- Check for proper use of decorators
- Ensure appropriate function modifiers

2. State Management
- Verify state mutation safety
- Check for potential reentrancy vulnerabilities
- Validate state update patterns

3. Access Control
- Review authorization mechanisms
- Check for proper role-based access control
- Validate ownership and admin privileges

4. External Calls
- Analyze cross-contract interactions
- Check for potential manipulation in external calls
- Verify gas limits and error handling

5. Asset Management
- Review token transfer mechanisms
- Check for potential overflow/underflow
- Validate balance tracking and updates

6. Cryptographic Operations
- Review signature verification
- Check for randomness generation
- Validate cryptographic primitive usage

7. Economic Vulnerabilities
- Check for potential front-running
- Analyze economic attack surfaces
- Verify economic incentive alignment

Output Format:
{
    contract_name: string,
    audit_date: string,
    security_score: number, // 0-100
    original_contract_code: string,
    corrected_contract_code: string,
    vulnerabilities: [
        {
            category: string,
            severity: 'Low'|'Medium'|'High',
            description: string,
            recommended_fix: string
        }
    ],
    recommended_fixes: string[]
}

IMPORTANT: 
- Provide the FULL corrected contract code, not just code snippets
- Include concrete, implementable code fixes for each vulnerability
- Explain all changes made in the corrected code`;
}