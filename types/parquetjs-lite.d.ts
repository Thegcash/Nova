declare module 'parquetjs-lite' {
  export class ParquetSchema {
    constructor(schema: Record<string, any>);
  }

  export class ParquetWriter {
    static openStream(schema: ParquetSchema, outputStream: any): Promise<ParquetWriter>;
    appendRow(row: Record<string, any>): Promise<void>;
    close(): Promise<void>;
  }
}



