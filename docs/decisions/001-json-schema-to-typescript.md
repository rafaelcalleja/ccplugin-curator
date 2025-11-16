# 001 - Generación de Tipos TypeScript

**Decisión**: Usar `json-schema-to-typescript` para generar tipos automáticamente desde JSON Schemas.

**Por qué**: Los schemas (`schemas/*.schema.json`) son la fuente de verdad. Los tipos se regeneran cuando cambian los schemas.

**Uso**:
```bash
npm install -D json-schema-to-typescript

# Generar tipos
npx json-schema-to-typescript schemas/plugin.schema.json -o src/types/plugin.ts
npx json-schema-to-typescript schemas/normalized-plugin.schema.json -o src/types/normalized.ts
```

**Agregar a package.json**:
```json
{
  "scripts": {
    "generate-types": "json-schema-to-typescript schemas/plugin.schema.json -o src/types/plugin.ts && json-schema-to-typescript schemas/normalized-plugin.schema.json -o src/types/normalized.ts"
  }
}
```
