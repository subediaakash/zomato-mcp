'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Send, Sparkles, Loader2 } from 'lucide-react';

type ChatBoxProps = {
  title?: string;
  placeholder?: string;
  className?: string;
  /** Optional fixed height for the panel (tailwind class). Defaults to a compact responsive height. */
  heightClassName?: string;
};

export default function ChatBox({
  title = 'Assistant',
  placeholder = 'Ask about products or your orders…',
  className,
  heightClassName,
}: ChatBoxProps) {
  const { messages, sendMessage } = useChat();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isSending]);

  const containerHeights = useMemo(() => {
    // Default to a compact, responsive panel if no explicit height class is provided
    return heightClassName ?? 'h-[300px] sm:h-[340px] md:h-[420px]';
  }, [heightClassName]);

  return (
    <Card
      className={[
        'w-full rounded-2xl border shadow-md overflow-hidden bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60',
        className ?? '',
      ].join(' ')}
      aria-label="Chat assistant panel"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-600">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-none">{title}</span>
          <span className="text-[11px] text-muted-foreground">Ask me about availability, orders and more</span>
        </div>
        <div className="ml-auto text-[11px] text-muted-foreground">{isSending ? 'Thinking…' : 'Online'}</div>
      </div>
      <Separator />

      {/* Messages */}
      <div className={[
        'px-3 sm:px-4',
        containerHeights,
      ].join(' ')}>
        <div ref={scrollRef} className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent pr-1">
          <div className="flex flex-col gap-3 py-3">
            {/* Intro bubble when empty */}
            {messages.length === 0 && (
              <div className="mx-auto mt-6 max-w-[85%] rounded-2xl bg-muted px-4 py-3 text-center text-xs text-muted-foreground">
                Hi! I can check product availability, create an order, or list your recent orders. Try: “Is Margherita Pizza available?”
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.role === 'user';
              const content = message.parts
                .map((part) => (part.type === 'text' ? part.text : ''))
                .join('');
              return (
                <div key={message.id} className={isUser ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[85%]'}>
                  <div className={[
                    'rounded-2xl px-4 py-2 text-sm leading-relaxed',
                    isUser ? 'bg-red-500 text-white' : 'bg-muted text-foreground',
                  ].join(' ')}>
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{content}</div>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          h1: (props) => <h1 {...props} className="mb-2 text-base font-semibold" />,
                          h2: (props) => <h2 {...props} className="mb-2 text-sm font-semibold" />,
                          h3: (props) => <h3 {...props} className="mb-2 text-sm font-medium" />,
                          p: (props) => <p {...props} className="mb-2 leading-relaxed" />,
                          a: (props) => (
                            <a
                              {...props}
                              className="text-red-600 underline underline-offset-2 hover:opacity-80"
                              target="_blank"
                              rel="noreferrer noopener"
                            />
                          ),
                          ul: (props) => <ul {...props} className="mb-2 ml-5 list-disc space-y-1" />,
                          ol: (props) => <ol {...props} className="mb-2 ml-5 list-decimal space-y-1" />,
                          li: (props) => <li {...props} className="leading-relaxed" />,
                          blockquote: (props) => (
                            <blockquote
                              {...props}
                              className="mb-2 border-l-2 border-border/60 pl-3 text-muted-foreground"
                            />
                          ),
                          code: ({
                            inline,
                            className,
                            children,
                            ...rest
                          }: { inline?: boolean; className?: string; children?: ReactNode } & HTMLAttributes<HTMLElement>) => {
                            if (inline) {
                              return (
                                <code
                                  {...rest}
                                  className={[
                                    'rounded bg-background/70 px-1 py-0.5 text-[12px] shadow-xs',
                                    className || '',
                                  ].join(' ')}
                                >
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <pre className="mb-2 overflow-x-auto rounded-xl border bg-black/90 p-3 text-[12px] text-white">
                                <code className={[className || '', 'hljs'].join(' ')} {...rest}>
                                  {children}
                                </code>
                              </pre>
                            );
                          },
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>

      <Separator />

      {/* Input */}
      <form
        className="flex items-end gap-2 px-3 sm:px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = input.trim();
          if (!trimmed) return;
          setIsSending(true);
          Promise.resolve(sendMessage({ text: trimmed })).finally(() => setIsSending(false));
          setInput('');
        }}
      >
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 resize-none rounded-xl border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] max-h-28"
          aria-label="Type your message"
        />
        <Button type="submit" className="bg-red-500 hover:bg-red-600" aria-label="Send message" disabled={isSending}>
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </form>

      {/* Subtle progress bar when loading */}
      {isSending && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating response…
          </div>
        </div>
      )}
    </Card>
  );
}


