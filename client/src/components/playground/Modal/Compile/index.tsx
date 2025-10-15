import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Credenza,
    CredenzaBody,
    CredenzaContent,
} from "@/components/credeza"
import GenerateCode from './GenerateCode';
import ContractCode from './ContractCode';

type displayComponentProps = "generate" | "contract";

interface CompileProps {
  nodes: unknown;
  edges: unknown;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  flowSummary: Array<{ content: string; id: string }>;
}

export default function Compile({ nodes, edges, isOpen, onOpenChange, flowSummary }: CompileProps) {
    const [displayState, setDisplayState] = useState<displayComponentProps>("generate")
    const [sourceCode, setSourceCode] = useState("");

    const handleDisplayStateChange = (state: string) => {
        setDisplayState(state as displayComponentProps);
    };

    return (
        <>
            <Button
                onClick={() => onOpenChange(true)}
                className="bg-[#322131] hover:bg-[#21173E] text-white hoverEffect"
            >
                Generate
            </Button>
            <Credenza open={isOpen} onOpenChange={onOpenChange}>
                <CredenzaContent className={`border-white/10 bg-[#faf3dd] max-w-[100vh] ${displayState === "generate" && 'w-[60vh]'} `}>
                    <CredenzaBody className='max-h-[84vh] max-w-[95vh] p-5'>
                        {displayState === "generate" && <GenerateCode setSourceCode={setSourceCode} nodes={nodes} edges={edges} flowSummary={flowSummary} setDisplayState={handleDisplayStateChange} />}

                        {displayState === "contract" && <ContractCode setDisplayState={handleDisplayStateChange} sourceCode={sourceCode} setSourceCode={setSourceCode} nodes={nodes} edges={edges} flowSummary={flowSummary} />}
                    </CredenzaBody>
                </CredenzaContent>
            </Credenza>
        </>
    )
}
