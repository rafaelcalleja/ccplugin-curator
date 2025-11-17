# ccplugin-curator

TUI interactivo para curar y combinar componentes de plugins Claude Code.

## 🎯 Características

- **TUI de 3 paneles** con Ink (React for CLIs)
- **Selección interactiva** de componentes con checkboxes
- **Preview en tiempo real** del plugin resultante
- **Resolución automática de conflictos** con namespace prefix
- **Generación de múltiples formatos**:
  - Marketplace JSON para instalación
  - Plugin oficial para Claude Code
  - Formato normalizado para debugging

## 📦 Instalación

```bash
npm install
npm run build
```

## 🚀 Uso

```bash
# Seleccionar componentes de un plugin
npm start <plugin-directory>

# Ejemplo
npm start test-fixtures/test-plugin
```

## ⌨️ Controles del TUI

| Tecla | Acción |
|-------|--------|
| `↑` `↓` | Navegar componentes |
| `←` `→` | Cambiar entre paneles |
| `SPACE` | Marcar/desmarcar componente |
| `A` | Seleccionar todos |
| `N` | Deseleccionar todos |
| `S` | Guardar selección |
| `Q` | Salir |

## 📐 Arquitectura

### Transformaciones

El sistema implementa transformaciones bidireccionales:

- **normalize()**: Formato oficial → Formato normalizado interno
  - Expansión de globs (`commands/**/*.md`)
  - Auto-discovery de skills (`skills/*/SKILL.md`)
  - Flattening de hooks y MCPs

- **officialize()**: Formato normalizado → Formato oficial
  - Agrupación de hooks por evento
  - Conversión de arrays a objetos
  - Omisión de valores default

### Resolución de Conflictos

Cuando se seleccionan componentes con nombres duplicados de múltiples plugins:

```
plugin-a/commands/build.md  →  curated-plugin/commands/plugin-a--build.md
plugin-b/commands/build.md  →  curated-plugin/commands/plugin-b--build.md
```

Los hooks del mismo evento se fusionan automáticamente.

## 📁 Estructura de Salida

```
output/curated-plugin/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace config
├── plugins/
│   └── curated-plugin/
│       ├── .claude-plugin/
│       │   └── plugin.json       # Plugin oficial (usar en Claude Code)
│       ├── commands/
│       ├── agents/
│       └── skills/
└── normalized-plugin.json        # Formato interno (debugging)
```

## 🔧 Instalación del Plugin Curado

```bash
/plugin marketplace add ./output/curated-plugin
/plugin install curated-plugin
```

## 🧪 Tests

```bash
# Ejecutar tests de integración
npm test

# Con coverage
npm test -- --coverage
```

Los tests verifican:
- ✅ Cantidades exactas de componentes (3 commands, 2 agents, 3 skills, 4 hooks, 3 MCPs)
- ✅ Transformaciones bidireccionales preservan datos
- ✅ Formato oficial es válido
- ✅ Resolución de conflictos funciona correctamente

## 📚 Especificaciones

Toda la documentación técnica está en `docs/spec/`:

- `001-normalization-protocol.md` - Formato normalizado interno
- `002-plugin-format-spec.md` - Formato oficial Claude Code
- `003-tui-visual-spec.md` - Especificación visual del TUI
- `004-user-workflows.md` - Flujos de usuario (BDD)
- `005-transformation-rules.md` - Reglas oficial → normalizado
- `006-reverse-transformation-rules.md` - Reglas normalizado → oficial
- `007-save-operation-rules.md` - Operación de guardado
- `008-integration-test-spec.md` - Tests de integración

## 🏗️ Decisiones Técnicas

Ver `docs/decisions/` para decisiones de implementación:

- `001-json-schema-to-typescript.md` - Generación de tipos desde schemas

## 🛠️ Desarrollo

```bash
# Generar tipos desde schemas
npm run generate-types

# Compilar
npm run build

# Modo desarrollo
npm run dev

# Ejecutar tests en watch mode
npm test
```

## 📄 Licencia

MIT
