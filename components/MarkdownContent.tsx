import React, { useMemo } from "react";
import { Platform, Text, useColorScheme } from "react-native";
import Markdown from "react-native-markdown-display";

const baseFontSize = 15;
const baseLineHeight = 22;
const monoFont = Platform.select({
  ios: "Courier",
  android: "monospace",
  default: "monospace",
});

const lightStyles = {
  body: {
    color: "#111827",
    fontSize: baseFontSize,
    lineHeight: baseLineHeight,
  },
  heading1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "bold" as const,
    color: "#111827",
    marginTop: 8,
    marginBottom: 4,
    flexDirection: "row" as const,
  },
  heading2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "bold" as const,
    color: "#111827",
    marginTop: 6,
    marginBottom: 4,
    flexDirection: "row" as const,
  },
  heading3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600" as const,
    color: "#111827",
    marginTop: 4,
    marginBottom: 2,
    flexDirection: "row" as const,
  },
  heading4: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600" as const,
    color: "#111827",
    marginTop: 4,
    marginBottom: 2,
    flexDirection: "row" as const,
  },
  heading5: {
    fontSize: baseFontSize,
    lineHeight: baseLineHeight,
    fontWeight: "600" as const,
    color: "#111827",
    flexDirection: "row" as const,
  },
  heading6: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600" as const,
    color: "#6b7280",
    flexDirection: "row" as const,
  },
  paragraph: {
    marginTop: 4,
    marginBottom: 4,
    flexWrap: "wrap" as const,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    justifyContent: "flex-start" as const,
    width: "100%" as const,
  },
  strong: {
    fontWeight: "bold" as const,
  },
  em: {
    fontStyle: "italic" as const,
  },
  s: {
    textDecorationLine: "line-through" as const,
  },
  link: {
    color: "#3b82f6",
    textDecorationLine: "underline" as const,
  },
  blockquote: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
    borderLeftWidth: 3,
    marginLeft: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  code_inline: {
    backgroundColor: "#f3f4f6",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontFamily: monoFont,
    fontSize: 13,
  },
  code_block: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    fontFamily: monoFont,
    fontSize: 13,
    color: "#111827",
  },
  fence: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    fontFamily: monoFont,
    fontSize: 13,
    color: "#111827",
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  thead: {},
  tbody: {},
  th: {
    flex: 1,
    padding: 6,
    fontWeight: "bold" as const,
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row" as const,
  },
  td: {
    flex: 1,
    padding: 6,
  },
  hr: {
    backgroundColor: "#e5e7eb",
    height: 1,
    marginVertical: 8,
  },
  bullet_list: {},
  ordered_list: {},
  list_item: {
    flexDirection: "row" as const,
    justifyContent: "flex-start" as const,
  },
  bullet_list_icon: {
    marginLeft: 4,
    marginRight: 8,
    color: "#111827",
  },
  bullet_list_content: {
    flex: 1,
  },
  ordered_list_icon: {
    marginLeft: 4,
    marginRight: 8,
    color: "#111827",
  },
  ordered_list_content: {
    flex: 1,
  },
  text: {},
  textgroup: {},
  image: {
    flex: 1,
  },
  hardbreak: {
    width: "100%" as const,
    height: 1,
  },
  softbreak: {},
  blocklink: {
    flex: 1,
    borderColor: "#e5e7eb",
    borderBottomWidth: 1,
  },
  pre: {},
  inline: {},
  span: {},
};

const darkStyles = {
  body: {
    color: "#f3f4f6",
    fontSize: baseFontSize,
    lineHeight: baseLineHeight,
  },
  heading1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "bold" as const,
    color: "#f3f4f6",
    marginTop: 8,
    marginBottom: 4,
    flexDirection: "row" as const,
  },
  heading2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "bold" as const,
    color: "#f3f4f6",
    marginTop: 6,
    marginBottom: 4,
    flexDirection: "row" as const,
  },
  heading3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600" as const,
    color: "#f3f4f6",
    marginTop: 4,
    marginBottom: 2,
    flexDirection: "row" as const,
  },
  heading4: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600" as const,
    color: "#f3f4f6",
    marginTop: 4,
    marginBottom: 2,
    flexDirection: "row" as const,
  },
  heading5: {
    fontSize: baseFontSize,
    lineHeight: baseLineHeight,
    fontWeight: "600" as const,
    color: "#f3f4f6",
    flexDirection: "row" as const,
  },
  heading6: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600" as const,
    color: "#9ca3af",
    flexDirection: "row" as const,
  },
  paragraph: {
    marginTop: 4,
    marginBottom: 4,
    flexWrap: "wrap" as const,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    justifyContent: "flex-start" as const,
    width: "100%" as const,
  },
  strong: {
    fontWeight: "bold" as const,
  },
  em: {
    fontStyle: "italic" as const,
  },
  s: {
    textDecorationLine: "line-through" as const,
  },
  link: {
    color: "#60a5fa",
    textDecorationLine: "underline" as const,
  },
  blockquote: {
    backgroundColor: "#1f2937",
    borderColor: "#4b5563",
    borderLeftWidth: 3,
    marginLeft: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  code_inline: {
    backgroundColor: "#1f2937",
    color: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontFamily: monoFont,
    fontSize: 13,
  },
  code_block: {
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 8,
    padding: 10,
    fontFamily: monoFont,
    fontSize: 13,
    color: "#f3f4f6",
  },
  fence: {
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 8,
    padding: 10,
    fontFamily: monoFont,
    fontSize: 13,
    color: "#f3f4f6",
  },
  table: {
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 4,
  },
  thead: {},
  tbody: {},
  th: {
    flex: 1,
    padding: 6,
    fontWeight: "bold" as const,
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: "#374151",
    flexDirection: "row" as const,
  },
  td: {
    flex: 1,
    padding: 6,
  },
  hr: {
    backgroundColor: "#374151",
    height: 1,
    marginVertical: 8,
  },
  bullet_list: {},
  ordered_list: {},
  list_item: {
    flexDirection: "row" as const,
    justifyContent: "flex-start" as const,
  },
  bullet_list_icon: {
    marginLeft: 4,
    marginRight: 8,
    color: "#f3f4f6",
  },
  bullet_list_content: {
    flex: 1,
  },
  ordered_list_icon: {
    marginLeft: 4,
    marginRight: 8,
    color: "#f3f4f6",
  },
  ordered_list_content: {
    flex: 1,
  },
  text: {},
  textgroup: {},
  image: {
    flex: 1,
  },
  hardbreak: {
    width: "100%" as const,
    height: 1,
  },
  softbreak: {},
  blocklink: {
    flex: 1,
    borderColor: "#374151",
    borderBottomWidth: 1,
  },
  pre: {},
  inline: {},
  span: {},
};

const userBubbleStyles = {
  body: {
    color: "#ffffff",
    fontSize: baseFontSize,
    lineHeight: baseLineHeight,
  },
  heading1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "bold" as const,
    color: "#ffffff",
    marginTop: 8,
    marginBottom: 4,
    flexDirection: "row" as const,
  },
  heading2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "bold" as const,
    color: "#ffffff",
    marginTop: 6,
    marginBottom: 4,
    flexDirection: "row" as const,
  },
  heading3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginTop: 4,
    marginBottom: 2,
    flexDirection: "row" as const,
  },
  heading4: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginTop: 4,
    marginBottom: 2,
    flexDirection: "row" as const,
  },
  heading5: {
    fontSize: baseFontSize,
    lineHeight: baseLineHeight,
    fontWeight: "600" as const,
    color: "#ffffff",
    flexDirection: "row" as const,
  },
  heading6: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600" as const,
    color: "#e0e0e0",
    flexDirection: "row" as const,
  },
  paragraph: {
    marginTop: 4,
    marginBottom: 4,
    flexWrap: "wrap" as const,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    justifyContent: "flex-start" as const,
    width: "100%" as const,
  },
  strong: {
    fontWeight: "bold" as const,
  },
  em: {
    fontStyle: "italic" as const,
  },
  s: {
    textDecorationLine: "line-through" as const,
  },
  link: {
    color: "#bfdbfe",
    textDecorationLine: "underline" as const,
  },
  blockquote: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderLeftWidth: 3,
    marginLeft: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  code_inline: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    color: "#ffffff",
    borderWidth: 0,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontFamily: monoFont,
    fontSize: 13,
  },
  code_block: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 0,
    borderRadius: 8,
    padding: 10,
    fontFamily: monoFont,
    fontSize: 13,
    color: "#ffffff",
  },
  fence: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 0,
    borderRadius: 8,
    padding: 10,
    fontFamily: monoFont,
    fontSize: 13,
    color: "#ffffff",
  },
  table: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
  },
  thead: {},
  tbody: {},
  th: {
    flex: 1,
    padding: 6,
    fontWeight: "bold" as const,
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row" as const,
  },
  td: {
    flex: 1,
    padding: 6,
  },
  hr: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: 1,
    marginVertical: 8,
  },
  bullet_list: {},
  ordered_list: {},
  list_item: {
    flexDirection: "row" as const,
    justifyContent: "flex-start" as const,
  },
  bullet_list_icon: {
    marginLeft: 4,
    marginRight: 8,
    color: "#ffffff",
  },
  bullet_list_content: {
    flex: 1,
  },
  ordered_list_icon: {
    marginLeft: 4,
    marginRight: 8,
    color: "#ffffff",
  },
  ordered_list_content: {
    flex: 1,
  },
  text: {},
  textgroup: {},
  image: {
    flex: 1,
  },
  hardbreak: {
    width: "100%" as const,
    height: 1,
  },
  softbreak: {},
  blocklink: {
    flex: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderBottomWidth: 1,
  },
  pre: {},
  inline: {},
  span: {},
};

interface MarkdownContentProps {
  content: string;
  isUser: boolean;
}

export function MarkdownContent({ content, isUser }: MarkdownContentProps) {
  const colorScheme = useColorScheme();

  const styles = useMemo(() => {
    if (isUser) {
      return userBubbleStyles;
    }

    return colorScheme === "dark" ? darkStyles : lightStyles;
  }, [isUser, colorScheme]);

  return (
    <Markdown
      style={styles}
      rules={{
        body: (node, children) => (
          <Text key={node.key} style={styles.body} selectable={true}>
            {children}
          </Text>
        ),
        textgroup: (node, children) => (
          <React.Fragment key={node.key}>{children}</React.Fragment>
        ),
        paragraph: (node, children) => (
          <Text key={node.key} style={styles.paragraph}>
            {children}
            {"\n"}
          </Text>
        ),
        heading1: (node, children) => (
          <Text key={node.key} style={styles.heading1}>
            {children}
            {"\n"}
          </Text>
        ),
        heading2: (node, children) => (
          <Text key={node.key} style={styles.heading2}>
            {children}
            {"\n"}
          </Text>
        ),
        heading3: (node, children) => (
          <Text key={node.key} style={styles.heading3}>
            {children}
            {"\n"}
          </Text>
        ),
        heading4: (node, children) => (
          <Text key={node.key} style={styles.heading4}>
            {children}
            {"\n"}
          </Text>
        ),
        heading5: (node, children) => (
          <Text key={node.key} style={styles.heading5}>
            {children}
            {"\n"}
          </Text>
        ),
        heading6: (node, children) => (
          <Text key={node.key} style={styles.heading6}>
            {children}
            {"\n"}
          </Text>
        ),
        blockquote: (node, children) => (
          <Text key={node.key} style={styles.blockquote}>
            {children}
          </Text>
        ),
        code_block: (node) => (
          <Text key={node.key} style={styles.code_block}>
            {node.content}
          </Text>
        ),
        fence: (node) => (
          <Text key={node.key} style={styles.fence}>
            {node.content}
          </Text>
        ),
        bullet_list: (node, children) => (
          <Text key={node.key} style={styles.bullet_list}>
            {children}
          </Text>
        ),
        ordered_list: (node, children) => (
          <Text key={node.key} style={styles.ordered_list}>
            {children}
          </Text>
        ),
        list_item: (node, children, parent) => {
          const isOrdered = parent.some((el) => el.type === "ordered_list");
          const bullet = isOrdered ? `${node.index + 1}. ` : "• ";

          return (
            <Text key={node.key} style={styles.list_item}>
              {bullet}
              {children}
              {"\n"}
            </Text>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
}
