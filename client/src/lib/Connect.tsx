'use client'

import * as React from "react"
import Image from "next/image"
import { Connector, useConnect, useDisconnect } from "@starknet-react/core"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Wallet, X } from 'lucide-react'
import { motion } from "framer-motion"

const imageLoader = ({ src }: { src: string }) => src

interface WalletButtonProps {
  name: string
  alt: string
  src: string
  connector: Connector
}

const WalletButton: React.FC<WalletButtonProps> = ({ name, alt, src, connector }) => {
  const { connect } = useConnect()
  const isSvg = src?.startsWith("<svg")

  const handleConnectWallet = () => {
    connect({ connector })
    localStorage.setItem("lastUsedConnector", connector.name)
  }

  return (
    <motion.button
      className="bg-white hover:bg-gray-50 rounded-xl p-4 flex items-center space-x-4 w-full
                 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow
                 transition-all duration-200 group relative overflow-hidden"
      onClick={handleConnectWallet}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative z-10 flex items-center w-full">
        <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
          {isSvg ? (
            <div
              className="h-8 w-8"
              dangerouslySetInnerHTML={{ __html: src ?? "" }}
            />
          ) : (
            <Image
              alt={alt}
              loader={imageLoader}
              unoptimized
              src={src}
              width={40}
              height={40}
              className="h-8 w-8 object-contain"
            />
          )}
        </div>
        <div className="ml-4 flex-1">
          <span className="font-medium text-gray-900">{name}</span>
          <p className="text-sm text-gray-500">Connect with {name}</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </motion.button>
  )
}

const ConnectModal: React.FC = () => {
  const { connectors } = useConnect()

  const filteredConnectors = connectors.filter((connector) =>
    connector.name.toLowerCase()
  )

  return (
    <DialogContent className="sm:max-w-[600px] bg-white p-6">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-semibold text-gray-900">
          Connect Your Wallet
        </DialogTitle>
        <p className="text-gray-500 mt-2">
          Choose your preferred wallet to connect to our platform
        </p>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-4">
        {filteredConnectors.map((connector, index) => (
          <WalletButton
            key={connector.id || index}
            src={typeof connector.icon === 'object' ? connector.icon.light : connector.icon}
            name={connector.name}
            connector={connector}
            alt={`${connector.name} icon`}
          />
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500 text-center">
          New to blockchain wallets?{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Learn more about wallets
          </a>
        </p>
      </div>
    </DialogContent>
  )
}

interface ConnectButtonProps {
  text?: string
  className?: string
}

const ConnectButton: React.FC<ConnectButtonProps> = ({
  text = "Connect Wallet",
  className = "",
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={`bg-blue-600 hover:bg-blue-700 text-white font-medium ${className}`}>
          <Wallet className="mr-2 h-4 w-4" />
          {text}
        </Button>
      </DialogTrigger>
      <ConnectModal />
    </Dialog>
  )
}

const DisconnectButton: React.FC = () => {
  const { disconnect } = useDisconnect({})
  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDisconnect}
      className="text-red-600 border-red-600 hover:bg-red-50 transition-colors duration-200"
    >
      <X className="h-4 w-4 mr-2" />
      Disconnect
    </Button>
  )
}

export { ConnectButton, DisconnectButton }