# Hooks de Auto-Activación de Skills

Este directorio contiene los hooks que activan automáticamente las skills del proyecto.

## Hook: skill-activation.sh

**Tipo:** `UserPromptSubmit`
**Propósito:** Detectar cuando el usuario está trabajando con archivos markdown y sugerir la activación de la skill `frontmatter-validator`.

### Cómo Funciona

1. **Se ejecuta en cada prompt del usuario** antes de que Claude lo procese
2. **Lee `skill-rules.json`** para obtener los patrones de activación
3. **Analiza el contexto:**
   - Keywords en el prompt (markdown, frontmatter, gate_constraints, etc.)
   - Extensiones de archivo mencionadas (.md, .markdown)
   - Contexto de archivos recientes
4. **Sugiere la skill** si detecta coincidencias

### Patrones de Activación (skill-rules.json)

```json
{
  "filePatterns": ["**/*.md"],
  "keywords": ["markdown", "frontmatter", "gate_constraints", "document_covers"],
  "toolPatterns": ["Write.*\\.md", "Edit.*\\.md"]
}
```

### Configuración (settings.json)

El hook está registrado en `.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "matcher": ".*",
      "hooks": [{"type": "command", "command": ".claude/hooks/skill-activation.sh"}]
    }],
    "PreToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "prompt",
        "prompt": "Before writing or editing any .md file, you MUST activate and use the frontmatter-validator skill..."
      }]
    }]
  }
}
```

## Hooks Adicionales

### PreToolUse (Write|Edit)

**Propósito:** Recordatorio directo a Claude antes de escribir o editar cualquier archivo.

Este hook inyecta un prompt adicional que le recuerda a Claude que debe:
1. Leer el frontmatter del archivo
2. Activar la skill frontmatter-validator
3. Validar todas las gate_constraints antes de escribir

## Dependencias

- **bash**: Para ejecutar el script del hook
- **jq** (opcional): Para parsing avanzado de JSON. Si no está disponible, usa fallback con grep

## Testing

Para probar si el hook funciona:

```bash
# Simular un prompt sobre markdown
echo "quiero editar un archivo markdown" | .claude/hooks/skill-activation.sh
```

Debería retornar un JSON con la sugerencia de activación.

## Troubleshooting

**El hook no se ejecuta:**
- Verifica que `.claude/settings.json` existe y tiene la configuración correcta
- Verifica permisos: `chmod +x .claude/hooks/skill-activation.sh`
- Revisa los logs de Claude Code

**La skill no se activa:**
- Verifica que `skill-rules.json` contiene los patrones correctos
- Asegúrate de usar keywords que coincidan con tus prompts
- Revisa que la skill existe en `.claude/skills/frontmatter-validator/`

## Referencias

- [Claude Code: Hooks Documentation](https://code.claude.com/docs/en/hooks.md)
- [diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase)
