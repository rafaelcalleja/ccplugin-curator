# Scenario 1: Detect Cross-Reference

## Given
A document content (markdown text)

## When
The content contains a reference to another document

## Then
The validation should detect it

## Examples of cross-references to detect

1. Markdown link: `[text](002-file.md)`
2. Plain reference: `See 002-file.md`
3. Relative path: `../other/file.md`

## Examples of valid content (no cross-reference)

1. Regular text: `Normalization transforms formats`
2. External link: `[docs](https://example.com)`
3. Anchor link: `[section](#heading)`
