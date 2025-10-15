import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import AllocateNode from './AllocateNode';
import EventNode from './EventNode';
import LiquidityNode from './LiquidityNode';
import StakeNode from './StakeNode';
import SwapNode from './SwapNode';

// Define BlockNode component outside of Web3BlocksComponent
export default function BlockNode({ data, isDragging, id }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const isSelected = id === selectedNode;
  if (data.id === 'swap') {
    return <SwapNode data={data} isConnectable={true} id={''} selected={false} type={''} zIndex={0} xPos={0} yPos={0} dragging={false} />;
  }
  if (data.id === 'stake') {
    return <StakeNode data={data} isConnectable={true} type={''} id={''} selected={false} zIndex={0} xPos={0} yPos={0} dragging={false} />;
  }
  if (data.id === 'liquidity') {
    return <LiquidityNode data={data} isConnectable={true} id={''} selected={false} type={''} zIndex={0} xPos={0} yPos={0} dragging={false} />;
  }
  if (data.id === 'allocate') {
    return <AllocateNode data={data} isConnectable={true} selected={false} type={''} zIndex={0} xPos={0} yPos={0} dragging={false} />;
  }
  if (data.id === 'event') {
    return <EventNode data={data} isConnectable={true} id={''} selected={false} type={''} zIndex={0} xPos={0} yPos={0} dragging={false} />;
  }
  return (
    <div
      className={`${data.color} text-white p-6 rounded-lg shadow-md cursor-pointer select-none
                flex items-center justify-between border-[1px] transition-colors w-[200px] ${isDragging ? 'opacity-70' : ''}
                ${isSelected ? 'border-white shadow-glow' : data.borderColor} ${isSelected ? '' : data.hoverBorderColor} relative`}
    >
      {id !== 'start' && <Handle type="target" position={Position.Top} style={{ background: '#555' }} />}
      <span>{data.content}</span>
      <data.icon className="w-4 h-4" />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};
