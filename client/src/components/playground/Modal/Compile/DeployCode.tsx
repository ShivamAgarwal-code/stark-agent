import React, { useState } from 'react'
import { Button } from '../../../ui/button'

// interface DeploymentResponse {
//     success: boolean;
//     contractAddress?: string;
//     classHash?: string;
//     transactionHash?: string;
//     error?: string;
//     details?: string;
// }

export default function DeployCode() {
    const [editable, setEditable] = useState(false);
    
    return (
        <>
            <div className='text-black text-2xl font-bold'>Contract Code</div>
            <div
                className={`text-black h-[90%] overflow-y-auto mt-1 custom-scrollbar pl-2 border-4 border-black rounded-e-xl ${editable ? 'bg-yellow-200' : 'bg-yellow-100'}`}>
                <pre>
                    <code
                        contentEditable={editable}
                        spellCheck="false"
                        style={{
                            outline: 'none',
                            border: 'none',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            padding: '0',
                        }}
                        suppressContentEditableWarning={true}>
                            {/* Sample contract code would go here */}
                        </code>
                </pre>
            </div>
            <div className='flex gap-10 mt-2'>
                {!editable && <Button className='' onClick={() => console.log('Deploy clicked')}>Deploy</Button>}
                {!editable && <Button className='' onClick={() => setEditable(true)}>Edit</Button>}
                {editable && <Button className='' onClick={() => setEditable(false)}>Save</Button>}
            </div>
        </>
    );
}