# Especificaciones - Índice

Documentación del proyecto en orden de lectura.

---

## 📚 Documentos

### [001 - Normalization Protocol](./001-normalization-protocol.md)
Protocolo de normalización: define el formato interno normalizado usado por el TUI.

### [002 - Official Plugin Format](./002-plugin-format-spec.md)
Formato oficial de `plugin.json` según documentación de Claude Code (referencia externa).

### [003 - TUI Visual Spec](./003-tui-visual-spec.md)
Especificación visual de la interfaz de usuario (TUI).

### [004 - User Workflows](./004-user-workflows.md)
Flujos de usuario definidos con BDD (Behavior-Driven Development).

### [005 - Transformation Rules](./005-transformation-rules.md)
Reglas de transformación del formato oficial al formato normalizado (forward transformation).

### [006 - Reverse Transformation Rules](./006-reverse-transformation-rules.md)
Reglas de transformación del formato normalizado al formato oficial (reverse transformation).

### [007 - Save Operation Rules](./007-save-operation-rules.md)
Define qué sucede cuando el usuario presiona S (Save) en el TUI. Especifica la generación de dual output (oficial + normalizado) y el flujo completo de guardado.

### [008 - Integration Test Spec](./008-integration-test-spec.md)
Test de integración end-to-end usando BDD. Valida el flujo completo (load → select → save) con un test-plugin que contiene todos los tipos de componentes y casos edge.

---

## 🎯 Orden de Lectura Recomendado

```
002 (oficial) → 001 (normalizado) → 005 (forward) → 006 (reverse) → 007 (save) → 003 (visual) → 004 (workflows) → 008 (test)
```

---

## 📂 Otros Recursos

### Decisiones Técnicas
- [`decisions/`](../decisions/) - Decisiones de implementación

### JSON Schemas
- [`schemas/plugin.schema.json`](../../schemas/plugin.schema.json) - Validación formato oficial
- [`schemas/normalized-plugin.schema.json`](../../schemas/normalized-plugin.schema.json) - Validación formato interno

### Documentos de Investigación
Ver [`docs/`](../) para investigación y análisis adicional.
