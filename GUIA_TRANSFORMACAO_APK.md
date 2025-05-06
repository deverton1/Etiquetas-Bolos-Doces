# Guia para Transformação em Aplicativo Android (APK)

Este documento descreve o processo para converter o Sistema de Etiquetas DOCES MARA em um aplicativo Android nativo (APK).

## Por que transformar em um aplicativo?

Converter a aplicação web em um aplicativo nativo oferece várias vantagens:

1. **Funcionamento offline:** O aplicativo funcionará mesmo sem internet
2. **Instalação simplificada:** Um único arquivo APK para instalar
3. **Melhor integração com impressoras:** Acesso direto às impressoras Bluetooth/USB
4. **Experiência mais nativa:** Interface otimizada para dispositivos móveis
5. **Armazenamento local:** Dados armazenados diretamente no dispositivo

## Abordagem Recomendada: Capacitor.js

O [Capacitor](https://capacitorjs.com/) é um framework que permite transformar aplicações web em aplicativos nativos com mínimas alterações no código existente.

### Vantagens do Capacitor:

- Mantém a maior parte do código atual intacto
- Acesso a recursos nativos do dispositivo (impressoras, câmera, etc.)
- Boa documentação e comunidade ativa
- Suporte para banco de dados local
- Atualizações simplificadas

## Etapas para Transformação

### 1. Preparação do Projeto

Instale o Capacitor e inicialize o projeto:

```bash
# Instalar Capacitor CLI e dependências básicas
npm install @capacitor/core @capacitor/android
npx cap init EtiquetasDocesMara io.doces.mara --web-dir=dist

# Modificar o arquivo capacitor.config.ts para configurar o app
```

### 2. Adaptação do Backend

Modifique a aplicação para usar um banco de dados local:

```bash
# Instalar plugin de SQLite
npm install @capacitor-community/sqlite

# Adicione inicialização do banco no main.ts
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const initDatabase = async () => {
  if (Capacitor.isNativePlatform()) {
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    await sqlite.createConnection('docesmara_db');
    await sqlite.open();
    // Inicializar tabelas...
  }
};
```

### 3. Adaptação da Interface

Ajuste a interface para funcionar melhor em dispositivos móveis:

- Melhorar o layout responsivo
- Implementar gestos para facilitar a navegação
- Garantir funcionamento em telas menores

### 4. Integração com Impressoras

Adicione suporte para impressoras Bluetooth/USB:

```bash
# Instalar plugin para Bluetooth
npm install @capacitor-community/bluetooth-le

# Para impressoras USB
npm install @rdlabo/capacitor-usb-serial
```

Implemente o código para descoberta e conexão com impressoras:

```typescript
// Exemplo simplificado para impressão via Bluetooth
const connectPrinter = async (deviceId) => {
  await BluetoothLe.connect({
    deviceId: deviceId,
  });
  
  // Código para enviar dados para a impressora
  await BluetoothLe.write({
    deviceId: deviceId,
    service: 'printer_service_uuid',
    characteristic: 'printer_characteristic_uuid',
    value: encodedPrintData
  });
};
```

### 5. Banco de Dados Local

Modifique o sistema para usar SQLite localmente:

```typescript
// Exemplo de serviço para acesso aos dados
export class EtiquetaService {
  async getEtiquetas() {
    const db = await this.getConnection();
    return db.query('SELECT * FROM etiquetas');
  }
  
  async saveEtiqueta(etiqueta) {
    const db = await this.getConnection();
    // Código para salvar no SQLite...
  }
  
  private async getConnection() {
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    const connection = await sqlite.createConnection('docesmara_db');
    await connection.open();
    return connection;
  }
}
```

### 6. Recursos Offline

Implemente funcionalidades para trabalhar offline:

- Armazenamento local de todas as etiquetas
- Fila de impressão para quando a impressora estiver indisponível
- Indicadores de estado de conexão

### 7. Build e Empacotamento

Gere o APK final:

```bash
# Construir o projeto para produção
npm run build

# Adicionar plataforma Android
npx cap add android

# Copiar arquivos e abrir no Android Studio
npx cap copy android
npx cap open android
```

No Android Studio:
1. Configure ícones, splash screen e configurações do app
2. Gere o APK assinado em Build > Generate Signed Bundle / APK
3. Escolha APK e siga as instruções para criar uma chave de assinatura

## Requisitos de Hardware

Para usar o aplicativo em ambiente de produção:

- **Dispositivo Android:** Tablet ou smartphone com Android 8.0+
- **Memória:** Mínimo 3GB RAM recomendado
- **Armazenamento:** 500MB livres para o aplicativo e dados
- **Impressora:** Impressora térmica com suporte Bluetooth ou USB

## Tempo e Recursos Estimados

Para implementar esta transformação:

- **Tempo estimado:** 2-3 semanas
- **Equipe recomendada:** 1 desenvolvedor com experiência em Capacitor/Ionic
- **Testes necessários:** Compatibilidade com diversos dispositivos Android e modelos de impressoras

## Manutenção e Atualizações

Após o lançamento do aplicativo:

- Atualizações podem ser feitas através da Play Store ou distribuindo o APK diretamente
- Considere um sistema de verificação de versão para notificar sobre atualizações
- Implemente telemetria para identificar problemas comuns no uso do aplicativo

## Próximos Passos

1. Definir requisitos específicos para o aplicativo móvel
2. Selecionar os modelos de impressoras que serão suportados
3. Implementar um protótipo inicial com Capacitor
4. Testar com usuários reais em ambiente controlado
5. Realizar ajustes finais baseados no feedback
6. Gerar APK para produção e distribuir