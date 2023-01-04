import { createContext, useEffect, useState } from 'react'



export const PredictionContext = createContext()

export const PredictionProvider = ({ children }) => {
  let connected = true

  return (
    <PredictionContext.Provider
      value={{
        connected
      }}
    >
      {children}
    </PredictionContext.Provider>
  )
}
