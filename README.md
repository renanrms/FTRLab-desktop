# FTRLab Desktop

Software desktop que integra o FTRLab, sistema de aquisição de dados com a proposta da Física em Tempo Real, voltado para laboratórios didáticos.

Projeto open source para automatização do processo de aquisição, processamento e visualização de dados de experimentos e atividades práticas de ciências.
Funciona em conjunto com dispositivos de sensoriamento, programados com suporte da [biblioteca FTRLab](https://github.com/renanrms/FTR-Lab-Embarcado) para sistemas embarcados.
Incorpora funcionamento plug-and-play, interface intuitiva, dispositivos flexíveis que podem ser combinados em diferentes experiências, visualização de dados em tempo real e exportação em formato CSV para processamentos posteriores.

![FTRLab-capture](https://github.com/renanrms/FTRLab-desktop/assets/34728048/11425ec6-2210-4ce6-9c62-a331a063d33c)

## Desenvolvimento

### Atualização

Para verificar a versão de dependências que vem junto com o electron, utilize o comando a seguir na pasta raiz do repositório. A versão target do chrome precisa ser atualizada no arquivo `electron.vite.config` para corresponder à versão utilizada pelo electron.

```sh
./node_modules/electron/dist/electron
```
