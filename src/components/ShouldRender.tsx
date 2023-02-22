import React from 'react'

type Props = {
  if: unknown
  children: React.ReactNode
}

const ShouldRender: React.FC<Props> = ({ if: condition, children }) => (
  <>{condition ? children : null}</>
)

export default ShouldRender
