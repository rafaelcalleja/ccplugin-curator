# Implementation Gaps

This document lists all requirements that need implementation, sorted by dependency order.

## Priority Order

Implementation should follow this order based on spec dependencies:

1. **001-normalization-protocol.md** - 4 gaps
2. **002-plugin-format-spec.md** - 7 gaps
4. **004-user-workflows.md** - 13 gaps
5. **005-transformation-rules.md** - 4 gaps
6. **006-reverse-transformation-rules.md** - 17 gaps
7. **007-save-operation-rules.md** - 8 gaps
8. **008-integration-test-spec.md** - 20 gaps

---

## 001-normalization-protocol.md

| Requirement ID | Description | Test Coverage | Impl File | Status |
|----------------|-------------|---------------|-----------|--------|
| 001::EdgeCase::1.1 | Required Fields | ❌ | - | ❌ |
| 001::EdgeCase::1.2 | Optional Metadata Fields | ❌ | - | ❌ |
| 001::EdgeCase::1.3 | Component Path Fields | ❌ | - | ❌ |
| 001::EdgeCase::1.4 | Path Behavior Rules ⚠️ CRÍTICO | ❌ | - | ❌ |

## 002-plugin-format-spec.md

| Requirement ID | Description | Test Coverage | Impl File | Status |
|----------------|-------------|---------------|-----------|--------|
| 002::EdgeCase::1.1 | PluginJson Schema (Claude Code) | ❌ | - | ❌ |
| 002::EdgeCase::1.2 | Default Values | ❌ | - | ❌ |
| 002::EdgeCase::1.3 | Value Types | ❌ | - | ❌ |
| 002::EdgeCase::2.1 | Structure | ❌ | - | ❌ |
| 002::EdgeCase::2.2 | Fields | ❌ | - | ❌ |
| 002::EdgeCase::2.3 | Events | ❌ | - | ❌ |
| 002::EdgeCase::2.4 | Examples | ❌ | - | ❌ |

## 004-user-workflows.md

| Requirement ID | Description | Test Coverage | Impl File | Status |
|----------------|-------------|---------------|-----------|--------|
| 004::Scenario::Conflicto de directorios de skills | Conflicto de directorios de skills | ❌ | - | ❌ |
| 004::Scenario::Conflicto de nombres de agentes | Conflicto de nombres de agentes | ❌ | - | ❌ |
| 004::Scenario::Conflicto de nombres de comandos | Conflicto de nombres de comandos | ❌ | - | ❌ |
| 004::Scenario::Conflicto de nombres de MCPs | Conflicto de nombres de MCPs | ❌ | - | ❌ |
| 004::Scenario::Guardar selección | Guardar selección | ❌ | - | ❌ |
| 004::Scenario::Guardar sin selección | Guardar sin selección | ❌ | - | ❌ |
| 004::Scenario::Merge de hooks del mismo evento | Merge de hooks del mismo evento | ❌ | - | ❌ |
| 004::Scenario::Navegar entre paneles | Navegar entre paneles | ❌ | - | ❌ |
| 004::Scenario::Navegar entre plugins | Navegar entre plugins | ❌ | - | ❌ |
| 004::Scenario::Salir de la aplicación | Salir de la aplicación | ❌ | - | ❌ |
| 004::Scenario::Seleccionar componentes | Seleccionar componentes | ❌ | - | ❌ |
| 004::Scenario::Seleccionar de múltiples plugins | Seleccionar de múltiples plugins | ❌ | - | ❌ |
| 004::Scenario::Usuario selecciona componentes | Usuario selecciona componentes | ❌ | - | ❌ |

## 005-transformation-rules.md

| Requirement ID | Description | Test Coverage | Impl File | Status |
|----------------|-------------|---------------|-----------|--------|
| 005::EdgeCase::2.1 | Commands/Agents (Paths → Array) | ❌ | - | ❌ |
| 005::EdgeCase::2.2 | Skills (Discovery) | ❌ | - | ❌ |
| 005::EdgeCase::2.3 | Hooks (Nested → Flat Array) | ❌ | - | ❌ |
| 005::EdgeCase::2.4 | MCPs (Object → Array) | ❌ | - | ❌ |

## 006-reverse-transformation-rules.md

| Requirement ID | Description | Test Coverage | Impl File | Status |
|----------------|-------------|---------------|-----------|--------|
| 006::EdgeCase::3.1 | Metadata Fields | ❌ | - | ❌ |
| 006::EdgeCase::3.2 | Author Field | ❌ | - | ❌ |
| 006::EdgeCase::3.3 | Commands & Agents (Arrays) | ❌ | - | ❌ |
| 006::EdgeCase::3.4 | Skills (Arrays) | ❌ | - | ❌ |
| 006::EdgeCase::3.5 | Hooks (Array → Nested Object) | ❌ | - | ❌ |
| 006::EdgeCase::3.6 | MCPs (Array → Nested Object) | ❌ | - | ❌ |
| 006::EdgeCase::3.7 | Source Field | ❌ | - | ❌ |
| 006::EdgeCase::5.1 | Path Format Loss | ❌ | - | ❌ |
| 006::EdgeCase::5.2 | Source Location Loss | ❌ | - | ❌ |
| 006::EdgeCase::5.3 | Auto-Discovery Detection | ❌ | - | ❌ |
| 006::EdgeCase::7.1 | Empty Plugin | ❌ | - | ❌ |
| 006::EdgeCase::7.2 | Hooks with Extra Fields | ❌ | - | ❌ |
| 006::EdgeCase::7.3 | MCPs with Extra Fields | ❌ | - | ❌ |
| 006::Example::L353 | Example at line 353 | ❌ | - | ❌ |
| 006::Example::L390 | Example at line 390 | ❌ | - | ❌ |
| 006::Example::L509 | Example at line 509 | ❌ | - | ❌ |
| 006::Example::L555 | Example at line 555 | ❌ | - | ❌ |

## 007-save-operation-rules.md

| Requirement ID | Description | Test Coverage | Impl File | Status |
|----------------|-------------|---------------|-----------|--------|
| 007::EdgeCase::5.1 | Copy Component Files | ❌ | - | ❌ |
| 007::EdgeCase::5.2 | Write Output Files | ❌ | - | ❌ |
| 007::EdgeCase::7.1 | Empty Selection | ❌ | - | ❌ |
| 007::EdgeCase::7.2 | Output Directory Exists | ❌ | - | ❌ |
| 007::EdgeCase::7.3 | File Name Conflicts (Commands & Agents) | ❌ | - | ❌ |
| 007::EdgeCase::7.4 | MCP Name Conflicts | ❌ | - | ❌ |
| 007::EdgeCase::7.5 | Hook Event Merging | ❌ | - | ❌ |
| 007::EdgeCase::7.6 | Skill Directory Conflicts | ❌ | - | ❌ |

## 008-integration-test-spec.md

| Requirement ID | Description | Test Coverage | Impl File | Status |
|----------------|-------------|---------------|-----------|--------|
| 008::Invariant::L429 | ✅ Can load test-plugin without errors | ❌ | - | ❌ |
| 008::Invariant::L430 | ✅ All 15 components visible in TUI | ❌ | - | ❌ |
| 008::Invariant::L431 | ✅ Selection works correctly | ❌ | - | ❌ |
| 008::Invariant::L432 | ✅ Save generates both output files | ❌ | - | ❌ |
| 008::Invariant::L433 | ✅ Official plugin.json is valid | ❌ | - | ❌ |
| 008::Invariant::L434 | ✅ All selected files copied to output | ❌ | - | ❌ |
| 008::Invariant::L435 | ✅ Output plugin can be loaded by Claude Code | ❌ | - | ❌ |
| 008::Invariant::L438 | ✅ No crashes or unhandled errors | ❌ | - | ❌ |
| 008::Invariant::L439 | ✅ Clear error messages for invalid states | ❌ | - | ❌ |
| 008::Invariant::L440 | ✅ All edge cases handled gracefully | ❌ | - | ❌ |
| 008::Scenario::Default values are omitted | Default values are omitted | ❌ | - | ❌ |
| 008::Scenario::Empty components are handled correctly | Empty components are handled correctly | ❌ | - | ❌ |
| 008::Scenario::Full workflow - Load, select, save, verify | Full workflow - Load, select, save, verify | ❌ | - | ❌ |
| 008::Scenario::Hooks transform correctly | Hooks transform correctly | ❌ | - | ❌ |
| 008::Scenario::MCPs transform correctly | MCPs transform correctly | ❌ | - | ❌ |
| 008::Scenario::Multi-plugin selection with conflict resolution | Multi-plugin selection with conflict resolution | ❌ | - | ❌ |
| 008::Scenario::Output directory already exists | Output directory already exists | ❌ | - | ❌ |
| 008::Scenario::Plugin with missing files | Plugin with missing files | ❌ | - | ❌ |
| 008::Scenario::Save with no selection | Save with no selection | ❌ | - | ❌ |
| 008::Scenario::Select from multiple plugins | Select from multiple plugins | ❌ | - | ❌ |

---

## Summary

**Total gaps**: 73

- ❌ No coverage: 73
- ⚠️ Partial coverage: 0

## Next Steps

For each gap above:

1. Write failing test for the requirement
2. Implement feature to pass the test
3. Run test suite to verify
4. Update coverage matrix
