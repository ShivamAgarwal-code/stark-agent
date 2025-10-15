import React, { useState } from "react";
import { Button } from "../../../ui/button";
import sample from "./sample";
import axios from "axios";
import DeploymentPage from "@/pages/deploy";

interface DeploymentResponse {
  success: boolean;
  contractAddress?: string;
  classHash?: string;
  transactionHash?: string;
  error?: string;
  details?: string;
}

export default function ContractCode({
  sourceCode,
  setSourceCode,
  setDisplayState,
}) {
  const [editable, setEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<DeploymentResponse | null>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`,
    ]);
  };

  const handleDeploy = async () => {
    setIsLoading(true);
    setResult(null);
    setLogs([]);
    addLog("Starting deployment process...");

    try {
      addLog("Compiling and deploying contract...");
      
      const response = await fetch("/api/deploy-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractName: "contract_contract" }),
      });
      console.log("hit");

      const data: DeploymentResponse = await response.json();
      setResult(data);

      if (data.success) {
        addLog("✅ Deployment successful!");
      } else {
        addLog(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      addLog(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setResult({
        success: false,
        error: "Deployment failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-black text-2xl font-bold">Contract Code</div>
      <div
        className={`text-black h-[90%] overflow-y-auto mt-1 custom-scrollbar pl-2 border-4 border-black rounded-e-xl ${
          editable ? "bg-yellow-200" : "bg-yellow-100"
        }`}
      >
        <pre>
          <code
            contentEditable={editable}
            spellCheck="false"
            style={{
              outline: "none",
              border: "none",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              padding: "0",
            }}
            suppressContentEditableWarning={true}
          >
            {sample}
          </code>
        </pre>
      </div>
      <div className="flex gap-10 mt-2">
        {!editable && (
          <Button className="" onClick={handleDeploy}>
            Deploy
          </Button>
        )}
        {!editable && (
          <Button className="" onClick={() => setEditable(true)}>
            Edit
          </Button>
        )}
        {editable && (
          <Button className="" onClick={() => setEditable(false)}>
            Save
          </Button>
        )}
      </div>
    </>
  );
}
