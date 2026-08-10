import { identity, zeros } from 'mathjs'

export function getInitialState(order: number) {
  return {
    x: zeros(order, 1) as number[][],
    P: identity(order) as number[][],
    t: -Date.now() / 1000,
  }
}
