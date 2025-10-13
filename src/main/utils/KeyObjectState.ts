import { copy } from './copy'

// TODO: verificar se existe problema de concorrência com esta classe. Caso positivo implementar trava.
// TODO: verificar possibilidade de uso para remoção.

/**
 * Estado em formato chave-objeto.
 * Esta classe garante que o estado seja alterado apenas através dos métodos da classe, que irão executar ações configuradas.
 */
export class KeyObjectState<V extends {}> {
  private state: { [K: string]: V }
  private onChange: () => void

  constructor({ onChange }: { onChange: (objects: V[]) => void }) {
    this.state = {}
    this.onChange = () => {
      onChange(this.getAll())
    }
  }

  /**
   * Retorna um array com a cópia de cada objeto.
   */
  getAll(): V[] {
    return copy(Object.values(this.state))
  }

  /**
   * Retorna uma cópia do objeto correspondente se existir a chave.
   */
  get(key: string): V | undefined {
    const value = this.state[key]
    if (value) {
      return copy(value)
    } else {
      return undefined
    }
  }

  /**
   * Adiciona/Altera um objeto, mantendo propriedades opcionais que não sejam sobrescritas.
   */
  setObject(key: string, value: V) {
    this.state[key] = { ...this.state[key], ...copy(value) }
    this.onChange()
  }

  /**
   * Altera propriedades do objeto. Lança exceção caso a chave não exista no estado.
   */
  updateObject(key: string, value: Partial<V>) {
    if (this.state[key] === undefined)
      throw Error('A chave não existe no estado.')
    this.state[key] = { ...this.state[key], ...copy(value) }
    this.onChange()
  }
}
