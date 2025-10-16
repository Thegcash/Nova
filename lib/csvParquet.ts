/**
 * CSV and Parquet conversion helpers
 * Server-side only
 */

import { format } from '@fast-csv/format';
import { ParquetSchema, ParquetWriter } from 'parquetjs-lite';

/**
 * Convert array of objects to CSV buffer
 */
export async function toCSVBuffer(rows: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    const csvStream = format({ headers: true });
    
    csvStream.on('data', (chunk: Buffer) => chunks.push(chunk));
    csvStream.on('error', reject);
    csvStream.on('end', () => resolve(Buffer.concat(chunks)));
    
    // Write rows
    if (rows.length === 0) {
      // For empty data, just write headers if we have a schema
      csvStream.end();
    } else {
      rows.forEach(row => csvStream.write(row));
      csvStream.end();
    }
  });
}

/**
 * Convert array of objects to Parquet buffer
 * Derives schema from first row
 */
export async function toParquetBuffer(rows: any[]): Promise<Buffer> {
  // Handle empty data
  if (!rows || rows.length === 0) {
    // Create minimal schema with a dummy field
    const schema = new ParquetSchema({
      _empty: { type: 'UTF8', optional: true },
    });
    
    const chunks: Buffer[] = [];
    const writer = await ParquetWriter.openStream(schema, {
      write: (chunk: Buffer) => chunks.push(chunk),
      end: () => {},
    } as any);
    
    await writer.close();
    return Buffer.concat(chunks);
  }

  // Derive schema from first row
  const schemaFields: any = {};
  const firstRow = rows[0];
  
  for (const key of Object.keys(firstRow)) {
    const value = firstRow[key];
    const valueType = typeof value;
    
    if (valueType === 'number') {
      // Check if integer or float
      schemaFields[key] = { 
        type: Number.isInteger(value) ? 'INT64' : 'DOUBLE',
        optional: true 
      };
    } else if (valueType === 'boolean') {
      schemaFields[key] = { type: 'BOOLEAN', optional: true };
    } else if (value instanceof Date) {
      schemaFields[key] = { type: 'TIMESTAMP_MILLIS', optional: true };
    } else {
      // Default to string
      schemaFields[key] = { type: 'UTF8', optional: true };
    }
  }

  const schema = new ParquetSchema(schemaFields);
  
  // Write to buffer
  const chunks: Buffer[] = [];
  const writer = await ParquetWriter.openStream(schema, {
    write: (chunk: Buffer) => chunks.push(chunk),
    end: () => {},
  } as any);

  // Write rows
  for (const row of rows) {
    // Convert values to appropriate types
    const typedRow: any = {};
    for (const key of Object.keys(schemaFields)) {
      const value = row[key];
      if (value === null || value === undefined) {
        typedRow[key] = null;
      } else if (schemaFields[key].type === 'INT64') {
        typedRow[key] = BigInt(Math.floor(Number(value)));
      } else if (schemaFields[key].type === 'DOUBLE') {
        typedRow[key] = Number(value);
      } else if (schemaFields[key].type === 'BOOLEAN') {
        typedRow[key] = Boolean(value);
      } else if (schemaFields[key].type === 'TIMESTAMP_MILLIS') {
        typedRow[key] = value instanceof Date ? value : new Date(value);
      } else {
        typedRow[key] = String(value);
      }
    }
    await writer.appendRow(typedRow);
  }

  await writer.close();
  return Buffer.concat(chunks);
}


