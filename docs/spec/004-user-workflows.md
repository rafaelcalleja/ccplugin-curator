# User Workflows (BDD)

Flujos de usuario definidos con Behavior-Driven Development.

---

## Comandos

### Modo Interactivo (Recomendado)

```bash
app
```

Lanza la aplicación en modo interactivo mostrando el menú principal y formulario de configuración.

### Modo Directo

```bash
app select <plugin-folder>
```

**Ejemplo:**
```bash
app select ~/.claude/plugins
```

Salta directamente al TUI de selección de componentes (usa configuración por defecto).

---

## Workflow de Setup Inicial

```gherkin
Feature: Configurar plugin curado desde menú principal
  As a user
  I want to configure my curated plugin metadata
  So that I can proceed to component selection

Scenario: Setup completo desde menú principal
  Given el usuario ejecuta "app" sin argumentos
  When la aplicación inicia
  Then muestra Main Menu con opciones:
    - Create New Curated Plugin
    - Exit

  When el usuario selecciona "Create New Curated Plugin"
  Then muestra Configuration Form con campos:
    | Campo                    | Tipo      | Default               |
    | Marketplace Name         | Required  | my-marketplace        |
    | Plugin Name              | Required  | My Awesome Plugin     |
    | Source Plugin Directory  | Required  | ~/.claude/plugins     |
    | Output Directory         | Optional  | ./output              |
    | Author Email             | Optional  | you@example.com       |

  When el usuario completa los campos requeridos
  And presiona ENTER
  Then la aplicación:
    - Valida campos (marketplace name: lowercase+hyphens, email: format válido)
    - Escanea Source Plugin Directory buscando plugins
    - Muestra "→ Scanning... Found X plugins"
    - Auto-completa Output Directory basándose en Marketplace Name
  And transforma a TUI de selección de componentes (3 paneles)

Scenario: Validación de campos en Configuration Form
  Given el usuario está en Configuration Form
  When el usuario escribe en "Marketplace Name" con caracteres inválidos
  Then muestra error: "✗ Only lowercase, numbers, hyphens allowed (3-50 chars)"
  And no permite continuar hasta corregir

  When el usuario escribe email inválido en "Author Email"
  Then muestra error: "✗ Invalid email format"

  When el usuario escribe directorio que no existe en "Source Plugin Directory"
  Then muestra error: "✗ Directory does not exist"
  And no permite continuar

Scenario: Cancelar desde Configuration Form
  Given el usuario está en Configuration Form
  When presiona ESC
  Then retorna a Main Menu

  When el usuario está en Main Menu
  And presiona ESC o selecciona "Exit"
  Then la aplicación cierra

Scenario: Source directory sin plugins
  Given el usuario completa Configuration Form
  But el Source Plugin Directory no contiene plugins
  When presiona ENTER
  Then muestra error: "✗ No plugins found in directory"
  And retorna al formulario para corregir path
```

---

## Workflow Principal

```gherkin
Feature: Seleccionar componentes de plugins

Scenario: Usuario selecciona componentes (desde setup)
  Given el usuario completó Configuration Form
  And la aplicación escaneó Source Plugin Directory
  When el usuario presiona ENTER en Configuration Form
  Then la aplicación muestra TUI con 3 paneles:
    - Panel izquierdo: lista de plugins encontrados
    - Panel central: componentes del plugin seleccionado
    - Panel derecho: preview JSON de la selección

  When el usuario navega con flechas ↑↓
  And presiona SPACE para marcar/desmarcar componentes
  Then el panel derecho actualiza el preview en tiempo real

  When el usuario presiona S (Save)
  Then la aplicación guarda la selección usando configuración del setup

  When el usuario presiona Q (Quit)
  Then la aplicación cierra

Scenario: Usuario usa modo directo
  Given el usuario tiene plugins en "./plugins"
  When ejecuta "app select ./plugins"
  Then la aplicación:
    - Salta setup screens
    - Usa configuración por defecto (marketplace name: "my-marketplace", output: "./output")
    - Escanea "./plugins"
    - Muestra TUI directamente con plugins encontrados
```

---

## Flujos Detallados

### 1. Inicio

```gherkin
Scenario: Inicio desde modo interactivo
  Given el usuario ejecuta "app" sin argumentos
  When la app inicia
  Then muestra Main Menu → Configuration Form → TUI
  (Ver "Workflow de Setup Inicial" para detalles)

Scenario: Inicio desde modo directo
  Given el usuario ejecuta "app select ./plugins"
  When la app inicia
  Then:
    - Escanea "./plugins" buscando directorios con ".claude-plugin/plugin.json"
    - Para cada plugin encontrado:
      - Lee plugin.json
      - Ejecuta auto-discovery (commands/, agents/, skills/, hooks/, .mcp.json)
      - Transforma a formato normalizado (según 001-normalization-protocol.md)
    - Muestra TUI directamente con primer plugin auto-seleccionado
```

### 2. Navegación

```gherkin
Scenario: Navegar entre plugins
  Given la TUI está mostrando plugins
  When el usuario está en panel izquierdo (PLUGINS)
  And presiona ↑ o ↓
  Then cambia el plugin seleccionado
  And el panel central actualiza mostrando componentes del nuevo plugin

Scenario: Navegar entre paneles
  Given la TUI está visible
  When el usuario presiona → (derecha)
  Then el foco cambia: PLUGINS → COMPONENTS → PREVIEW
  When el usuario presiona ← (izquierda)
  Then el foco cambia: PREVIEW → COMPONENTS → PLUGINS
```

### 3. Selección

```gherkin
Scenario: Seleccionar componentes
  Given el usuario está en panel COMPONENTS
  And el foco está en un componente (comando, agent, hook, mcp, skill)
  When presiona SPACE
  Then el checkbox cambia [ ] ↔ [✓]
  And el panel PREVIEW actualiza mostrando el componente agregado/removido

Scenario: Seleccionar de múltiples plugins
  Given el usuario seleccionó componentes del plugin A
  When navega al plugin B
  And selecciona componentes del plugin B
  Then ambas selecciones se mantienen
  And el preview muestra todos los componentes seleccionados de todos los plugins
```

### 4. Guardar

```gherkin
Scenario: Guardar selección
  Given el usuario tiene componentes seleccionados
  When presiona S (Save)
  Then genera:
    - .claude-plugin/marketplace.json (marketplace)
    - plugins/curated-plugin/ (plugin con componentes, incluye formato oficial .claude-plugin/plugin.json)
    - normalized-plugin.json (normalizado)
  And copia archivos de componentes seleccionados a plugins/curated-plugin/
  And guarda en "./output/curated-plugin/" (o path configurable)
  And muestra mensaje de éxito con instrucciones de instalación
  And la TUI permanece abierta

Scenario: Guardar sin selección
  Given el usuario NO tiene componentes seleccionados
  When presiona S (Save)
  Then muestra advertencia: "No hay componentes seleccionados"
  And NO guarda nada
```

### 5. Conflictos Multi-Plugin

```gherkin
Scenario: Conflicto de nombres de comandos
  Given plugin-a tiene "commands/build.md"
  And plugin-b tiene "commands/build.md"
  When selecciono ambos comandos
  And presiono S (Save)
  Then ambos archivos se copian con namespace prefix:
    - commands/plugin-a--build.md
    - commands/plugin-b--build.md
  And plugin.json lista ambos con prefix

Scenario: Conflicto de nombres de agentes
  Given plugin-a tiene "agents/reviewer.md"
  And plugin-b tiene "agents/reviewer.md"
  When selecciono ambos agentes
  And presiono S (Save)
  Then ambos archivos se copian con namespace prefix:
    - agents/plugin-a--reviewer.md
    - agents/plugin-b--reviewer.md

Scenario: Conflicto de nombres de MCPs
  Given plugin-a tiene MCP "tavily" con config A
  And plugin-b tiene MCP "tavily" con config B
  When selecciono ambos MCPs
  And presiono S (Save)
  Then plugin.json contiene ambos con prefix:
    - "plugin-a--tavily": { config A }
    - "plugin-b--tavily": { config B }

Scenario: Conflicto de directorios de skills
  Given plugin-a tiene "skills/chrome-devtools/"
  And plugin-b tiene "skills/chrome-devtools/"
  When selecciono ambos skills
  And presiono S (Save)
  Then ambos directorios se copian con namespace prefix:
    - skills/plugin-a--chrome-devtools/
    - skills/plugin-b--chrome-devtools/

Scenario: Merge de hooks del mismo evento
  Given plugin-a tiene hook SessionStart → /setup-a.sh
  And plugin-b tiene hook SessionStart → /setup-b.sh
  When selecciono ambos hooks
  And presiono S (Save)
  Then plugin.json mergea automáticamente:
    "SessionStart": [
      { "hooks": [
        { "command": "${CLAUDE_PLUGIN_ROOT}/setup-a.sh" },
        { "command": "${CLAUDE_PLUGIN_ROOT}/setup-b.sh" }
      ] }
    ]
  And el orden preserva el orden de selección en TUI

Scenario: Conflicto de nombres de hook scripts
  Given plugin-a tiene hook SessionStart → hooks/setup.sh
  And plugin-b tiene hook SessionStart → hooks/setup.sh
  When selecciono ambos hooks
  And presiono S (Save)
  Then ambos scripts se copian con namespace prefix:
    - hooks/plugin-a--setup.sh
    - hooks/plugin-b--setup.sh
  And plugin.json contiene paths con namespace:
    "SessionStart": [
      { "hooks": [
        { "command": "${CLAUDE_PLUGIN_ROOT}/hooks/plugin-a--setup.sh" },
        { "command": "${CLAUDE_PLUGIN_ROOT}/hooks/plugin-b--setup.sh" }
      ] }
    ]
  And ambos scripts tienen permisos ejecutables (chmod +x)
```

### 6. Salir

```gherkin
Scenario: Salir de la aplicación
  Given la TUI está abierta
  When el usuario presiona Q (Quit)
  Then la aplicación cierra inmediatamente
  And NO pregunta por cambios sin guardar (simpleza)
```

