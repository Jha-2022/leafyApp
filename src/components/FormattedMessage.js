import React from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

/**
 * Tokenize a single line of text into inline formatting tokens:
 * - ***bold+italic***
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - `inline code`
 * - [link text](url)
 * - plain text
 */
function parseInlineTokens(text) {
  if (!text) return [];

  const regex = /(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|__[^_]+?__|(?<!\*)\*[^*]+?\*(?!\*)|(?<!_)_[^_]+?_(?!_)|`[^`]+?`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts
    .map((part) => {
      if (!part) return null;

      // Bold + Italic (***text***)
      if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
        return { type: 'boldItalic', text: part.slice(3, -3) };
      }

      // Bold (**text** or __text__)
      if (
        ((part.startsWith('**') && part.endsWith('**')) ||
          (part.startsWith('__') && part.endsWith('__'))) &&
        part.length >= 4
      ) {
        return { type: 'bold', text: part.slice(2, -2) };
      }

      // Italic (*text* or _text_)
      if (
        ((part.startsWith('*') && part.endsWith('*')) ||
          (part.startsWith('_') && part.endsWith('_'))) &&
        part.length >= 2
      ) {
        return { type: 'italic', text: part.slice(1, -1) };
      }

      // Inline code (`text`)
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return { type: 'code', text: part.slice(1, -1) };
      }

      // Markdown links [title](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return { type: 'link', text: linkMatch[1], url: linkMatch[2] };
      }

      return { type: 'text', text: part };
    })
    .filter(Boolean);
}

/**
 * Render inline tokens into Text nodes with appropriate styling.
 */
function renderInlineContent(tokens, isUser, styles) {
  return tokens.map((token, index) => {
    switch (token.type) {
      case 'bold':
        return (
          <Text
            key={index}
            style={[styles.boldText, isUser ? styles.userBoldText : styles.aiBoldText]}
          >
            {token.text}
          </Text>
        );

      case 'italic':
        return (
          <Text
            key={index}
            style={[styles.italicText, isUser ? styles.userItalicText : styles.aiItalicText]}
          >
            {token.text}
          </Text>
        );

      case 'boldItalic':
        return (
          <Text
            key={index}
            style={[
              styles.boldText,
              styles.italicText,
              isUser ? styles.userBoldText : styles.aiBoldText,
            ]}
          >
            {token.text}
          </Text>
        );

      case 'code':
        return (
          <Text
            key={index}
            style={[
              styles.inlineCodeText,
              isUser ? styles.userInlineCodeText : styles.aiInlineCodeText,
            ]}
          >
            {token.text}
          </Text>
        );

      case 'link':
        return (
          <Text
            key={index}
            style={[styles.linkText, isUser ? styles.userLinkText : styles.aiLinkText]}
            onPress={() => token.url && Linking.openURL(token.url).catch(() => {})}
          >
            {token.text}
          </Text>
        );

      default:
        return <Text key={index}>{token.text}</Text>;
    }
  });
}

/**
 * Parse raw markdown text into structural blocks:
 * - Code blocks (```lang ... ```)
 * - Headers (#, ##, ###)
 * - Bullet lists (*, -, +)
 * - Numbered lists (1., 2.)
 * - Blockquotes (>)
 * - Dividers (---)
 * - Paragraphs
 */
function parseBlocks(rawText) {
  if (!rawText) return [];

  const lines = rawText.split('\n');
  const blocks = [];
  let currentCodeBlock = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced Code Block delimiter ```
    if (line.trim().startsWith('```')) {
      if (currentCodeBlock) {
        blocks.push(currentCodeBlock);
        currentCodeBlock = null;
      } else {
        const lang = line.trim().slice(3).trim();
        currentCodeBlock = { type: 'codeblock', lang, lines: [] };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.lines.push(line);
      continue;
    }

    const trimmed = line.trim();

    // Empty line (spacer between paragraphs)
    if (!trimmed) {
      blocks.push({ type: 'empty' });
      continue;
    }

    // Horizontal Rule (--- or *** or ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'divider' });
      continue;
    }

    // Headers: #, ##, ###
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      blocks.push({ type: 'header', level, text: headerMatch[2] });
      continue;
    }

    // Blockquote: > quote
    const quoteMatch = line.match(/^>\s*(.+)$/);
    if (quoteMatch) {
      blocks.push({ type: 'quote', text: quoteMatch[1] });
      continue;
    }

    // Bullet List items: * , - , +
    const bulletMatch = line.match(/^(\s*)[*\-+]\s+(.+)$/);
    if (bulletMatch) {
      const indent = bulletMatch[1].length;
      blocks.push({ type: 'bullet', indent, text: bulletMatch[2] });
      continue;
    }

    // Numbered List items: 1. , 2.
    const numberMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (numberMatch) {
      const indent = numberMatch[1].length;
      blocks.push({
        type: 'numbered',
        number: numberMatch[2],
        indent,
        text: numberMatch[3],
      });
      continue;
    }

    // Standard Paragraph text
    blocks.push({ type: 'paragraph', text: line });
  }

  if (currentCodeBlock) {
    blocks.push(currentCodeBlock);
  }

  // Filter out redundant consecutive empty blocks
  const cleanedBlocks = [];
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === 'empty') {
      if (i > 0 && i < blocks.length - 1 && cleanedBlocks[cleanedBlocks.length - 1]?.type !== 'empty') {
        cleanedBlocks.push(blocks[i]);
      }
    } else {
      cleanedBlocks.push(blocks[i]);
    }
  }

  return cleanedBlocks;
}

/**
 * FormattedMessage Component
 *
 * Renders Markdown-formatted AI or user messages cleanly without raw asterisks (*),
 * backticks, or hashes. Formats bold, italics, code blocks, lists, and headers.
 */
export default function FormattedMessage({ text, isUser = false }) {
  const blocks = React.useMemo(() => parseBlocks(text), [text]);

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'empty':
            return <View key={index} style={styles.paragraphSpacer} />;

          case 'divider':
            return (
              <View
                key={index}
                style={[styles.divider, isUser ? styles.userDivider : styles.aiDivider]}
              />
            );

          case 'header': {
            const headerStyle =
              block.level === 1
                ? styles.h1
                : block.level === 2
                ? styles.h2
                : styles.h3;
            const inlineTokens = parseInlineTokens(block.text);
            return (
              <Text
                key={index}
                style={[
                  styles.baseText,
                  headerStyle,
                  isUser ? styles.userBaseText : styles.aiHeaderText,
                ]}
              >
                {renderInlineContent(inlineTokens, isUser, styles)}
              </Text>
            );
          }

          case 'quote': {
            const inlineTokens = parseInlineTokens(block.text);
            return (
              <View
                key={index}
                style={[
                  styles.quoteBox,
                  isUser ? styles.userQuoteBox : styles.aiQuoteBox,
                ]}
              >
                <Text
                  style={[
                    styles.baseText,
                    styles.italicText,
                    isUser ? styles.userBaseText : styles.aiBaseText,
                  ]}
                >
                  {renderInlineContent(inlineTokens, isUser, styles)}
                </Text>
              </View>
            );
          }

          case 'bullet': {
            const inlineTokens = parseInlineTokens(block.text);
            const indentLevel = Math.min(Math.floor(block.indent / 2), 2);
            return (
              <View
                key={index}
                style={[styles.listItemRow, { marginLeft: indentLevel * 12 }]}
              >
                <Text style={[styles.bulletDot, isUser ? styles.userBulletDot : styles.aiBulletDot]}>
                  •
                </Text>
                <Text
                  style={[
                    styles.baseText,
                    styles.listItemContent,
                    isUser ? styles.userBaseText : styles.aiBaseText,
                  ]}
                >
                  {renderInlineContent(inlineTokens, isUser, styles)}
                </Text>
              </View>
            );
          }

          case 'numbered': {
            const inlineTokens = parseInlineTokens(block.text);
            const indentLevel = Math.min(Math.floor(block.indent / 2), 2);
            return (
              <View
                key={index}
                style={[styles.listItemRow, { marginLeft: indentLevel * 12 }]}
              >
                <Text
                  style={[
                    styles.numberBadge,
                    isUser ? styles.userNumberBadge : styles.aiNumberBadge,
                  ]}
                >
                  {block.number}.
                </Text>
                <Text
                  style={[
                    styles.baseText,
                    styles.listItemContent,
                    isUser ? styles.userBaseText : styles.aiBaseText,
                  ]}
                >
                  {renderInlineContent(inlineTokens, isUser, styles)}
                </Text>
              </View>
            );
          }

          case 'codeblock': {
            const codeString = block.lines.join('\n');
            return (
              <View key={index} style={styles.codeBlockCard}>
                {block.lang ? (
                  <View style={styles.codeBlockTopBar}>
                    <Text style={styles.codeBlockLangBadge}>{block.lang.toLowerCase()}</Text>
                  </View>
                ) : null}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  style={styles.codeBlockScroll}
                >
                  <Text style={styles.codeBlockSource}>{codeString}</Text>
                </ScrollView>
              </View>
            );
          }

          case 'paragraph':
          default: {
            const inlineTokens = parseInlineTokens(block.text);
            return (
              <Text
                key={index}
                style={[
                  styles.baseText,
                  styles.paragraphText,
                  isUser ? styles.userBaseText : styles.aiBaseText,
                ]}
              >
                {renderInlineContent(inlineTokens, isUser, styles)}
              </Text>
            );
          }
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  baseText: {
    fontSize: 14,
    lineHeight: 21,
  },
  userBaseText: {
    color: '#FFFFFF',
  },
  aiBaseText: {
    color: '#2C2B29',
  },
  paragraphText: {
    marginBottom: 4,
  },
  paragraphSpacer: {
    height: 8,
  },
  boldText: {
    fontWeight: '700',
  },
  userBoldText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  aiBoldText: {
    color: '#1E3A1D',
    fontWeight: '700',
  },
  italicText: {
    fontStyle: 'italic',
  },
  userItalicText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  aiItalicText: {
    color: '#476346',
  },
  h1: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 23,
  },
  h2: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 21,
  },
  h3: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
    lineHeight: 20,
  },
  aiHeaderText: {
    color: '#2A4729',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingRight: 6,
  },
  bulletDot: {
    fontSize: 15,
    lineHeight: 21,
    marginRight: 6,
    fontWeight: '800',
  },
  userBulletDot: {
    color: '#FFFFFF',
  },
  aiBulletDot: {
    color: '#84A282',
  },
  numberBadge: {
    fontSize: 13,
    lineHeight: 21,
    marginRight: 6,
    fontWeight: '700',
    minWidth: 16,
  },
  userNumberBadge: {
    color: '#FFFFFF',
  },
  aiNumberBadge: {
    color: '#557553',
  },
  listItemContent: {
    flex: 1,
  },
  quoteBox: {
    borderLeftWidth: 3.5,
    borderRadius: 4,
    paddingLeft: 10,
    paddingVertical: 4,
    marginVertical: 4,
  },
  userQuoteBox: {
    borderLeftColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiQuoteBox: {
    borderLeftColor: '#84A282',
    backgroundColor: '#F5F8F4',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  userDivider: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  aiDivider: {
    backgroundColor: 'rgba(132, 162, 130, 0.25)',
  },
  inlineCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12.5,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  userInlineCodeText: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    color: '#FFFFFF',
  },
  aiInlineCodeText: {
    backgroundColor: '#EAF0E9',
    color: '#2A4729',
    fontWeight: '600',
  },
  codeBlockCard: {
    backgroundColor: '#1E281D',
    borderRadius: 8,
    marginVertical: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(132, 162, 130, 0.2)',
  },
  codeBlockTopBar: {
    backgroundColor: '#172016',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(132, 162, 130, 0.15)',
  },
  codeBlockLangBadge: {
    color: '#A0C29E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  codeBlockScroll: {
    padding: 10,
  },
  codeBlockSource: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#E3EFE2',
    fontSize: 12.5,
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  userLinkText: {
    color: '#FFFFFF',
  },
  aiLinkText: {
    color: '#346633',
    fontWeight: '600',
  },
});
