# Coverage Matrix

This document shows the mapping between requirements, tests, and implementations.

## Legend

- ✅ **Full coverage**: Requirement has complete test and implementation
- ⚠️ **Partial coverage**: Test or implementation incomplete
- ❌ **No coverage**: No test or implementation found

## Matrix

| Requirement ID | Spec Source | Description | Test File | Test Coverage | Impl File | Status |
|----------------|-------------|-------------|-----------|---------------|-----------|--------|
| 001::EdgeCase::1.1 | 001-normalization-protocol:5 | Required Fields | - | ❌ | - | ❌ |
| 001::EdgeCase::1.2 | 001-normalization-protocol:12 | Optional Metadata Fields | - | ❌ | - | ❌ |
| 001::EdgeCase::1.3 | 001-normalization-protocol:24 | Component Path Fields | - | ❌ | - | ❌ |
| 001::EdgeCase::1.4 | 001-normalization-protocol:34 | Path Behavior Rules ⚠️ CRÍTICO | - | ❌ | - | ❌ |
| 002::EdgeCase::1.1 | 002-plugin-format-spec:13 | PluginJson Schema (Claude Code) | - | ❌ | - | ❌ |
| 002::EdgeCase::1.2 | 002-plugin-format-spec:28 | Default Values | - | ❌ | - | ❌ |
| 002::EdgeCase::1.3 | 002-plugin-format-spec:39 | Value Types | - | ❌ | - | ❌ |
| 002::EdgeCase::2.1 | 002-plugin-format-spec:57 | Structure | - | ❌ | - | ❌ |
| 002::EdgeCase::2.2 | 002-plugin-format-spec:78 | Fields | - | ❌ | - | ❌ |
| 002::EdgeCase::2.3 | 002-plugin-format-spec:86 | Events | - | ❌ | - | ❌ |
| 002::EdgeCase::2.4 | 002-plugin-format-spec:98 | Examples | - | ❌ | - | ❌ |
| 004::Scenario::Usuario selecciona componentes | 004-user-workflows:25 | Usuario selecciona componentes | - | ❌ | - | ❌ |
| 004::Scenario::Navegar entre plugins | 004-user-workflows:67 | Navegar entre plugins | - | ❌ | - | ❌ |
| 004::Scenario::Navegar entre paneles | 004-user-workflows:74 | Navegar entre paneles | - | ❌ | - | ❌ |
| 004::Scenario::Seleccionar componentes | 004-user-workflows:85 | Seleccionar componentes | - | ❌ | - | ❌ |
| 004::Scenario::Seleccionar de múltiples plugins | 004-user-workflows:92 | Seleccionar de múltiples plugins | - | ❌ | - | ❌ |
| 004::Scenario::Guardar selección | 004-user-workflows:103 | Guardar selección | - | ❌ | - | ❌ |
| 004::Scenario::Guardar sin selección | 004-user-workflows:115 | Guardar sin selección | - | ❌ | - | ❌ |
| 004::Scenario::Conflicto de nombres de comandos | 004-user-workflows:125 | Conflicto de nombres de comandos | - | ❌ | - | ❌ |
| 004::Scenario::Conflicto de nombres de agentes | 004-user-workflows:135 | Conflicto de nombres de agentes | - | ❌ | - | ❌ |
| 004::Scenario::Conflicto de nombres de MCPs | 004-user-workflows:144 | Conflicto de nombres de MCPs | - | ❌ | - | ❌ |
| 004::Scenario::Conflicto de directorios de skills | 004-user-workflows:153 | Conflicto de directorios de skills | - | ❌ | - | ❌ |
| 004::Scenario::Merge de hooks del mismo evento | 004-user-workflows:162 | Merge de hooks del mismo evento | - | ❌ | - | ❌ |
| 004::Scenario::Salir de la aplicación | 004-user-workflows:180 | Salir de la aplicación | - | ❌ | - | ❌ |
| 005::EdgeCase::2.1 | 005-transformation-rules:26 | Commands/Agents (Paths → Array) | - | ❌ | - | ❌ |
| 005::EdgeCase::2.2 | 005-transformation-rules:52 | Skills (Discovery) | - | ❌ | - | ❌ |
| 005::EdgeCase::2.3 | 005-transformation-rules:69 | Hooks (Nested → Flat Array) | - | ❌ | - | ❌ |
| 005::EdgeCase::2.4 | 005-transformation-rules:150 | MCPs (Object → Array) | - | ❌ | - | ❌ |
| 006::EdgeCase::3.1 | 006-reverse-transformation-rules:44 | Metadata Fields | - | ❌ | - | ❌ |
| 006::EdgeCase::3.2 | 006-reverse-transformation-rules:91 | Author Field | - | ❌ | - | ❌ |
| 006::EdgeCase::3.3 | 006-reverse-transformation-rules:117 | Commands & Agents (Arrays) | - | ❌ | - | ❌ |
| 006::EdgeCase::3.4 | 006-reverse-transformation-rules:158 | Skills (Arrays) | - | ❌ | - | ❌ |
| 006::EdgeCase::3.5 | 006-reverse-transformation-rules:186 | Hooks (Array → Nested Object) | - | ❌ | - | ❌ |
| 006::EdgeCase::3.6 | 006-reverse-transformation-rules:271 | MCPs (Array → Nested Object) | - | ❌ | - | ❌ |
| 006::EdgeCase::3.7 | 006-reverse-transformation-rules:331 | Source Field | - | ❌ | - | ❌ |
| 006::EdgeCase::5.1 | 006-reverse-transformation-rules:606 | Path Format Loss | - | ❌ | - | ❌ |
| 006::EdgeCase::5.2 | 006-reverse-transformation-rules:619 | Source Location Loss | - | ❌ | - | ❌ |
| 006::EdgeCase::5.3 | 006-reverse-transformation-rules:632 | Auto-Discovery Detection | - | ❌ | - | ❌ |
| 006::EdgeCase::7.1 | 006-reverse-transformation-rules:762 | Empty Plugin | - | ❌ | - | ❌ |
| 006::EdgeCase::7.2 | 006-reverse-transformation-rules:791 | Hooks with Extra Fields | - | ❌ | - | ❌ |
| 006::EdgeCase::7.3 | 006-reverse-transformation-rules:826 | MCPs with Extra Fields | - | ❌ | - | ❌ |
| 006::Example::L353 | 006-reverse-transformation-rules:353 | Example at line 353 | - | ❌ | - | ❌ |
| 006::Example::L390 | 006-reverse-transformation-rules:390 | Example at line 390 | - | ❌ | - | ❌ |
| 006::Example::L509 | 006-reverse-transformation-rules:509 | Example at line 509 | - | ❌ | - | ❌ |
| 006::Example::L555 | 006-reverse-transformation-rules:555 | Example at line 555 | - | ❌ | - | ❌ |
| 007::EdgeCase::5.1 | 007-save-operation-rules:124 | Copy Component Files | - | ❌ | - | ❌ |
| 007::EdgeCase::5.2 | 007-save-operation-rules:136 | Write Output Files | - | ❌ | - | ❌ |
| 007::EdgeCase::7.1 | 007-save-operation-rules:168 | Empty Selection | - | ❌ | - | ❌ |
| 007::EdgeCase::7.2 | 007-save-operation-rules:176 | Output Directory Exists | - | ❌ | - | ❌ |
| 007::EdgeCase::7.3 | 007-save-operation-rules:185 | File Name Conflicts (Commands & Agents) | - | ❌ | - | ❌ |
| 007::EdgeCase::7.4 | 007-save-operation-rules:209 | MCP Name Conflicts | - | ❌ | - | ❌ |
| 007::EdgeCase::7.5 | 007-save-operation-rules:229 | Hook Event Merging | - | ❌ | - | ❌ |
| 007::EdgeCase::7.6 | 007-save-operation-rules:257 | Skill Directory Conflicts | - | ❌ | - | ❌ |
| 008::Scenario::Full workflow - Load, select, save, verify | 008-integration-test-spec:131 | Full workflow - Load, select, save, verify | - | ❌ | - | ❌ |
| 008::Scenario::Multi-plugin selection with conflict resolution | 008-integration-test-spec:185 | Multi-plugin selection with conflict resolution | - | ❌ | - | ❌ |
| 008::Scenario::Save with no selection | 008-integration-test-spec:290 | Save with no selection | - | ❌ | - | ❌ |
| 008::Scenario::Output directory already exists | 008-integration-test-spec:297 | Output directory already exists | - | ❌ | - | ❌ |
| 008::Scenario::Select from multiple plugins | 008-integration-test-spec:305 | Select from multiple plugins | - | ❌ | - | ❌ |
| 008::Scenario::Plugin with missing files | 008-integration-test-spec:313 | Plugin with missing files | - | ❌ | - | ❌ |
| 008::Scenario::Empty components are handled correctly | 008-integration-test-spec:338 | Empty components are handled correctly | - | ❌ | - | ❌ |
| 008::Scenario::Hooks transform correctly | 008-integration-test-spec:345 | Hooks transform correctly | - | ❌ | - | ❌ |
| 008::Scenario::MCPs transform correctly | 008-integration-test-spec:361 | MCPs transform correctly | - | ❌ | - | ❌ |
| 008::Scenario::Default values are omitted | 008-integration-test-spec:378 | Default values are omitted | - | ❌ | - | ❌ |
| 008::Invariant::L429 | 008-integration-test-spec:429 | ✅ Can load test-plugin without errors | - | ❌ | - | ❌ |
| 008::Invariant::L430 | 008-integration-test-spec:430 | ✅ All 15 components visible in TUI | - | ❌ | - | ❌ |
| 008::Invariant::L431 | 008-integration-test-spec:431 | ✅ Selection works correctly | - | ❌ | - | ❌ |
| 008::Invariant::L432 | 008-integration-test-spec:432 | ✅ Save generates both output files | - | ❌ | - | ❌ |
| 008::Invariant::L433 | 008-integration-test-spec:433 | ✅ Official plugin.json is valid | - | ❌ | - | ❌ |
| 008::Invariant::L434 | 008-integration-test-spec:434 | ✅ All selected files copied to output | - | ❌ | - | ❌ |
| 008::Invariant::L435 | 008-integration-test-spec:435 | ✅ Output plugin can be loaded by Claude Code | - | ❌ | - | ❌ |
| 008::Invariant::L438 | 008-integration-test-spec:438 | ✅ No crashes or unhandled errors | - | ❌ | - | ❌ |
| 008::Invariant::L439 | 008-integration-test-spec:439 | ✅ Clear error messages for invalid states | - | ❌ | - | ❌ |
| 008::Invariant::L440 | 008-integration-test-spec:440 | ✅ All edge cases handled gracefully | - | ❌ | - | ❌ |

## Summary

- **Total requirements**: 73
- ✅ **Full coverage**: 0 (0%)
- ⚠️ **Partial coverage**: 0 (0%)
- ❌ **No coverage**: 73 (100%)
