import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ArrowRightLeft } from 'lucide-react'

const SwapNode: React.FC<NodeProps> = ({ isConnectable }) => {

    return (
        <div className="bg-[#142321] text-white p-4 rounded-lg shadow-md border-[1px] border-[#245C3D] hover:border-[#6AFB8E] transition-colors w-[250px]">
            <div className="flex items-center justify-between mb-4">
                <span>Start</span>
                <ArrowRightLeft className="w-4 h-4" />
            </div>
            
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
        </div>
    )
}

export default SwapNode
