import type { NextApiRequest, NextApiResponse } from 'next';
import { CairoContractGenerator } from '../../lib/contract-generator1';

// Export a default function that handles the API route
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { nodes, edges, flowSummary } = req.body;

        const flowSummaryJSON = {
            nodes: nodes,
            edges: edges,
            summary: flowSummary
        };

        const bodyofthecall = JSON.stringify(flowSummaryJSON)
            .replace(/[{}"]/g, '')
            .replace(/:/g, ': ')
            .replace(/,/g, ', ');

            console.log(flowSummaryJSON);
            
        const generator = new CairoContractGenerator();
        const result = await generator.generateContract(bodyofthecall, res);


        await generator.saveContract(result.sourceCode!, 'lib');
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
    }
}